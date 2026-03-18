import { create } from "zustand";

/** Supported character-set presets. */
export const CHARSET_PRESETS = {
  standard: " .:-=+*#%@",
  blocks: " ░▒▓█",
  minimal: " .:*#",
  detailed: " .'`^\",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$",
  binary: "01",
  braille: "⠀⠁⠂⠃⠄⠅⠆⠇⡀⡁⡂⡃⡄⡅⡆⡇",
} as const;

export type CharsetPresetKey = keyof typeof CHARSET_PRESETS;

export type MediaType = "image" | "video" | null;
export type ExportFormat = "png" | "webp" | "gif" | "mp4";

interface AsciiStudioState {
  /* ── Media source ──────────────────────────────── */
  mediaType: MediaType;
  imageSrc: string | null;
  videoSrc: string | null;

  /* ── Rendering ──────────────────────────────────── */
  columns: number;
  brightness: number;
  contrast: number;
  invert: boolean;
  colorMode: "mono" | "color";
  fontSize: number;
  charset: string;
  charsetPreset: CharsetPresetKey;

  /* ── Animation ──────────────────────────────────── */
  animate: boolean;
  fps: number;
  totalFrames: number;
  currentFrame: number;

  /* ── Video playback ─────────────────────────────── */
  videoPlaying: boolean;

  /* ── Export ──────────────────────────────────────── */
  exporting: boolean;
  exportProgress: number;

  /* ── Actions ────────────────────────────────────── */
  setMedia: (type: MediaType, src: string | null) => void;
  setColumns: (v: number) => void;
  setBrightness: (v: number) => void;
  setContrast: (v: number) => void;
  setInvert: (v: boolean) => void;
  setColorMode: (v: "mono" | "color") => void;
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
  reset: () => void;
}

const INITIAL_STATE = {
  mediaType: null as MediaType,
  imageSrc: null as string | null,
  videoSrc: null as string | null,
  columns: 96,
  brightness: 0,
  contrast: 0,
  invert: false,
  colorMode: "mono" as const,
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
};

export const useAsciiStore = create<AsciiStudioState>((set) => ({
  ...INITIAL_STATE,

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
  setCharsetPreset: (k) => set({ charsetPreset: k, charset: CHARSET_PRESETS[k] }),
  setAnimate: (v) => set({ animate: v, currentFrame: 0 }),
  setFps: (v) => set({ fps: v }),
  setTotalFrames: (v) => set({ totalFrames: v }),
  setCurrentFrame: (v) => set({ currentFrame: v }),
  setVideoPlaying: (v) => set({ videoPlaying: v }),
  setExporting: (v) => set({ exporting: v, exportProgress: v ? 0 : 0 }),
  setExportProgress: (v) => set({ exportProgress: v }),
  reset: () => set(INITIAL_STATE),
}));
