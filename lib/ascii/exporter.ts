/* ═══════════════════════════════════════════════════════════════════════════
 * ASCII Art Generator – Export Utilities
 *
 * Handles PNG / WebP / GIF / MP4 (WebM) export from the ASCII canvas.
 * ═══════════════════════════════════════════════════════════════════════════ */

import { encodeGif } from "./gif-encoder";
import { paintAsciiToCanvas, renderAsciiData } from "./renderer";
import type { AnimatedExportOptions } from "./types";

/* ── Generic download helper ──────────────────────────────────────────── */

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

/* ── Static image export (PNG / WebP) ─────────────────────────────────── */

export function exportImage(
  canvas: HTMLCanvasElement,
  format: "png" | "webp",
): void {
  const mime = format === "webp" ? "image/webp" : "image/png";
  canvas.toBlob(
    (blob) => {
      if (blob) downloadBlob(blob, `ascii-art.${format}`);
    },
    mime,
    0.95,
  );
}

/* ── Animated GIF export ──────────────────────────────────────────────── */

export async function exportGif(
  source: CanvasImageSource,
  srcW: number,
  srcH: number,
  opts: AnimatedExportOptions,
  onProgress: (pct: number) => void,
): Promise<void> {
  const scratch = document.createElement("canvas");
  const frameCount = Math.max(1, opts.totalFrames);
  const delayMs = Math.round(1000 / Math.max(1, opts.fps));

  const ctx = scratch.getContext("2d")!;
  const imageFrames: ImageData[] = [];

  for (let i = 0; i < frameCount; i++) {
    const grid = renderAsciiData(source, srcW, srcH, {
      columns: opts.columns,
      brightness: opts.brightness,
      contrast: opts.contrast,
      invert: opts.invert,
      charset: opts.charset,
      frameIndex: i,
      animated: true,
      colorMode: opts.colorMode,
    });
    paintAsciiToCanvas(scratch, grid, opts.fontSize, opts.colorMode);
    imageFrames.push(ctx.getImageData(0, 0, scratch.width, scratch.height));
    onProgress(((i + 1) / frameCount) * 100);
  }

  const gifBytes = encodeGif(
    scratch.width,
    scratch.height,
    imageFrames,
    delayMs,
  );
  downloadBlob(
    new Blob([gifBytes.buffer as ArrayBuffer], { type: "image/gif" }),
    "ascii-art.gif",
  );
}

/* ── Video export (WebM via MediaRecorder) ────────────────────────────── */

export async function exportVideo(
  source: CanvasImageSource,
  srcW: number,
  srcH: number,
  opts: AnimatedExportOptions,
  onProgress: (pct: number) => void,
): Promise<void> {
  const scratch = document.createElement("canvas");
  const frameCount = Math.max(1, opts.totalFrames);
  const frameDuration = 1000 / Math.max(1, opts.fps);

  /* Pre-render the first frame so the canvas has dimensions */
  const firstGrid = renderAsciiData(source, srcW, srcH, {
    columns: opts.columns,
    brightness: opts.brightness,
    contrast: opts.contrast,
    invert: opts.invert,
    charset: opts.charset,
    frameIndex: 0,
    animated: true,
    colorMode: opts.colorMode,
  });
  paintAsciiToCanvas(scratch, firstGrid, opts.fontSize, opts.colorMode);

  const stream = scratch.captureStream(0);
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
      downloadBlob(
        new Blob(chunks, { type: "video/webm" }),
        "ascii-art.webm",
      );
      resolve();
    };
  });

  recorder.start();
  const track = stream.getVideoTracks()[0];

  for (let i = 0; i < frameCount; i++) {
    const grid = renderAsciiData(source, srcW, srcH, {
      columns: opts.columns,
      brightness: opts.brightness,
      contrast: opts.contrast,
      invert: opts.invert,
      charset: opts.charset,
      frameIndex: i,
      animated: true,
      colorMode: opts.colorMode,
    });
    paintAsciiToCanvas(scratch, grid, opts.fontSize, opts.colorMode);

    if (
      "requestFrame" in track &&
      typeof (track as Record<string, unknown>).requestFrame === "function"
    ) {
      (track as Record<string, () => void>).requestFrame();
    }
    await new Promise((r) => setTimeout(r, frameDuration));
    onProgress(((i + 1) / frameCount) * 100);
  }

  recorder.stop();
  await done;
}
