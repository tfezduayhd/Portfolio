/* ═══════════════════════════════════════════════════════════════════════════
 * ASCII Art Generator – Canvas Rendering Engine
 *
 * Pure functions responsible for:
 *  1. Converting a CanvasImageSource into a grid of AsciiCell[][]
 *  2. Painting that grid onto an HTMLCanvasElement
 * ═══════════════════════════════════════════════════════════════════════════ */

import { CHARSET_PRESETS, type AsciiCell, type ColorMode, type RenderOptions } from "./types";

/* ── Numeric helpers ──────────────────────────────────────────────────── */

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

/**
 * Apply brightness, contrast and optional inversion to a single luminance
 * value (0-255).
 */
function adjustPixel(
  value: number,
  brightness: number,
  contrast: number,
  invert: boolean,
): number {
  const bright = value + brightness;
  const contrasted = (bright - 128) * (1 + contrast / 100) + 128;
  const clamped = clamp(contrasted, 0, 255);
  return invert ? 255 - clamped : clamped;
}

/* ── ASCII data generation ────────────────────────────────────────────── */

/**
 * Samples the source image at the target ASCII resolution, computes
 * luminance per pixel, and maps each sample to a character + colour.
 */
export function renderAsciiData(
  source: CanvasImageSource,
  srcW: number,
  srcH: number,
  opts: RenderOptions,
): AsciiCell[][] {
  const chars = (opts.charset.trim() || CHARSET_PRESETS.standard).split("");
  const cols = clamp(opts.columns, 24, 220);
  const rows = Math.max(1, Math.round(cols * (srcH / srcW) * 0.55));

  /* Down-sample source into a tiny canvas */
  const scratch = document.createElement("canvas");
  scratch.width = cols;
  scratch.height = rows;
  const ctx = scratch.getContext("2d", { willReadFrequently: true });
  if (!ctx) return [];

  ctx.drawImage(source, 0, 0, cols, rows);
  const px = ctx.getImageData(0, 0, cols, rows).data;

  const grid: AsciiCell[][] = [];
  for (let y = 0; y < rows; y++) {
    const row: AsciiCell[] = [];
    for (let x = 0; x < cols; x++) {
      const offset = (y * cols + x) * 4;
      const r = px[offset];
      const g = px[offset + 1];
      const b = px[offset + 2];

      /* BT.709 luminance */
      const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;

      /* Optional sine-wave animation */
      const wave = opts.animated
        ? Math.sin((x + opts.frameIndex * 2) * 0.35) * 10 +
          Math.cos((y + opts.frameIndex * 3) * 0.25) * 8
        : 0;

      const adjusted = adjustPixel(
        luma + wave,
        opts.brightness,
        opts.contrast,
        opts.invert,
      );

      const idx = Math.round((adjusted / 255) * (chars.length - 1));
      row.push({ char: chars[idx] ?? " ", r, g, b });
    }
    grid.push(row);
  }
  return grid;
}

/* ── Canvas painter ───────────────────────────────────────────────────── */

const MONO_FONT =
  'ui-monospace, "Cascadia Code", "Source Code Pro", Menlo, Consolas, monospace';

/**
 * Draws an ASCII grid onto the provided canvas with the chosen font size
 * and colour mode.
 */
export function paintAsciiToCanvas(
  canvas: HTMLCanvasElement,
  grid: AsciiCell[][],
  fontSize: number,
  colorMode: ColorMode,
): void {
  const ctx = canvas.getContext("2d");
  if (!ctx || grid.length === 0) return;

  const charW = fontSize * 0.6;
  const lineH = fontSize * 0.85;
  const cols = grid[0].length;
  const rows = grid.length;

  canvas.width = Math.ceil(cols * charW);
  canvas.height = Math.ceil(rows * lineH);

  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.font = `${fontSize}px ${MONO_FONT}`;
  ctx.textBaseline = "top";

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const cell = grid[y][x];
      ctx.fillStyle =
        colorMode === "color"
          ? `rgb(${cell.r},${cell.g},${cell.b})`
          : "#e5e5e5";
      ctx.fillText(cell.char, x * charW, y * lineH);
    }
  }
}
