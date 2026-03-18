/* ═══════════════════════════════════════════════════════════════════════════
 * Minimal Animated-GIF Encoder (zero dependencies)
 *
 * Converts an array of ImageData frames into a valid GIF89a binary.
 * Uses frequency-based colour quantisation and LZW compression.
 * ═══════════════════════════════════════════════════════════════════════════ */

/* ── Byte-level helpers ───────────────────────────────────────────────── */

function pushStr(out: number[], s: string): void {
  for (let i = 0; i < s.length; i++) out.push(s.charCodeAt(i));
}

function pushU16(out: number[], v: number): void {
  out.push(v & 0xff, (v >> 8) & 0xff);
}

/* ── Colour quantisation ──────────────────────────────────────────────── */

interface QuantiseResult {
  palette: Uint8Array;
  indexed: Uint8Array;
}

/**
 * Reduce an RGBA buffer to a 256-colour indexed image.
 * Strategy: pick the 256 most frequent colours (down-sampled to 5 bits
 * per channel for bucketing), then map every pixel to its nearest match.
 */
function quantise(
  rgba: Uint8ClampedArray,
  width: number,
  height: number,
): QuantiseResult {
  const total = width * height;

  /* Build colour histogram */
  const map = new Map<
    number,
    { r: number; g: number; b: number; count: number }
  >();
  for (let i = 0; i < total; i++) {
    const off = i * 4;
    const r = rgba[off];
    const g = rgba[off + 1];
    const b = rgba[off + 2];
    const key = ((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3);
    const entry = map.get(key);
    if (entry) {
      entry.count++;
    } else {
      map.set(key, { r, g, b, count: 1 });
    }
  }

  /* Select the 256 most common colours */
  const sorted = Array.from(map.values()).sort((a, b) => b.count - a.count);
  const PALETTE_SIZE = 256;
  const palEntries = sorted.slice(0, PALETTE_SIZE);
  while (palEntries.length < PALETTE_SIZE)
    palEntries.push({ r: 0, g: 0, b: 0, count: 0 });

  const palette = new Uint8Array(PALETTE_SIZE * 3);
  for (let i = 0; i < PALETTE_SIZE; i++) {
    palette[i * 3] = palEntries[i].r;
    palette[i * 3 + 1] = palEntries[i].g;
    palette[i * 3 + 2] = palEntries[i].b;
  }

  /* Map every pixel to nearest palette entry */
  const indexed = new Uint8Array(total);
  for (let i = 0; i < total; i++) {
    const off = i * 4;
    const r = rgba[off];
    const g = rgba[off + 1];
    const b = rgba[off + 2];
    let best = 0;
    let bestDist = Infinity;
    for (let p = 0; p < PALETTE_SIZE; p++) {
      const dr = r - palEntries[p].r;
      const dg = g - palEntries[p].g;
      const db = b - palEntries[p].b;
      const d = dr * dr + dg * dg + db * db;
      if (d < bestDist) {
        bestDist = d;
        best = p;
        if (d === 0) break;
      }
    }
    indexed[i] = best;
  }

  return { palette, indexed };
}

/* ── LZW encoder ──────────────────────────────────────────────────────── */

function lzwEncode(indexed: Uint8Array, minCodeSize: number): number[] {
  const clearCode = 1 << minCodeSize;
  const eoiCode = clearCode + 1;
  let codeSize = minCodeSize + 1;
  let nextCode = eoiCode + 1;
  const MAX_TABLE = 4096;

  const output: number[] = [];
  let bits = 0;
  let bitCount = 0;

  function emit(code: number): void {
    bits |= code << bitCount;
    bitCount += codeSize;
    while (bitCount >= 8) {
      output.push(bits & 0xff);
      bits >>= 8;
      bitCount -= 8;
    }
  }

  let table = new Map<string, number>();

  function resetTable(): void {
    table = new Map();
    codeSize = minCodeSize + 1;
    nextCode = eoiCode + 1;
  }

  resetTable();
  emit(clearCode);

  let current = String(indexed[0]);
  for (let i = 1; i < indexed.length; i++) {
    const next = String(indexed[i]);
    const combined = current + "," + next;
    if (table.has(combined)) {
      current = combined;
    } else {
      const parts = current.split(",");
      emit(parts.length === 1 ? Number(parts[0]) : table.get(current)!);

      if (nextCode < MAX_TABLE) {
        table.set(combined, nextCode++);
        if (nextCode > 1 << codeSize && codeSize < 12) codeSize++;
      } else {
        emit(clearCode);
        resetTable();
      }
      current = next;
    }
  }

  /* Flush remaining */
  const parts = current.split(",");
  emit(parts.length === 1 ? Number(parts[0]) : table.get(current)!);
  emit(eoiCode);
  if (bitCount > 0) output.push(bits & 0xff);

  return output;
}

/* ── Public API ───────────────────────────────────────────────────────── */

/**
 * Encode an array of ImageData frames into an animated GIF89a binary.
 *
 * @param width       Frame width in pixels.
 * @param height      Frame height in pixels.
 * @param frames      Array of ImageData (all must be `width × height`).
 * @param delayMs     Inter-frame delay in milliseconds.
 * @returns           A Uint8Array containing the complete GIF file.
 */
export function encodeGif(
  width: number,
  height: number,
  frames: ImageData[],
  delayMs: number,
): Uint8Array {
  const out: number[] = [];

  /* GIF89a header */
  pushStr(out, "GIF89a");

  /* Logical Screen Descriptor (no global colour table) */
  pushU16(out, width);
  pushU16(out, height);
  out.push(0x70, 0x00, 0x00);

  /* Netscape 2.0 looping extension – loop forever */
  out.push(0x21, 0xff, 0x0b);
  pushStr(out, "NETSCAPE2.0");
  out.push(0x03, 0x01);
  pushU16(out, 0);
  out.push(0x00);

  for (const frame of frames) {
    const { palette, indexed } = quantise(frame.data, width, height);

    /* Graphic Control Extension */
    out.push(0x21, 0xf9, 0x04, 0x00);
    pushU16(out, Math.round(delayMs / 10));
    out.push(0x00, 0x00);

    /* Image Descriptor */
    out.push(0x2c);
    pushU16(out, 0);
    pushU16(out, 0);
    pushU16(out, width);
    pushU16(out, height);
    out.push(0x87); // local table, 256 entries

    /* Local Colour Table */
    for (let i = 0; i < 256; i++) {
      out.push(
        palette[i * 3] ?? 0,
        palette[i * 3 + 1] ?? 0,
        palette[i * 3 + 2] ?? 0,
      );
    }

    /* LZW image data */
    const MIN_CODE = 8;
    out.push(MIN_CODE);
    const lzw = lzwEncode(indexed, MIN_CODE);
    let offset = 0;
    while (offset < lzw.length) {
      const size = Math.min(255, lzw.length - offset);
      out.push(size);
      for (let j = 0; j < size; j++) out.push(lzw[offset + j]);
      offset += size;
    }
    out.push(0x00);
  }

  out.push(0x3b); // trailer
  return new Uint8Array(out);
}
