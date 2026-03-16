"use client";

import { useState, useEffect, useRef } from "react";

const PRESETS = [
  {
    name: "Bounce",
    keyframes: `@keyframes demo {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-40px); }
}`,
  },
  {
    name: "Fade In",
    keyframes: `@keyframes demo {
  from { opacity: 0; }
  to   { opacity: 1; }
}`,
  },
  {
    name: "Spin",
    keyframes: `@keyframes demo {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}`,
  },
  {
    name: "Shake",
    keyframes: `@keyframes demo {
  0%, 100% { transform: translateX(0); }
  20%       { transform: translateX(-12px); }
  40%       { transform: translateX(12px); }
  60%       { transform: translateX(-8px); }
  80%       { transform: translateX(8px); }
}`,
  },
  {
    name: "Scale Pulse",
    keyframes: `@keyframes demo {
  0%, 100% { transform: scale(1); }
  50%       { transform: scale(1.4); }
}`,
  },
  {
    name: "Slide In",
    keyframes: `@keyframes demo {
  from { transform: translateX(-60px); opacity: 0; }
  to   { transform: translateX(0);     opacity: 1; }
}`,
  },
];

const TIMING_FUNCTIONS = ["ease", "ease-in", "ease-out", "ease-in-out", "linear", "cubic-bezier(0.68,-0.55,0.27,1.55)"];

export default function CssAnimationPlayground() {
  const [presetIdx, setPresetIdx] = useState(0);
  const [duration, setDuration] = useState(1.0);
  const [timingFn, setTimingFn] = useState("ease");
  const [iterCount, setIterCount] = useState("infinite");
  const [playing, setPlaying] = useState(true);
  const [key, setKey] = useState(0);
  const styleRef = useRef<HTMLStyleElement | null>(null);

  const preset = PRESETS[presetIdx];

  const animationCss = `animation: demo ${duration}s ${timingFn} ${iterCount};`;
  const fullCss = `${preset.keyframes}\n\n.animated-box {\n  ${animationCss}\n}`;

  useEffect(() => {
    if (!styleRef.current) {
      styleRef.current = document.createElement("style");
      document.head.appendChild(styleRef.current);
    }
    styleRef.current.textContent = playing ? preset.keyframes : "";
    return () => {
      if (styleRef.current) styleRef.current.textContent = "";
    };
  }, [preset.keyframes, playing]);

  const replay = () => {
    setKey((k) => k + 1);
    setPlaying(true);
  };

  const [copied, setCopied] = useState(false);
  const copyCss = () => {
    navigator.clipboard.writeText(fullCss).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <div className="space-y-8">
      {/* Controls */}
      <div className="grid sm:grid-cols-2 gap-6">
        {/* Preset */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-300">Animation preset</label>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p, i) => (
              <button
                key={p.name}
                onClick={() => { setPresetIdx(i); replay(); }}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  i === presetIdx
                    ? "bg-indigo-500 text-white"
                    : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-neutral-200"
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Duration */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-300">
            Duration — <span className="font-mono text-indigo-400">{duration.toFixed(1)}s</span>
          </label>
          <input
            type="range"
            min={0.2}
            max={4}
            step={0.1}
            value={duration}
            onChange={(e) => setDuration(parseFloat(e.target.value))}
            className="w-full accent-indigo-500"
          />
        </div>

        {/* Timing function */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-300">Timing function</label>
          <select
            value={timingFn}
            onChange={(e) => setTimingFn(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-200 text-sm focus:outline-none focus:border-indigo-500"
          >
            {TIMING_FUNCTIONS.map((fn) => (
              <option key={fn} value={fn}>{fn}</option>
            ))}
          </select>
        </div>

        {/* Iteration count */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-300">Iteration count</label>
          <div className="flex gap-2">
            {["1", "2", "3", "infinite"].map((v) => (
              <button
                key={v}
                onClick={() => setIterCount(v)}
                className={`flex-1 py-2 rounded-lg text-sm transition-colors ${
                  iterCount === v
                    ? "bg-indigo-500 text-white"
                    : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-neutral-200"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Preview */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-neutral-300">Preview</span>
          <div className="flex gap-2">
            <button
              onClick={() => setPlaying((p) => !p)}
              className="px-3 py-1.5 rounded-lg bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-neutral-200 text-sm transition-colors"
            >
              {playing ? "⏸ Pause" : "▶ Play"}
            </button>
            <button
              onClick={replay}
              className="px-3 py-1.5 rounded-lg bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-neutral-200 text-sm transition-colors"
            >
              ↺ Replay
            </button>
          </div>
        </div>
        <div className="rounded-xl border border-neutral-700 bg-neutral-950 h-48 flex items-center justify-center">
          <div
            key={key}
            className="animated-box w-16 h-16 rounded-xl bg-indigo-500 shadow-lg shadow-indigo-500/30"
            style={
              playing
                ? {
                    animationName: "demo",
                    animationDuration: `${duration}s`,
                    animationTimingFunction: timingFn,
                    animationIterationCount: iterCount,
                  }
                : {}
            }
          />
        </div>
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
          {fullCss}
        </pre>
      </div>
    </div>
  );
}
