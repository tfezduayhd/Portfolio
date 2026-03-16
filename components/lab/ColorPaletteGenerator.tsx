"use client";

import { useState, useCallback } from "react";

// ── Color math helpers ───────────────────────────────────────────────────────

function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, Math.round(l * 100)];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function hslToHex(h: number, s: number, l: number): string {
  const hn = h / 360;
  const sn = s / 100;
  const ln = l / 100;
  const hue2rgb = (p: number, q: number, t: number) => {
    let tt = t;
    if (tt < 0) tt += 1;
    if (tt > 1) tt -= 1;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };
  let r: number, g: number, b: number;
  if (sn === 0) {
    r = g = b = ln;
  } else {
    const q = ln < 0.5 ? ln * (1 + sn) : ln + sn - ln * sn;
    const p = 2 * ln - q;
    r = hue2rgb(p, q, hn + 1 / 3);
    g = hue2rgb(p, q, hn);
    b = hue2rgb(p, q, hn - 1 / 3);
  }
  const toHex = (x: number) => Math.round(x * 255).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function rotate(h: number, deg: number): number {
  return (h + deg + 360) % 360;
}

// ── Palette generators ────────────────────────────────────────────────────────

function getPalettes(hex: string) {
  const [h, s, l] = hexToHsl(hex);
  return {
    Complementary: [
      { hex, label: "Base" },
      { hex: hslToHex(rotate(h, 180), s, l), label: "Complement" },
    ],
    Analogous: [
      { hex: hslToHex(rotate(h, -30), s, l), label: "-30°" },
      { hex, label: "Base" },
      { hex: hslToHex(rotate(h, 30), s, l), label: "+30°" },
    ],
    Triadic: [
      { hex, label: "Base" },
      { hex: hslToHex(rotate(h, 120), s, l), label: "+120°" },
      { hex: hslToHex(rotate(h, 240), s, l), label: "+240°" },
    ],
    "Split-Complementary": [
      { hex, label: "Base" },
      { hex: hslToHex(rotate(h, 150), s, l), label: "+150°" },
      { hex: hslToHex(rotate(h, 210), s, l), label: "+210°" },
    ],
    Monochromatic: [20, 35, 50, 65, 80].map((lightness) => ({
      hex: hslToHex(h, s, lightness),
      label: `L${lightness}`,
    })),
  };
}

// ── Swatch component ──────────────────────────────────────────────────────────

function Swatch({ hex, label }: { hex: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(hex).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };
  return (
    <button
      onClick={copy}
      title={`Copy ${hex}`}
      className="flex flex-col items-center gap-1.5 group cursor-pointer"
    >
      <div
        className="w-14 h-14 rounded-xl shadow-md border border-white/10 transition-transform group-hover:scale-105"
        style={{ backgroundColor: hex }}
      />
      <span className="text-xs font-mono text-neutral-400 group-hover:text-neutral-200 transition-colors">
        {copied ? "Copied!" : hex.toUpperCase()}
      </span>
      <span className="text-[10px] text-neutral-600">{label}</span>
    </button>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ColorPaletteGenerator() {
  const [seed, setSeed] = useState("#6366f1");
  const palettes = getPalettes(seed);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSeed(e.target.value);
  }, []);

  return (
    <div className="space-y-8">
      {/* Seed picker */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <label className="text-sm font-medium text-neutral-300 shrink-0">Seed colour</label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={seed}
            onChange={handleChange}
            className="w-12 h-12 rounded-lg border border-neutral-700 cursor-pointer bg-transparent"
          />
          <input
            type="text"
            value={seed}
            onChange={(e) => {
              if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value)) setSeed(e.target.value);
            }}
            className="w-28 px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-200 font-mono text-sm focus:outline-none focus:border-indigo-500"
          />
        </div>
        <p className="text-xs text-neutral-500 sm:ml-4">Click a swatch to copy its hex code</p>
      </div>

      {/* Palettes */}
      {(Object.entries(palettes) as [string, { hex: string; label: string }[]][]).map(([name, swatches]) => (
        <div key={name}>
          <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-3">{name}</h3>
          <div className="flex flex-wrap gap-4">
            {swatches.map((s) => (
              <Swatch key={s.hex + s.label} hex={s.hex} label={s.label} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
