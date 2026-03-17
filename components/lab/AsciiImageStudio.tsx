"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

const DEFAULT_CHARSET = " .:-=+*#%@";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function adjustPixel(value: number, brightness: number, contrast: number, invert: boolean) {
  const brightened = value + brightness;
  const contrasted = (brightened - 128) * (1 + contrast / 100) + 128;
  const normalized = clamp(contrasted, 0, 255);
  return invert ? 255 - normalized : normalized;
}

export default function AsciiImageStudio() {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [columns, setColumns] = useState(96);
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [invert, setInvert] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [fps, setFps] = useState(10);
  const [frames, setFrames] = useState(20);
  const [frame, setFrame] = useState(0);
  const [charset, setCharset] = useState(DEFAULT_CHARSET);

  useEffect(() => {
    if (!animate || !image) return;
    const timer = window.setInterval(() => {
      setFrame((prev) => (prev + 1) % Math.max(1, frames));
    }, 1000 / Math.max(1, fps));
    return () => window.clearInterval(timer);
  }, [animate, fps, frames, image]);

  const renderAscii = useCallback((targetFrame: number, animated: boolean) => {
    if (!image) return "";
    const chars = (charset.trim().length ? charset : DEFAULT_CHARSET).split("");
    const safeColumns = clamp(columns, 24, 220);
    const ratio = image.height / image.width;
    const rows = Math.max(1, Math.round(safeColumns * ratio * 0.55));
    const canvas = document.createElement("canvas");
    canvas.width = safeColumns;
    canvas.height = rows;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "";
    ctx.drawImage(image, 0, 0, safeColumns, rows);
    const pixels = ctx.getImageData(0, 0, safeColumns, rows).data;

    const lines: string[] = [];
    for (let y = 0; y < rows; y += 1) {
      let line = "";
      for (let x = 0; x < safeColumns; x += 1) {
        const i = (y * safeColumns + x) * 4;
        const luminance = 0.2126 * pixels[i] + 0.7152 * pixels[i + 1] + 0.0722 * pixels[i + 2];
        const wave = animated ? Math.sin((x + targetFrame * 2) * 0.35) * 10 + Math.cos((y + targetFrame * 3) * 0.25) * 8 : 0;
        const adjusted = adjustPixel(luminance + wave, brightness, contrast, invert);
        const index = Math.round((adjusted / 255) * (chars.length - 1));
        line += chars[index] ?? " ";
      }
      lines.push(line);
    }
    return lines.join("\n");
  }, [brightness, charset, columns, contrast, image, invert]);

  const ascii = useMemo(() => {
    return renderAscii(animate ? frame : 0, animate);
  }, [animate, frame, renderAscii]);

  const handleUpload = (file?: File) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      const src = reader.result;
      if (typeof src !== "string") return;
      const img = new Image();
      img.onload = () => {
        setImage(img);
        setFrame(0);
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  const download = (content: string, fileName: string, type: string) => {
    if (!content) return;
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportTxt = () => download(ascii, "ascii-art.txt", "text/plain");
  const exportHtml = () =>
    download(
      `<pre style="font-family:ui-monospace,Menlo,Consolas,monospace;line-height:1.05;white-space:pre;">${ascii
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")}</pre>`,
      "ascii-art.html",
      "text/html",
    );
  const exportFrames = () => {
    if (!image) return;
    const blocks = Array.from({ length: Math.max(1, frames) }, (_, idx) => `=== FRAME ${idx + 1} ===\n${renderAscii(idx, true)}`);
    download(blocks.join("\n\n"), "ascii-animation-frames.txt", "text/plain");
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-neutral-400">
        Convert any image to ASCII art, tune the render style, animate the output, then export as TXT/HTML.
      </p>

      <div className="flex flex-wrap gap-3">
        <label className="px-3 py-2 rounded-lg border border-neutral-700 bg-neutral-900 text-sm text-neutral-300 cursor-pointer hover:border-neutral-600 transition-colors">
          Import image
          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload(e.target.files?.[0])} />
        </label>
        <button onClick={exportTxt} disabled={!ascii} className="px-3 py-2 rounded-lg border border-neutral-700 bg-neutral-900 text-sm text-neutral-300 disabled:opacity-50">
          Export TXT
        </button>
        <button onClick={exportHtml} disabled={!ascii} className="px-3 py-2 rounded-lg border border-neutral-700 bg-neutral-900 text-sm text-neutral-300 disabled:opacity-50">
          Export HTML
        </button>
        <button onClick={exportFrames} disabled={!ascii || !animate} className="px-3 py-2 rounded-lg border border-neutral-700 bg-neutral-900 text-sm text-neutral-300 disabled:opacity-50">
          Export animation frames
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Control label={`Columns: ${columns}`}>
            <input type="range" min={24} max={220} value={columns} onChange={(e) => setColumns(Number(e.target.value))} className="w-full" />
          </Control>
          <Control label={`Brightness: ${brightness}`}>
            <input type="range" min={-100} max={100} value={brightness} onChange={(e) => setBrightness(Number(e.target.value))} className="w-full" />
          </Control>
          <Control label={`Contrast: ${contrast}`}>
            <input type="range" min={-100} max={100} value={contrast} onChange={(e) => setContrast(Number(e.target.value))} className="w-full" />
          </Control>
          <Control label="ASCII charset (left = darkest)">
            <input
              value={charset}
              onChange={(e) => setCharset(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-neutral-700 bg-neutral-950 text-neutral-200 font-mono text-sm"
            />
          </Control>
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-neutral-300">
              <input type="checkbox" checked={invert} onChange={(e) => setInvert(e.target.checked)} />
              Invert
            </label>
            <label className="flex items-center gap-2 text-sm text-neutral-300">
              <input type="checkbox" checked={animate} onChange={(e) => setAnimate(e.target.checked)} />
              Animate
            </label>
          </div>
          {animate && (
            <div className="space-y-4">
              <Control label={`FPS: ${fps}`}>
                <input type="range" min={2} max={24} value={fps} onChange={(e) => setFps(Number(e.target.value))} className="w-full" />
              </Control>
              <Control label={`Frames: ${frames}`}>
                <input type="range" min={4} max={64} value={frames} onChange={(e) => setFrames(Number(e.target.value))} className="w-full" />
              </Control>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-neutral-800 bg-black p-4 overflow-auto max-h-[32rem]">
          {ascii ? (
            <pre className="text-[7px] leading-[0.55rem] sm:text-[8px] sm:leading-[0.6rem] text-neutral-200 whitespace-pre">
              {ascii}
            </pre>
          ) : (
            <div className="min-h-52 flex items-center justify-center text-neutral-500 text-sm">Import an image to generate ASCII art.</div>
          )}
        </div>
      </div>
    </div>
  );
}

function Control({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-wider text-neutral-500">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}
