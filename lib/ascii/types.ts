/* ═══════════════════════════════════════════════════════════════════════════
 * ASCII Art Generator – Shared Type Definitions
 * ═══════════════════════════════════════════════════════════════════════════ */

/** A single rendered cell in the ASCII grid. */
export interface AsciiCell {
  /** The character to display. */
  char: string;
  /** Original red channel (0-255). */
  r: number;
  /** Original green channel (0-255). */
  g: number;
  /** Original blue channel (0-255). */
  b: number;
}

/** Supported character-set presets. */
export const CHARSET_PRESETS = {
  standard: " .:-=+*#%@",
  blocks: " ░▒▓█",
  minimal: " .:*#",
  detailed:
    " .'`^\",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$",
  binary: "01",
  braille: "⠀⠁⠂⠃⠄⠅⠆⠇⡀⡁⡂⡃⡄⡅⡆⡇",
} as const;

export type CharsetPresetKey = keyof typeof CHARSET_PRESETS;

export type MediaKind = "image" | "video" | null;
export type ColorMode = "mono" | "color";
export type ExportFormat = "png" | "webp" | "gif" | "mp4";

/** Options consumed by the ASCII rendering pipeline. */
export interface RenderOptions {
  columns: number;
  brightness: number;
  contrast: number;
  invert: boolean;
  charset: string;
  frameIndex: number;
  animated: boolean;
  colorMode: ColorMode;
}

/** Options used by the animated-format exporters (GIF / MP4). */
export interface AnimatedExportOptions {
  columns: number;
  brightness: number;
  contrast: number;
  invert: boolean;
  charset: string;
  colorMode: ColorMode;
  fontSize: number;
  totalFrames: number;
  fps: number;
}
