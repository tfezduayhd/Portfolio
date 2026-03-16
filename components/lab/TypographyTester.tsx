"use client";

import { useState } from "react";

const FONTS = [
  { label: "Inter (System)", value: "Inter, system-ui, sans-serif" },
  { label: "Georgia (Serif)", value: "Georgia, 'Times New Roman', serif" },
  { label: "Courier New (Mono)", value: "'Courier New', Courier, monospace" },
  { label: "Arial", value: "Arial, Helvetica, sans-serif" },
  { label: "Verdana", value: "Verdana, Geneva, sans-serif" },
  { label: "Trebuchet MS", value: "'Trebuchet MS', sans-serif" },
  { label: "Palatino", value: "Palatino, 'Book Antiqua', serif" },
];

const WEIGHTS = [100, 200, 300, 400, 500, 600, 700, 800, 900];

const DEFAULT_TEXT =
  "The quick brown fox jumps over the lazy dog. Typography is the art of arranging type to make written language legible, readable, and appealing.";

export default function TypographyTester() {
  const [font, setFont] = useState(FONTS[0].value);
  const [size, setSize] = useState(18);
  const [lineHeight, setLineHeight] = useState(1.6);
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [weight, setWeight] = useState(400);
  const [color, setColor] = useState("#e5e5e5");
  const [text, setText] = useState(DEFAULT_TEXT);
  const [copied, setCopied] = useState(false);

  const css = `font-family: ${font};
font-size: ${size}px;
font-weight: ${weight};
line-height: ${lineHeight};
letter-spacing: ${letterSpacing}px;
color: ${color};`;

  const copyCss = () => {
    navigator.clipboard.writeText(css).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <div className="space-y-8">
      {/* Controls */}
      <div className="grid sm:grid-cols-2 gap-6">
        {/* Font family */}
        <div className="space-y-2 sm:col-span-2">
          <label className="text-sm font-medium text-neutral-300">Font family</label>
          <div className="flex flex-wrap gap-2">
            {FONTS.map((f) => (
              <button
                key={f.value}
                onClick={() => setFont(f.value)}
                style={{ fontFamily: f.value }}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  font === f.value
                    ? "bg-indigo-500 text-white"
                    : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-neutral-200"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Font size */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-300">
            Font size — <span className="font-mono text-indigo-400">{size}px</span>
          </label>
          <input
            type="range"
            min={10}
            max={72}
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
            className="w-full accent-indigo-500"
          />
        </div>

        {/* Line height */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-300">
            Line height — <span className="font-mono text-indigo-400">{lineHeight.toFixed(1)}</span>
          </label>
          <input
            type="range"
            min={1.0}
            max={3.0}
            step={0.1}
            value={lineHeight}
            onChange={(e) => setLineHeight(parseFloat(e.target.value))}
            className="w-full accent-indigo-500"
          />
        </div>

        {/* Letter spacing */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-300">
            Letter spacing — <span className="font-mono text-indigo-400">{letterSpacing}px</span>
          </label>
          <input
            type="range"
            min={-2}
            max={10}
            step={0.5}
            value={letterSpacing}
            onChange={(e) => setLetterSpacing(parseFloat(e.target.value))}
            className="w-full accent-indigo-500"
          />
        </div>

        {/* Color */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-300">Text colour</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-10 h-10 rounded-lg border border-neutral-700 cursor-pointer bg-transparent"
            />
            <span className="font-mono text-sm text-neutral-400">{color.toUpperCase()}</span>
          </div>
        </div>

        {/* Font weight */}
        <div className="space-y-2 sm:col-span-2">
          <label className="text-sm font-medium text-neutral-300">
            Font weight — <span className="font-mono text-indigo-400">{weight}</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {WEIGHTS.map((w) => (
              <button
                key={w}
                onClick={() => setWeight(w)}
                style={{ fontWeight: w, fontFamily: font }}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  weight === w
                    ? "bg-indigo-500 text-white"
                    : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-neutral-200"
                }`}
              >
                {w}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Preview */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-neutral-300">Preview</span>
          <span className="text-xs text-neutral-500">Edit text below</span>
        </div>
        <div className="rounded-xl border border-neutral-700 bg-neutral-950 p-6 min-h-32">
          <p
            style={{
              fontFamily: font,
              fontSize: `${size}px`,
              fontWeight: weight,
              lineHeight: lineHeight,
              letterSpacing: `${letterSpacing}px`,
              color: color,
            }}
          >
            {text}
          </p>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          className="w-full mt-3 px-4 py-3 rounded-xl bg-neutral-800 border border-neutral-700 text-neutral-300 text-sm focus:outline-none focus:border-indigo-500 resize-y"
          placeholder="Type your preview text here…"
        />
      </div>

      {/* Generated CSS */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-neutral-300">Generated CSS</span>
          <button
            onClick={copyCss}
            className="px-3 py-1.5 rounded-lg bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-neutral-200 text-sm transition-colors"
          >
            {copied ? "✓ Copied!" : "Copy CSS"}
          </button>
        </div>
        <pre className="rounded-xl bg-neutral-950 border border-neutral-700 p-4 text-sm font-mono text-emerald-400 overflow-x-auto whitespace-pre-wrap">
          {css}
        </pre>
      </div>
    </div>
  );
}
