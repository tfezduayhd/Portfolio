"use client";

import React, { useCallback, useEffect, useRef } from "react";
import {
  Upload,
  ImageIcon,
  Video,
  Download,
  Play,
  Pause,
  RotateCcw,
  Sun,
  Contrast,
  Columns3,
  Type,
  Sparkles,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useAsciiStore,
  CHARSET_PRESETS,
  type CharsetPresetKey,
  type ExportFormat,
} from "@/stores/useAsciiStore";

/* ─── helpers ─────────────────────────────────────────────────────────── */

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function adjustPixel(
  value: number,
  brightness: number,
  contrast: number,
  invert: boolean,
) {
  const brightened = value + brightness;
  const contrasted = (brightened - 128) * (1 + contrast / 100) + 128;
  const normalized = clamp(contrasted, 0, 255);
  return invert ? 255 - normalized : normalized;
}

/* ─── ASCII rendering core ────────────────────────────────────────────── */

interface AsciiCell {
  char: string;
  r: number;
  g: number;
  b: number;
}

function renderAsciiData(
  source: CanvasImageSource,
  srcWidth: number,
  srcHeight: number,
  opts: {
    columns: number;
    brightness: number;
    contrast: number;
    invert: boolean;
    charset: string;
    frameIndex: number;
    animated: boolean;
    colorMode: "mono" | "color";
  },
): AsciiCell[][] {
  const chars = (opts.charset.trim().length > 0 ? opts.charset : CHARSET_PRESETS.standard).split(
    "",
  );
  const safeCols = clamp(opts.columns, 24, 220);
  const ratio = srcHeight / srcWidth;
  const rows = Math.max(1, Math.round(safeCols * ratio * 0.55));

  const canvas = document.createElement("canvas");
  canvas.width = safeCols;
  canvas.height = rows;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return [];

  ctx.drawImage(source, 0, 0, safeCols, rows);
  const pixels = ctx.getImageData(0, 0, safeCols, rows).data;

  const grid: AsciiCell[][] = [];
  for (let y = 0; y < rows; y++) {
    const row: AsciiCell[] = [];
    for (let x = 0; x < safeCols; x++) {
      const i = (y * safeCols + x) * 4;
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      const wave = opts.animated
        ? Math.sin((x + opts.frameIndex * 2) * 0.35) * 10 +
          Math.cos((y + opts.frameIndex * 3) * 0.25) * 8
        : 0;
      const adjusted = adjustPixel(luminance + wave, opts.brightness, opts.contrast, opts.invert);
      const idx = Math.round((adjusted / 255) * (chars.length - 1));
      row.push({ char: chars[idx] ?? " ", r, g, b });
    }
    grid.push(row);
  }
  return grid;
}


/* ─── Canvas-based ASCII renderer ─────────────────────────────────────── */

function paintAsciiToCanvas(
  canvas: HTMLCanvasElement,
  grid: AsciiCell[][],
  fontSize: number,
  colorMode: "mono" | "color",
): void {
  const ctx = canvas.getContext("2d");
  if (!ctx || grid.length === 0) return;

  const charWidth = fontSize * 0.6;
  const lineHeight = fontSize * 0.85;
  const cols = grid[0].length;
  const rows = grid.length;

  canvas.width = Math.ceil(cols * charWidth);
  canvas.height = Math.ceil(rows * lineHeight);

  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.font = `${fontSize}px ui-monospace, "Cascadia Code", "Source Code Pro", Menlo, Consolas, monospace`;
  ctx.textBaseline = "top";

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const cell = grid[y][x];
      ctx.fillStyle =
        colorMode === "color" ? `rgb(${cell.r},${cell.g},${cell.b})` : "#e5e5e5";
      ctx.fillText(cell.char, x * charWidth, y * lineHeight);
    }
  }
}

/* ─── Export utilities ─────────────────────────────────────────────────── */

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function exportImage(canvas: HTMLCanvasElement, format: "png" | "webp") {
  const mimeType = format === "webp" ? "image/webp" : "image/png";
  canvas.toBlob(
    (blob) => {
      if (blob) downloadBlob(blob, `ascii-art.${format}`);
    },
    mimeType,
    0.95,
  );
}

async function exportGif(
  source: CanvasImageSource,
  srcWidth: number,
  srcHeight: number,
  opts: {
    columns: number;
    brightness: number;
    contrast: number;
    invert: boolean;
    charset: string;
    colorMode: "mono" | "color";
    fontSize: number;
    totalFrames: number;
    fps: number;
  },
  onProgress: (p: number) => void,
): Promise<void> {
  const tempCanvas = document.createElement("canvas");
  const frameCount = Math.max(1, opts.totalFrames);
  const delayMs = Math.round(1000 / Math.max(1, opts.fps));

  /* Build all frames as image data */
  const frameBlobs: Blob[] = [];
  for (let i = 0; i < frameCount; i++) {
    const grid = renderAsciiData(source, srcWidth, srcHeight, {
      columns: opts.columns,
      brightness: opts.brightness,
      contrast: opts.contrast,
      invert: opts.invert,
      charset: opts.charset,
      frameIndex: i,
      animated: true,
      colorMode: opts.colorMode,
    });
    paintAsciiToCanvas(tempCanvas, grid, opts.fontSize, opts.colorMode);
    const blob = await new Promise<Blob | null>((resolve) =>
      tempCanvas.toBlob(resolve, "image/png"),
    );
    if (blob) frameBlobs.push(blob);
    onProgress(((i + 1) / frameCount) * 100);
  }

  /*
   * Encode as animated GIF using the Canvas + minimal GIF approach.
   * We encode each frame into the GIF binary manually using a lightweight
   * LZW encoder. This avoids any external dependency.
   */
  const firstGrid = renderAsciiData(source, srcWidth, srcHeight, {
    columns: opts.columns,
    brightness: opts.brightness,
    contrast: opts.contrast,
    invert: opts.invert,
    charset: opts.charset,
    frameIndex: 0,
    animated: true,
    colorMode: opts.colorMode,
  });
  paintAsciiToCanvas(tempCanvas, firstGrid, opts.fontSize, opts.colorMode);
  const width = tempCanvas.width;
  const height = tempCanvas.height;

  const ctx = tempCanvas.getContext("2d")!;
  const frames: ImageData[] = [];
  for (let i = 0; i < frameCount; i++) {
    const grid = renderAsciiData(source, srcWidth, srcHeight, {
      columns: opts.columns,
      brightness: opts.brightness,
      contrast: opts.contrast,
      invert: opts.invert,
      charset: opts.charset,
      frameIndex: i,
      animated: true,
      colorMode: opts.colorMode,
    });
    paintAsciiToCanvas(tempCanvas, grid, opts.fontSize, opts.colorMode);
    frames.push(ctx.getImageData(0, 0, width, height));
  }

  const gifBytes = encodeGif(width, height, frames, delayMs);
  downloadBlob(new Blob([gifBytes.buffer as ArrayBuffer], { type: "image/gif" }), "ascii-art.gif");
}

async function exportMp4(
  source: CanvasImageSource,
  srcWidth: number,
  srcHeight: number,
  opts: {
    columns: number;
    brightness: number;
    contrast: number;
    invert: boolean;
    charset: string;
    colorMode: "mono" | "color";
    fontSize: number;
    totalFrames: number;
    fps: number;
  },
  onProgress: (p: number) => void,
): Promise<void> {
  const tempCanvas = document.createElement("canvas");
  const frameCount = Math.max(1, opts.totalFrames);
  const frameDuration = 1000 / Math.max(1, opts.fps);

  /* Pre-render first frame to set canvas dimensions */
  const firstGrid = renderAsciiData(source, srcWidth, srcHeight, {
    columns: opts.columns,
    brightness: opts.brightness,
    contrast: opts.contrast,
    invert: opts.invert,
    charset: opts.charset,
    frameIndex: 0,
    animated: true,
    colorMode: opts.colorMode,
  });
  paintAsciiToCanvas(tempCanvas, firstGrid, opts.fontSize, opts.colorMode);

  /* Use MediaRecorder API for MP4/WebM capture */
  const stream = tempCanvas.captureStream(0);
  const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
    ? "video/webm;codecs=vp9"
    : "video/webm";
  const recorder = new MediaRecorder(stream, { mimeType });
  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  const done = new Promise<void>((resolve) => {
    recorder.onstop = () => {
      const ext = "webm";
      downloadBlob(new Blob(chunks, { type: "video/webm" }), `ascii-art.${ext}`);
      resolve();
    };
  });

  recorder.start();
  const track = stream.getVideoTracks()[0];

  for (let i = 0; i < frameCount; i++) {
    const grid = renderAsciiData(source, srcWidth, srcHeight, {
      columns: opts.columns,
      brightness: opts.brightness,
      contrast: opts.contrast,
      invert: opts.invert,
      charset: opts.charset,
      frameIndex: i,
      animated: true,
      colorMode: opts.colorMode,
    });
    paintAsciiToCanvas(tempCanvas, grid, opts.fontSize, opts.colorMode);

    /* Request a new frame from the stream */
    if ("requestFrame" in track && typeof (track as Record<string, unknown>).requestFrame === "function") {
      (track as Record<string, () => void>).requestFrame();
    }
    await new Promise((r) => setTimeout(r, frameDuration));
    onProgress(((i + 1) / frameCount) * 100);
  }

  recorder.stop();
  await done;
}

/* ─── Minimal GIF encoder (no dependencies) ───────────────────────────── */

function encodeGif(
  width: number,
  height: number,
  frames: ImageData[],
  delayMs: number,
): Uint8Array {
  /*
   * Quantise each frame to a 256-colour palette, then LZW-compress.
   * Uses a median-cut–style fast quantiser.  Good enough for ASCII art where
   * the number of unique colours is usually very small.
   */
  const out: number[] = [];

  /* Header */
  writeStr(out, "GIF89a");
  /* Logical Screen Descriptor */
  writeU16(out, width);
  writeU16(out, height);
  out.push(0x70, 0x00, 0x00); // no GCT, 8-bit colour depth, bg=0, aspect=0

  /* Netscape looping extension */
  out.push(0x21, 0xff, 0x0b);
  writeStr(out, "NETSCAPE2.0");
  out.push(0x03, 0x01);
  writeU16(out, 0); // loop forever
  out.push(0x00);

  for (const frame of frames) {
    const { palette, indexed } = quantise(frame.data, width, height);

    /* Graphic Control Extension */
    out.push(0x21, 0xf9, 0x04, 0x00);
    writeU16(out, Math.round(delayMs / 10)); // delay in 1/100s
    out.push(0x00, 0x00); // transparent index, terminator

    /* Image Descriptor */
    out.push(0x2c);
    writeU16(out, 0); // left
    writeU16(out, 0); // top
    writeU16(out, width);
    writeU16(out, height);
    out.push(0x87); // local colour table, 256 entries (2^(7+1))

    /* Local Colour Table */
    for (let i = 0; i < 256; i++) {
      out.push(palette[i * 3] ?? 0, palette[i * 3 + 1] ?? 0, palette[i * 3 + 2] ?? 0);
    }

    /* LZW image data */
    const minCodeSize = 8;
    out.push(minCodeSize);
    const lzw = lzwEncode(indexed, minCodeSize);
    /* Split into sub-blocks of ≤255 bytes */
    let offset = 0;
    while (offset < lzw.length) {
      const size = Math.min(255, lzw.length - offset);
      out.push(size);
      for (let i = 0; i < size; i++) out.push(lzw[offset + i]);
      offset += size;
    }
    out.push(0x00); // block terminator
  }

  out.push(0x3b); // GIF trailer
  return new Uint8Array(out);
}

function writeStr(out: number[], s: string) {
  for (let i = 0; i < s.length; i++) out.push(s.charCodeAt(i));
}

function writeU16(out: number[], v: number) {
  out.push(v & 0xff, (v >> 8) & 0xff);
}

function quantise(
  rgba: Uint8ClampedArray,
  width: number,
  height: number,
): { palette: Uint8Array; indexed: Uint8Array } {
  /* Build histogram of unique colours (downsampled to 5-bit per channel) */
  const colourMap = new Map<number, { r: number; g: number; b: number; count: number }>();
  const total = width * height;

  for (let i = 0; i < total; i++) {
    const off = i * 4;
    const r = rgba[off];
    const g = rgba[off + 1];
    const b = rgba[off + 2];
    const key = ((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3);
    const e = colourMap.get(key);
    if (e) {
      e.count++;
    } else {
      colourMap.set(key, { r, g, b, count: 1 });
    }
  }

  /* Pick the 256 most frequent colours */
  const entries = Array.from(colourMap.values()).sort((a, b) => b.count - a.count);
  const paletteSize = 256;
  const palColours = entries.slice(0, paletteSize);
  while (palColours.length < paletteSize) palColours.push({ r: 0, g: 0, b: 0, count: 0 });

  const palette = new Uint8Array(paletteSize * 3);
  for (let i = 0; i < paletteSize; i++) {
    palette[i * 3] = palColours[i].r;
    palette[i * 3 + 1] = palColours[i].g;
    palette[i * 3 + 2] = palColours[i].b;
  }

  /* Map each pixel to nearest palette entry */
  const indexed = new Uint8Array(total);
  for (let i = 0; i < total; i++) {
    const off = i * 4;
    const r = rgba[off];
    const g = rgba[off + 1];
    const b = rgba[off + 2];
    let best = 0;
    let bestDist = Infinity;
    for (let p = 0; p < paletteSize; p++) {
      const dr = r - palColours[p].r;
      const dg = g - palColours[p].g;
      const db = b - palColours[p].b;
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

function lzwEncode(indexed: Uint8Array, minCodeSize: number): number[] {
  const clearCode = 1 << minCodeSize;
  const eoiCode = clearCode + 1;
  let codeSize = minCodeSize + 1;
  let nextCode = eoiCode + 1;
  const maxTableSize = 4096;

  const output: number[] = [];
  let bits = 0;
  let bitCount = 0;

  function emit(code: number) {
    bits |= code << bitCount;
    bitCount += codeSize;
    while (bitCount >= 8) {
      output.push(bits & 0xff);
      bits >>= 8;
      bitCount -= 8;
    }
  }

  let table = new Map<string, number>();

  function resetTable() {
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
      /* Emit current prefix code */
      const parts = current.split(",");
      if (parts.length === 1) {
        emit(Number(parts[0]));
      } else {
        emit(table.get(current)!);
      }

      if (nextCode < maxTableSize) {
        table.set(combined, nextCode++);
        if (nextCode > (1 << codeSize) && codeSize < 12) {
          codeSize++;
        }
      } else {
        emit(clearCode);
        resetTable();
      }
      current = next;
    }
  }

  /* Emit remaining */
  const parts = current.split(",");
  if (parts.length === 1) {
    emit(Number(parts[0]));
  } else {
    emit(table.get(current)!);
  }

  emit(eoiCode);
  if (bitCount > 0) output.push(bits & 0xff);

  return output;
}

/* ═══════════════════════════════════════════════════════════════════════ */
/* ─── Component ───────────────────────────────────────────────────────── */
/* ═══════════════════════════════════════════════════════════════════════ */

export default function AsciiImageStudio() {
  /* ── Zustand store ──────────────────────────────── */
  const store = useAsciiStore();

  /* ── Refs ───────────────────────────────────────── */
  const imageRef = useRef<HTMLImageElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const outputCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number>(0);
  const videoTimerRef = useRef<number | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ── Paint loop ─────────────────────────────────── */
  const paint = useCallback(() => {
    const canvas = outputCanvasRef.current;
    if (!canvas) return;

    let source: CanvasImageSource | null = null;
    let w = 0;
    let h = 0;

    if (store.mediaType === "image" && imageRef.current) {
      source = imageRef.current;
      w = imageRef.current.naturalWidth;
      h = imageRef.current.naturalHeight;
    } else if (store.mediaType === "video" && videoRef.current) {
      source = videoRef.current;
      w = videoRef.current.videoWidth;
      h = videoRef.current.videoHeight;
    }

    if (!source || w === 0 || h === 0) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        canvas.width = 400;
        canvas.height = 200;
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, 400, 200);
        ctx.fillStyle = "#737373";
        ctx.font = "14px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("Import an image or video to generate ASCII art.", 200, 100);
      }
      return;
    }

    const grid = renderAsciiData(source, w, h, {
      columns: store.columns,
      brightness: store.brightness,
      contrast: store.contrast,
      invert: store.invert,
      charset: store.charset,
      frameIndex: store.animate ? store.currentFrame : 0,
      animated: store.animate,
      colorMode: store.colorMode,
    });
    paintAsciiToCanvas(canvas, grid, store.fontSize, store.colorMode);
  }, [store]);

  /* ── Animation timer ────────────────────────────── */
  useEffect(() => {
    if (!store.animate || store.mediaType !== "image") return;
    const timer = window.setInterval(() => {
      const s = useAsciiStore.getState();
      s.setCurrentFrame((s.currentFrame + 1) % Math.max(1, s.totalFrames));
    }, 1000 / Math.max(1, store.fps));
    return () => window.clearInterval(timer);
  }, [store.animate, store.fps, store.mediaType]);

  /* ── Repaint on any parameter change ────────────── */
  useEffect(() => {
    animFrameRef.current = requestAnimationFrame(paint);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [paint, store.columns, store.brightness, store.contrast, store.invert, store.colorMode, store.fontSize, store.charset, store.animate, store.currentFrame]);

  /* ── Video frame ticker ─────────────────────────── */
  useEffect(() => {
    if (store.mediaType !== "video" || !store.videoPlaying) return;
    videoTimerRef.current = window.setInterval(() => {
      requestAnimationFrame(paint);
    }, 1000 / 30);
    return () => window.clearInterval(videoTimerRef.current);
  }, [store.mediaType, store.videoPlaying, paint]);

  /* ── File upload handler ────────────────────────── */
  const handleUpload = useCallback(
    (file?: File) => {
      if (!file) return;

      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = () => {
          const src = reader.result;
          if (typeof src !== "string") return;
          const img = new Image();
          img.onload = () => {
            imageRef.current = img;
            videoRef.current = null;
            store.setMedia("image", src);
          };
          img.src = src;
        };
        reader.readAsDataURL(file);
      } else if (file.type.startsWith("video/")) {
        const url = URL.createObjectURL(file);
        const vid = document.createElement("video");
        vid.muted = true;
        vid.playsInline = true;
        vid.preload = "auto";
        vid.src = url;
        vid.onloadeddata = () => {
          videoRef.current = vid;
          imageRef.current = null;
          store.setMedia("video", url);
          requestAnimationFrame(paint);
        };
      }
    },
    [store, paint],
  );

  /* ── Video play / pause ─────────────────────────── */
  const toggleVideoPlayback = useCallback(() => {
    const vid = videoRef.current;
    if (!vid) return;
    if (store.videoPlaying) {
      vid.pause();
      store.setVideoPlaying(false);
    } else {
      vid.play();
      store.setVideoPlaying(true);
    }
  }, [store]);

  /* ── Export handlers ────────────────────────────── */
  const handleExport = useCallback(
    async (format: ExportFormat) => {
      const canvas = outputCanvasRef.current;
      if (!canvas) return;

      let source: CanvasImageSource | null = null;
      let w = 0;
      let h = 0;
      if (store.mediaType === "image" && imageRef.current) {
        source = imageRef.current;
        w = imageRef.current.naturalWidth;
        h = imageRef.current.naturalHeight;
      } else if (store.mediaType === "video" && videoRef.current) {
        source = videoRef.current;
        w = videoRef.current.videoWidth;
        h = videoRef.current.videoHeight;
      }

      if (!source || w === 0) return;

      if (format === "png" || format === "webp") {
        exportImage(canvas, format);
        return;
      }

      store.setExporting(true);
      try {
        if (format === "gif") {
          await exportGif(source, w, h, {
            columns: store.columns,
            brightness: store.brightness,
            contrast: store.contrast,
            invert: store.invert,
            charset: store.charset,
            colorMode: store.colorMode,
            fontSize: store.fontSize,
            totalFrames: store.totalFrames,
            fps: store.fps,
          }, (p) => store.setExportProgress(p));
        } else if (format === "mp4") {
          await exportMp4(source, w, h, {
            columns: store.columns,
            brightness: store.brightness,
            contrast: store.contrast,
            invert: store.invert,
            charset: store.charset,
            colorMode: store.colorMode,
            fontSize: store.fontSize,
            totalFrames: store.totalFrames,
            fps: store.fps,
          }, (p) => store.setExportProgress(p));
        }
      } finally {
        store.setExporting(false);
      }
    },
    [store],
  );

  /* ── Derived state ──────────────────────────────── */
  const hasMedia = store.mediaType !== null;

  /* ═══════════════════════════════════════════════════════════════════ */
  /* ─── Render ────────────────────────────────────────────────────── */
  /* ═══════════════════════════════════════════════════════════════════ */
  return (
    <div className="space-y-6">
      <p className="text-sm text-neutral-400">
        Convert any image or video to ASCII art in real time. Tune the render style, toggle colour
        mode, animate the output, then export as PNG, WebP, GIF, or MP4.
      </p>

      {/* ── Toolbar ─────────────────────────────────── */}
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
          <Upload className="h-4 w-4" />
          Import media
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={(e) => handleUpload(e.target.files?.[0])}
        />

        {store.mediaType === "video" && (
          <Button variant="outline" size="sm" onClick={toggleVideoPlayback}>
            {store.videoPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {store.videoPlaying ? "Pause" : "Play"}
          </Button>
        )}

        <div className="flex gap-1 ml-auto">
          {(["png", "webp", "gif", "mp4"] as ExportFormat[]).map((fmt) => (
            <Button
              key={fmt}
              variant="secondary"
              size="sm"
              disabled={!hasMedia || store.exporting}
              onClick={() => handleExport(fmt)}
            >
              <Download className="h-3.5 w-3.5" />
              {fmt.toUpperCase()}
            </Button>
          ))}
        </div>

        <Button variant="ghost" size="icon" onClick={store.reset} title="Reset all settings">
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      {/* ── Export progress ──────────────────────────── */}
      {store.exporting && (
        <div className="flex items-center gap-3 text-sm text-neutral-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          Exporting… {Math.round(store.exportProgress)}%
          <div className="flex-1 h-1.5 rounded-full bg-neutral-800 overflow-hidden">
            <div
              className="h-full bg-indigo-500 transition-all duration-200"
              style={{ width: `${store.exportProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* ── Main layout ─────────────────────────────── */}
      <div className="grid lg:grid-cols-[320px_1fr] gap-6">
        {/* ── Controls panel ────────────────────────── */}
        <div className="space-y-5">
          {/* Columns */}
          <ControlRow icon={<Columns3 className="h-3.5 w-3.5" />} label={`Columns: ${store.columns}`}>
            <Slider
              min={24}
              max={220}
              step={1}
              value={[store.columns]}
              onValueChange={([v]) => store.setColumns(v)}
            />
          </ControlRow>

          {/* Brightness */}
          <ControlRow icon={<Sun className="h-3.5 w-3.5" />} label={`Brightness: ${store.brightness}`}>
            <Slider
              min={-100}
              max={100}
              step={1}
              value={[store.brightness]}
              onValueChange={([v]) => store.setBrightness(v)}
            />
          </ControlRow>

          {/* Contrast */}
          <ControlRow icon={<Contrast className="h-3.5 w-3.5" />} label={`Contrast: ${store.contrast}`}>
            <Slider
              min={-100}
              max={100}
              step={1}
              value={[store.contrast]}
              onValueChange={([v]) => store.setContrast(v)}
            />
          </ControlRow>

          {/* Font size */}
          <ControlRow icon={<Type className="h-3.5 w-3.5" />} label={`Font size: ${store.fontSize}px`}>
            <Slider
              min={4}
              max={16}
              step={1}
              value={[store.fontSize]}
              onValueChange={([v]) => store.setFontSize(v)}
            />
          </ControlRow>

          {/* Charset preset */}
          <div>
            <Label className="flex items-center gap-1.5 mb-2">
              <Sparkles className="h-3.5 w-3.5" /> Charset preset
            </Label>
            <Select
              value={store.charsetPreset}
              onValueChange={(v) => store.setCharsetPreset(v as CharsetPresetKey)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(CHARSET_PRESETS).map((k) => (
                  <SelectItem key={k} value={k}>
                    {k}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Custom charset */}
          <div>
            <Label className="mb-2 block">Custom charset (left = darkest)</Label>
            <input
              value={store.charset}
              onChange={(e) => store.setCharset(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-neutral-700 bg-neutral-950 text-neutral-200 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Toggles */}
          <div className="flex flex-wrap items-center gap-4">
            <ToggleRow label="Invert" checked={store.invert} onChange={store.setInvert} />
            <ToggleRow
              label="Color"
              checked={store.colorMode === "color"}
              onChange={(v) => store.setColorMode(v ? "color" : "mono")}
            />
            {store.mediaType === "image" && (
              <ToggleRow label="Animate" checked={store.animate} onChange={store.setAnimate} />
            )}
          </div>

          {/* Animation controls */}
          {store.animate && store.mediaType === "image" && (
            <div className="space-y-4 rounded-lg border border-neutral-800 bg-neutral-950/50 p-4">
              <ControlRow icon={null} label={`FPS: ${store.fps}`}>
                <Slider
                  min={2}
                  max={24}
                  step={1}
                  value={[store.fps]}
                  onValueChange={([v]) => store.setFps(v)}
                />
              </ControlRow>
              <ControlRow icon={null} label={`Frames: ${store.totalFrames}`}>
                <Slider
                  min={4}
                  max={64}
                  step={1}
                  value={[store.totalFrames]}
                  onValueChange={([v]) => store.setTotalFrames(v)}
                />
              </ControlRow>
            </div>
          )}
        </div>

        {/* ── Canvas output ─────────────────────────── */}
        <div className="rounded-xl border border-neutral-800 bg-black p-2 overflow-auto max-h-[36rem] flex items-start justify-center">
          <canvas
            ref={outputCanvasRef}
            className="max-w-full"
            style={{ imageRendering: "pixelated" }}
          />
        </div>
      </div>

      {/* ── Media type indicator ────────────────────── */}
      {hasMedia && (
        <div className="flex items-center gap-2 text-xs text-neutral-500">
          {store.mediaType === "image" ? (
            <ImageIcon className="h-3.5 w-3.5" />
          ) : (
            <Video className="h-3.5 w-3.5" />
          )}
          Source: {store.mediaType}
        </div>
      )}
    </div>
  );
}

/* ─── Sub-components ──────────────────────────────────────────────────── */

function ControlRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label className="flex items-center gap-1.5 mb-2">
        {icon} {label}
      </Label>
      {children}
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Switch checked={checked} onCheckedChange={onChange} />
      <Label className="text-sm text-neutral-300 normal-case tracking-normal">{label}</Label>
    </div>
  );
}
