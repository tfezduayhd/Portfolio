"use client";

import { useState, useEffect, useRef, useCallback } from "react";

type Mode = "work" | "short-break" | "long-break";

const DURATIONS: Record<Mode, number> = {
  work: 25 * 60,
  "short-break": 5 * 60,
  "long-break": 15 * 60,
};

const MODE_LABELS: Record<Mode, string> = {
  work: "Focus",
  "short-break": "Short Break",
  "long-break": "Long Break",
};

const MODE_COLORS: Record<Mode, string> = {
  work: "#6366f1",
  "short-break": "#10b981",
  "long-break": "#f59e0b",
};

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function formatTime(seconds: number) {
  return `${pad(Math.floor(seconds / 60))}:${pad(seconds % 60)}`;
}

// SVG ring progress
function Ring({ progress, color }: { progress: number; color: string }) {
  const r = 80;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - progress);
  return (
    <svg width={200} height={200} className="-rotate-90">
      <circle cx={100} cy={100} r={r} fill="none" stroke="#262626" strokeWidth={10} />
      <circle
        cx={100}
        cy={100}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={10}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.5s ease" }}
      />
    </svg>
  );
}

export default function PomodoroTimer() {
  const [mode, setMode] = useState<Mode>("work");
  const [timeLeft, setTimeLeft] = useState(DURATIONS["work"]);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const total = DURATIONS[mode];
  const progress = timeLeft / total;
  const color = MODE_COLORS[mode];

  const reset = useCallback((m: Mode = mode) => {
    setRunning(false);
    setTimeLeft(DURATIONS[m]);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, [mode]);

  const switchMode = (m: Mode) => {
    setMode(m);
    reset(m);
    setTimeLeft(DURATIONS[m]);
  };

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            clearInterval(intervalRef.current!);
            setRunning(false);
            if (mode === "work") setSessions((s) => s + 1);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, mode]);

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Mode selector */}
      <div className="flex gap-2 bg-neutral-900 rounded-xl p-1">
        {(Object.keys(DURATIONS) as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              mode === m ? "text-white" : "text-neutral-400 hover:text-neutral-200"
            }`}
            style={mode === m ? { backgroundColor: MODE_COLORS[m] } : {}}
          >
            {MODE_LABELS[m]}
          </button>
        ))}
      </div>

      {/* Ring + time */}
      <div className="relative flex items-center justify-center">
        <Ring progress={progress} color={color} />
        <div className="absolute flex flex-col items-center">
          <span className="text-5xl font-bold font-mono text-neutral-100 tabular-nums">
            {formatTime(timeLeft)}
          </span>
          <span className="text-sm text-neutral-400 mt-1">{MODE_LABELS[mode]}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        <button
          onClick={() => setRunning((r) => !r)}
          className="px-8 py-3 rounded-xl text-white font-semibold text-sm transition-colors"
          style={{ backgroundColor: color }}
        >
          {running ? "⏸ Pause" : "▶ Start"}
        </button>
        <button
          onClick={() => reset()}
          className="px-6 py-3 rounded-xl bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-neutral-200 font-semibold text-sm transition-colors"
        >
          ↺ Reset
        </button>
      </div>

      {/* Session counter */}
      <div className="flex flex-col items-center gap-3">
        <p className="text-sm text-neutral-400">
          Sessions completed: <span className="font-bold text-neutral-200">{sessions}</span>
        </p>
        <div className="flex gap-1.5">
          {Array.from({ length: Math.max(4, sessions + 1) }, (_, i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-full transition-colors"
              style={{ backgroundColor: i < sessions ? color : "#404040" }}
            />
          ))}
        </div>
        {sessions > 0 && sessions % 4 === 0 && (
          <p className="text-xs text-amber-400 font-medium">
            🎉 4 sessions done — time for a long break!
          </p>
        )}
      </div>
    </div>
  );
}
