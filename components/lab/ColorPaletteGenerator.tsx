"use client";

import { useMemo, useState } from "react";

type HarmonyMode = "analogous" | "complementary" | "triadic" | "split" | "monochromatic";

type PaletteColor = {
  hex: string;
  label: string;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function normalizeHex(input: string): string {
  const clean = input.trim().toLowerCase();
  const withHash = clean.startsWith("#") ? clean : `#${clean}`;
  if (/^#[0-9a-f]{6}$/.test(withHash)) return withHash;
  return "#6366f1";
}

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

  let r: number;
  let g: number;
  let b: number;

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

function getRelativeLuminance(hex: string): number {
  const channels = [hex.slice(1, 3), hex.slice(3, 5), hex.slice(5, 7)].map((value) => {
    const normalized = parseInt(value, 16) / 255;
    return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrastRatio(hexA: string, hexB: string): number {
  const l1 = getRelativeLuminance(hexA);
  const l2 = getRelativeLuminance(hexB);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function getHarmonyPalette(
  seed: string,
  mode: HarmonyMode,
  spread: number,
  saturationOffset: number,
  lightnessOffset: number,
): PaletteColor[] {
  const [h, s, l] = hexToHsl(seed);
  const finalS = clamp(s + saturationOffset, 5, 95);
  const finalL = clamp(l + lightnessOffset, 8, 92);

  const fromAngle = (deg: number, label: string): PaletteColor => ({
    hex: hslToHex(rotate(h, deg), finalS, finalL),
    label,
  });

  if (mode === "monochromatic") {
    return [18, 32, 45, 58, 72, 84].map((targetL, index) => ({
      hex: hslToHex(h, finalS, clamp(targetL + lightnessOffset, 6, 94)),
      label: `Tone ${index + 1}`,
    }));
  }

  if (mode === "analogous") {
    return [
      fromAngle(-spread * 2, "Accent -2"),
      fromAngle(-spread, "Accent -1"),
      { hex: hslToHex(h, finalS, finalL), label: "Base" },
      fromAngle(spread, "Accent +1"),
      fromAngle(spread * 2, "Accent +2"),
    ];
  }

  if (mode === "complementary") {
    return [
      fromAngle(-spread / 2, "Support"),
      { hex: hslToHex(h, finalS, finalL), label: "Base" },
      fromAngle(180, "Complement"),
      fromAngle(180 + spread / 2, "Complement support"),
      fromAngle(spread, "Highlight"),
    ];
  }

  if (mode === "triadic") {
    return [
      { hex: hslToHex(h, finalS, finalL), label: "Base" },
      fromAngle(120, "Triad A"),
      fromAngle(240, "Triad B"),
      fromAngle(120 + spread / 2, "Triad A2"),
      fromAngle(240 - spread / 2, "Triad B2"),
    ];
  }

  return [
    { hex: hslToHex(h, finalS, finalL), label: "Base" },
    fromAngle(180 - spread, "Split A"),
    fromAngle(180 + spread, "Split B"),
    fromAngle(spread, "Bridge"),
    fromAngle(-spread, "Bridge alt"),
  ];
}

function getRecommendedTextColor(backgroundHex: string): "#FFFFFF" | "#111827" {
  const whiteContrast = contrastRatio(backgroundHex, "#ffffff");
  const darkContrast = contrastRatio(backgroundHex, "#111827");
  return whiteContrast >= darkContrast ? "#FFFFFF" : "#111827";
}

function Swatch({ hex, label }: PaletteColor) {
  const [copied, setCopied] = useState(false);
  const textColor = getRecommendedTextColor(hex);
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(hex.toUpperCase());
      setCopied(true);
      setTimeout(() => setCopied(false), 1300);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button
      onClick={onCopy}
      title={`Copy ${hex}`}
      className="group overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/40 text-left shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:border-white/20"
    >
      <div className="h-24 w-full" style={{ backgroundColor: hex }} />
      <div className="space-y-1.5 p-3">
        <p className="text-xs uppercase tracking-wider text-neutral-500">{label}</p>
        <p className="font-mono text-sm text-neutral-100">{copied ? "Copied" : hex.toUpperCase()}</p>
        <p className="text-[11px] text-neutral-500">Text: {textColor}</p>
      </div>
    </button>
  );
}

const HARMONY_OPTIONS: { value: HarmonyMode; label: string; description: string }[] = [
  { value: "analogous", label: "Analogous", description: "Smooth, editorial and cohesive" },
  { value: "complementary", label: "Complementary", description: "High contrast for CTA-driven layouts" },
  { value: "triadic", label: "Triadic", description: "Vibrant and balanced for product UI" },
  { value: "split", label: "Split Complement", description: "Strong contrast, softer than direct complement" },
  { value: "monochromatic", label: "Monochromatic", description: "Tone system for consistent design scales" },
];
const FALLBACK_HUE_OFFSET = 28;
const RANDOM_SATURATION = 70;
const RANDOM_LIGHTNESS = 55;

export default function ColorPaletteGenerator() {
  const [seed, setSeed] = useState("#6366f1");
  const [draftSeed, setDraftSeed] = useState("#6366f1");
  const [mode, setMode] = useState<HarmonyMode>("analogous");
  const [spread, setSpread] = useState(26);
  const [saturationOffset, setSaturationOffset] = useState(0);
  const [lightnessOffset, setLightnessOffset] = useState(0);
  const [copiedScale, setCopiedScale] = useState(false);

  const palette = useMemo(
    () => getHarmonyPalette(seed, mode, spread, saturationOffset, lightnessOffset),
    [seed, mode, spread, saturationOffset, lightnessOffset],
  );

  const gradientStart = palette[0]?.hex ?? seed;
  const gradientEnd = palette[palette.length - 1]?.hex ?? seed;
  const gradientFallback = hslToHex(rotate(hexToHsl(seed)[0], FALLBACK_HUE_OFFSET), RANDOM_SATURATION, RANDOM_LIGHTNESS);
  const seedForGradient = `linear-gradient(135deg, ${gradientStart}, ${gradientEnd === gradientStart ? gradientFallback : gradientEnd})`;
  const seedSummary = HARMONY_OPTIONS.find((option) => option.value === mode);

  const copyScaleAsTokens = async () => {
    const tokens = palette
      .map((color, index) => `--palette-${index + 1}: ${color.hex.toUpperCase()};`)
      .join("\n");

    try {
      await navigator.clipboard.writeText(tokens);
      setCopiedScale(true);
      setTimeout(() => setCopiedScale(false), 1400);
    } catch {
      setCopiedScale(false);
    }
  };

  return (
    <div className="space-y-6">
      <div
        className="overflow-hidden rounded-3xl border border-white/10 bg-neutral-900/40 p-6 shadow-2xl shadow-indigo-950/30"
        style={{ backgroundImage: seedForGradient }}
      >
        <div className="rounded-2xl border border-white/20 bg-black/45 p-5 backdrop-blur-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">Palette Studio</p>
          <h2 className="mt-2 text-xl font-semibold text-white">Build a design-ready color system</h2>
          <p className="mt-1 text-sm text-neutral-300">
            Inspired by modern palette tools: tune harmony, saturation and lightness, then copy swatches or CSS tokens.
          </p>
        </div>
      </div>

      <div className="grid gap-4 rounded-3xl border border-white/10 bg-neutral-900/40 p-5 lg:grid-cols-2">
        <div className="space-y-3">
          <label className="text-sm font-medium text-neutral-200">Seed color</label>
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="color"
              value={seed}
              onChange={(event) => {
                setSeed(event.target.value);
                setDraftSeed(event.target.value);
              }}
              className="h-12 w-12 cursor-pointer rounded-lg border border-white/10 bg-transparent"
            />
            <input
              type="text"
              value={draftSeed}
              onChange={(event) => setDraftSeed(event.target.value)}
              onBlur={() => {
                const normalized = normalizeHex(draftSeed);
                setDraftSeed(normalized);
                setSeed(normalized);
              }}
              className="w-36 rounded-lg border border-white/10 bg-neutral-950 px-3 py-2 font-mono text-sm text-neutral-100 focus:border-indigo-400 focus:outline-none"
            />
            <button
              onClick={() => {
                const randomHex = hslToHex(Math.floor(Math.random() * 360), RANDOM_SATURATION, RANDOM_LIGHTNESS);
                setSeed(randomHex);
                setDraftSeed(randomHex);
              }}
              className="rounded-lg border border-white/15 px-3 py-2 text-xs font-medium text-neutral-200 transition hover:border-white/30 hover:text-white"
            >
              Random
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium text-neutral-200">Harmony mode</label>
          <select
            value={mode}
            onChange={(event) => setMode(event.target.value as HarmonyMode)}
            className="w-full rounded-lg border border-white/10 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 focus:border-indigo-400 focus:outline-none"
          >
            {HARMONY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-neutral-400">{seedSummary?.description}</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-neutral-300">
            <span>Hue spread</span>
            <span>{spread}°</span>
          </div>
          <input
            type="range"
            min={10}
            max={70}
            value={spread}
            onChange={(event) => setSpread(Number(event.target.value))}
            className="w-full accent-indigo-400"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-neutral-300">
            <span>Saturation shift</span>
            <span>{saturationOffset > 0 ? `+${saturationOffset}` : saturationOffset}</span>
          </div>
          <input
            type="range"
            min={-30}
            max={30}
            value={saturationOffset}
            onChange={(event) => setSaturationOffset(Number(event.target.value))}
            className="w-full accent-indigo-400"
          />
        </div>

        <div className="space-y-2 lg:col-span-2">
          <div className="flex items-center justify-between text-xs text-neutral-300">
            <span>Lightness shift</span>
            <span>{lightnessOffset > 0 ? `+${lightnessOffset}` : lightnessOffset}</span>
          </div>
          <input
            type="range"
            min={-20}
            max={20}
            value={lightnessOffset}
            onChange={(event) => setLightnessOffset(Number(event.target.value))}
            className="w-full accent-indigo-400"
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <p className="text-xs text-neutral-400">Click a swatch to copy HEX • Contrast-aware text hints included</p>
        <button
          onClick={copyScaleAsTokens}
          className="rounded-lg border border-white/15 px-3 py-2 text-xs font-medium text-neutral-200 transition hover:border-white/30 hover:text-white"
        >
          {copiedScale ? "Tokens copied" : "Copy CSS tokens"}
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {palette.map((swatch) => (
          <Swatch key={`${swatch.label}-${swatch.hex}`} hex={swatch.hex} label={swatch.label} />
        ))}
      </div>
    </div>
  );
}
