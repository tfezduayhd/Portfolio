/* ═══════════════════════════════════════════════════════════════════════════
 * ASCII Art Generator – Zustand State Store
 *
 * Centralizes every piece of reactive state so that individual control
 * updates never re-render the whole component tree.  Each setter produces
 * a shallow-merge patch – Zustand's default behaviour.
 * ═══════════════════════════════════════════════════════════════════════════ */

import { create } from "zustand";
import {
  CHARSET_PRESETS,
  type CharsetPresetKey,
  type ColorMode,
  type MediaKind,
} from "@/lib/ascii/types";

/* Re-export types so consumers can import everything from the store file */
export { CHARSET_PRESETS, type CharsetPresetKey, type ColorMode, type MediaKind };
export type { ExportFormat } from "@/lib/ascii/types";

/* ── State shape ──────────────────────────────────────────────────────── */

interface AsciiStudioState {
  /* Media source */
  mediaType: MediaKind;
  imageSrc: string | null;
  videoSrc: string | null;

  /* Rendering parameters */
  columns: number;
  brightness: number;
  contrast: number;
  invert: boolean;
  colorMode: ColorMode;
  fontSize: number;
  charset: string;
  charsetPreset: CharsetPresetKey;

  /* Animation */
  animate: boolean;
  fps: number;
  totalFrames: number;
  currentFrame: number;

  /* Video playback */
  videoPlaying: boolean;

  /* Export */
  exporting: boolean;
  exportProgress: number;

  /* Drag-over visual hint */
  dragOver: boolean;

  /* Actions */
  setMedia: (type: MediaKind, src: string | null) => void;
  setColumns: (v: number) => void;
  setBrightness: (v: number) => void;
  setContrast: (v: number) => void;
  setInvert: (v: boolean) => void;
  setColorMode: (v: ColorMode) => void;
  setFontSize: (v: number) => void;
  setCharset: (v: string) => void;
  setCharsetPreset: (k: CharsetPresetKey) => void;
  setAnimate: (v: boolean) => void;
  setFps: (v: number) => void;
  setTotalFrames: (v: number) => void;
  setCurrentFrame: (v: number) => void;
  setVideoPlaying: (v: boolean) => void;
  setExporting: (v: boolean) => void;
  setExportProgress: (v: number) => void;
  setDragOver: (v: boolean) => void;
  reset: () => void;
}

/* ── Initial values ───────────────────────────────────────────────────── */

const DEFAULTS = {
  mediaType: null as MediaKind,
  imageSrc: null as string | null,
  videoSrc: null as string | null,
  columns: 96,
  brightness: 0,
  contrast: 0,
  invert: false,
  colorMode: "mono" as ColorMode,
  fontSize: 7,
  charset: CHARSET_PRESETS.standard,
  charsetPreset: "standard" as CharsetPresetKey,
  animate: false,
  fps: 10,
  totalFrames: 20,
  currentFrame: 0,
  videoPlaying: false,
  exporting: false,
  exportProgress: 0,
  dragOver: false,
};

/* ── Store ────────────────────────────────────────────────────────────── */

export const useAsciiStore = create<AsciiStudioState>((set) => ({
  ...DEFAULTS,

  setMedia: (type, src) =>
    set({
      mediaType: type,
      imageSrc: type === "image" ? src : null,
      videoSrc: type === "video" ? src : null,
      currentFrame: 0,
      videoPlaying: false,
    }),

  setColumns: (v) => set({ columns: v }),
  setBrightness: (v) => set({ brightness: v }),
  setContrast: (v) => set({ contrast: v }),
  setInvert: (v) => set({ invert: v }),
  setColorMode: (v) => set({ colorMode: v }),
  setFontSize: (v) => set({ fontSize: v }),
  setCharset: (v) => set({ charset: v }),
  setCharsetPreset: (k) =>
    set({ charsetPreset: k, charset: CHARSET_PRESETS[k] }),
  setAnimate: (v) => set({ animate: v, currentFrame: 0 }),
  setFps: (v) => set({ fps: v }),
  setTotalFrames: (v) => set({ totalFrames: v }),
  setCurrentFrame: (v) => set({ currentFrame: v }),
  setVideoPlaying: (v) => set({ videoPlaying: v }),
  setExporting: (v) => set({ exporting: v, exportProgress: 0 }),
  setExportProgress: (v) => set({ exportProgress: v }),
  setDragOver: (v) => set({ dragOver: v }),
  reset: () => set(DEFAULTS),
}));
