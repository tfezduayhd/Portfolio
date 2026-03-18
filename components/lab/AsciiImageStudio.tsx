"use client";

/* ═══════════════════════════════════════════════════════════════════════════
 * ASCII Art & Media Generator – Main Component
 *
 * A highly-performant, client-side ASCII generator built with:
 *   • Next.js 16 App Router
 *   • TypeScript (strict)
 *   • Tailwind CSS
 *   • Shadcn/UI + Lucide React icons
 *   • Zustand for granular, re-render-free state management
 *   • HTML5 Canvas for real-time rendering
 *
 * Architecture:
 *   - Rendering logic lives in `lib/ascii/renderer.ts`
 *   - Export helpers live in `lib/ascii/exporter.ts`
 *   - GIF encoder lives in `lib/ascii/gif-encoder.ts`
 *   - Shared types live in `lib/ascii/types.ts`
 *   - All reactive state is in the Zustand store
 * ═══════════════════════════════════════════════════════════════════════════ */

import React, { useCallback, useEffect, useRef } from "react";
import {
  Upload,
  ImageIcon,
  Video,
  Download,
  Play,
  Pause,
  RotateCcw,
  Sun,
  Contrast,
  Columns3,
  Type,
  Sparkles,
  Loader2,
  Film,
  Timer,
  Palette,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  useAsciiStore,
  CHARSET_PRESETS,
  type CharsetPresetKey,
  type ExportFormat,
} from "@/stores/useAsciiStore";

import { renderAsciiData, paintAsciiToCanvas } from "@/lib/ascii/renderer";
import { exportImage, exportGif, exportVideo } from "@/lib/ascii/exporter";

/* ═══════════════════════════════════════════════════════════════════════════
 * Sub-components
 * ═══════════════════════════════════════════════════════════════════════════ */

/** Labelled control row with an optional icon. */
function ControlRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label className="flex items-center gap-1.5 mb-2 text-xs text-neutral-400 uppercase tracking-wider">
        {icon} {label}
      </Label>
      {children}
    </div>
  );
}

/** Toggle switch with label. */
function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Switch checked={checked} onCheckedChange={onChange} />
      <Label className="text-sm text-neutral-300 normal-case tracking-normal">
        {label}
      </Label>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Main Component
 * ═══════════════════════════════════════════════════════════════════════════ */

export default function AsciiImageStudio() {
  /* ── Store ──────────────────────────────────────────────────────────── */
  const store = useAsciiStore();

  /* ── Refs ───────────────────────────────────────────────────────────── */
  const imageRef = useRef<HTMLImageElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const outputCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number>(0);
  const videoTimerRef = useRef<number | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ── Paint callback ─────────────────────────────────────────────────── */
  const paint = useCallback(() => {
    const canvas = outputCanvasRef.current;
    if (!canvas) return;

    let source: CanvasImageSource | null = null;
    let w = 0;
    let h = 0;

    if (store.mediaType === "image" && imageRef.current) {
      source = imageRef.current;
      w = imageRef.current.naturalWidth;
      h = imageRef.current.naturalHeight;
    } else if (store.mediaType === "video" && videoRef.current) {
      source = videoRef.current;
      w = videoRef.current.videoWidth;
      h = videoRef.current.videoHeight;
    }

    if (!source || w === 0 || h === 0) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        canvas.width = 480;
        canvas.height = 240;
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, 480, 240);
        ctx.fillStyle = "#525252";
        ctx.font = "14px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(
          "Drop an image or video here, or click Import.",
          240,
          115,
        );
        ctx.fillText("Supported: JPG, PNG, WebP, GIF, MP4, WebM", 240, 140);
      }
      return;
    }

    const grid = renderAsciiData(source, w, h, {
      columns: store.columns,
      brightness: store.brightness,
      contrast: store.contrast,
      invert: store.invert,
      charset: store.charset,
      frameIndex: store.animate ? store.currentFrame : 0,
      animated: store.animate,
      colorMode: store.colorMode,
    });
    paintAsciiToCanvas(canvas, grid, store.fontSize, store.colorMode);
  }, [store]);

  /* ── Animation timer ────────────────────────────────────────────────── */
  useEffect(() => {
    if (!store.animate || store.mediaType !== "image") return;
    const id = window.setInterval(() => {
      const s = useAsciiStore.getState();
      s.setCurrentFrame((s.currentFrame + 1) % Math.max(1, s.totalFrames));
    }, 1000 / Math.max(1, store.fps));
    return () => window.clearInterval(id);
  }, [store.animate, store.fps, store.mediaType]);

  /* ── Repaint on parameter change ────────────────────────────────────── */
  useEffect(() => {
    animFrameRef.current = requestAnimationFrame(paint);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [
    paint,
    store.columns,
    store.brightness,
    store.contrast,
    store.invert,
    store.colorMode,
    store.fontSize,
    store.charset,
    store.animate,
    store.currentFrame,
  ]);

  /* ── Video frame ticker ─────────────────────────────────────────────── */
  useEffect(() => {
    if (store.mediaType !== "video" || !store.videoPlaying) return;
    videoTimerRef.current = window.setInterval(() => {
      requestAnimationFrame(paint);
    }, 1000 / 30);
    return () => window.clearInterval(videoTimerRef.current);
  }, [store.mediaType, store.videoPlaying, paint]);

  /* ── File upload handler ────────────────────────────────────────────── */
  const handleUpload = useCallback(
    (file?: File) => {
      if (!file) return;

      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = () => {
          const src = reader.result;
          if (typeof src !== "string") return;
          const img = new Image();
          img.onload = () => {
            imageRef.current = img;
            videoRef.current = null;
            store.setMedia("image", src);
          };
          img.src = src;
        };
        reader.readAsDataURL(file);
      } else if (file.type.startsWith("video/")) {
        const url = URL.createObjectURL(file);
        const vid = document.createElement("video");
        vid.muted = true;
        vid.playsInline = true;
        vid.preload = "auto";
        vid.src = url;
        vid.onloadeddata = () => {
          videoRef.current = vid;
          imageRef.current = null;
          store.setMedia("video", url);
          requestAnimationFrame(paint);
        };
      }
    },
    [store, paint],
  );

  /* ── Drag-and-drop handlers ─────────────────────────────────────────── */
  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      store.setDragOver(true);
    },
    [store],
  );

  const handleDragLeave = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      store.setDragOver(false);
    },
    [store],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      store.setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleUpload(file);
    },
    [store, handleUpload],
  );

  /* ── Video play / pause ─────────────────────────────────────────────── */
  const toggleVideoPlayback = useCallback(() => {
    const vid = videoRef.current;
    if (!vid) return;
    if (store.videoPlaying) {
      vid.pause();
      store.setVideoPlaying(false);
    } else {
      vid.play();
      store.setVideoPlaying(true);
    }
  }, [store]);

  /* ── Export handler ─────────────────────────────────────────────────── */
  const handleExport = useCallback(
    async (format: ExportFormat) => {
      const canvas = outputCanvasRef.current;
      if (!canvas) return;

      let source: CanvasImageSource | null = null;
      let w = 0;
      let h = 0;
      if (store.mediaType === "image" && imageRef.current) {
        source = imageRef.current;
        w = imageRef.current.naturalWidth;
        h = imageRef.current.naturalHeight;
      } else if (store.mediaType === "video" && videoRef.current) {
        source = videoRef.current;
        w = videoRef.current.videoWidth;
        h = videoRef.current.videoHeight;
      }
      if (!source || w === 0) return;

      if (format === "png" || format === "webp") {
        exportImage(canvas, format);
        return;
      }

      store.setExporting(true);
      try {
        const opts = {
          columns: store.columns,
          brightness: store.brightness,
          contrast: store.contrast,
          invert: store.invert,
          charset: store.charset,
          colorMode: store.colorMode,
          fontSize: store.fontSize,
          totalFrames: store.totalFrames,
          fps: store.fps,
        };
        const progress = (p: number) => store.setExportProgress(p);

        if (format === "gif") {
          await exportGif(source, w, h, opts, progress);
        } else if (format === "mp4") {
          await exportVideo(source, w, h, opts, progress);
        }
      } finally {
        store.setExporting(false);
      }
    },
    [store],
  );

  /* ── Derived ────────────────────────────────────────────────────────── */
  const hasMedia = store.mediaType !== null;

  /* ═════════════════════════════════════════════════════════════════════
   * Render
   * ═════════════════════════════════════════════════════════════════════ */
  return (
    <div className="space-y-6">
      {/* ── Description ───────────────────────────────────────────────── */}
      <p className="text-sm text-neutral-400 leading-relaxed">
        Convert any image or video to ASCII art in real time. Tune the render
        style, toggle colour mode, animate the output, then export as PNG, WebP,
        GIF, or MP4.
      </p>

      {/* ── Toolbar ───────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          className="gap-1.5"
        >
          <Upload className="h-4 w-4" />
          Import media
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={(e) => handleUpload(e.target.files?.[0])}
        />

        {store.mediaType === "video" && (
          <Button
            variant="outline"
            size="sm"
            onClick={toggleVideoPlayback}
            className="gap-1.5"
          >
            {store.videoPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            {store.videoPlaying ? "Pause" : "Play"}
          </Button>
        )}

        {/* Export buttons */}
        <div className="flex gap-1 ml-auto">
          {(["png", "webp", "gif", "mp4"] as ExportFormat[]).map((fmt) => (
            <Button
              key={fmt}
              variant="secondary"
              size="sm"
              disabled={!hasMedia || store.exporting}
              onClick={() => handleExport(fmt)}
              className="gap-1"
            >
              <Download className="h-3.5 w-3.5" />
              {fmt.toUpperCase()}
            </Button>
          ))}
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={store.reset}
          title="Reset all settings"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      {/* ── Export progress bar ────────────────────────────────────────── */}
      {store.exporting && (
        <div className="flex items-center gap-3 text-sm text-neutral-400">
          <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
          <span>Exporting… {Math.round(store.exportProgress)}%</span>
          <div className="flex-1 h-1.5 rounded-full bg-neutral-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-200"
              style={{ width: `${store.exportProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* ── Main two-column layout ────────────────────────────────────── */}
      <div className="grid lg:grid-cols-[300px_1fr] gap-6">
        {/* ── Controls panel ──────────────────────────────────────────── */}
        <aside className="space-y-5 rounded-xl border border-neutral-800 bg-neutral-950/60 p-4">
          {/* Columns */}
          <ControlRow
            icon={<Columns3 className="h-3.5 w-3.5" />}
            label={`Columns: ${store.columns}`}
          >
            <Slider
              min={24}
              max={220}
              step={1}
              value={[store.columns]}
              onValueChange={([v]) => store.setColumns(v)}
            />
          </ControlRow>

          {/* Brightness */}
          <ControlRow
            icon={<Sun className="h-3.5 w-3.5" />}
            label={`Brightness: ${store.brightness}`}
          >
            <Slider
              min={-100}
              max={100}
              step={1}
              value={[store.brightness]}
              onValueChange={([v]) => store.setBrightness(v)}
            />
          </ControlRow>

          {/* Contrast */}
          <ControlRow
            icon={<Contrast className="h-3.5 w-3.5" />}
            label={`Contrast: ${store.contrast}`}
          >
            <Slider
              min={-100}
              max={100}
              step={1}
              value={[store.contrast]}
              onValueChange={([v]) => store.setContrast(v)}
            />
          </ControlRow>

          {/* Font size */}
          <ControlRow
            icon={<Type className="h-3.5 w-3.5" />}
            label={`Font size: ${store.fontSize}px`}
          >
            <Slider
              min={4}
              max={16}
              step={1}
              value={[store.fontSize]}
              onValueChange={([v]) => store.setFontSize(v)}
            />
          </ControlRow>

          {/* Charset preset */}
          <div>
            <Label className="flex items-center gap-1.5 mb-2 text-xs text-neutral-400 uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5" /> Charset preset
            </Label>
            <Select
              value={store.charsetPreset}
              onValueChange={(v) =>
                store.setCharsetPreset(v as CharsetPresetKey)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(CHARSET_PRESETS).map((k) => (
                  <SelectItem key={k} value={k}>
                    {k}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Custom charset */}
          <div>
            <Label className="mb-2 block text-xs text-neutral-400 uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Palette className="h-3.5 w-3.5" /> Custom charset (left =
                darkest)
              </span>
            </Label>
            <input
              value={store.charset}
              onChange={(e) => store.setCharset(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-neutral-700 bg-neutral-900 text-neutral-200 font-mono text-sm placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 transition-shadow"
              placeholder=" .:-=+*#%@"
            />
          </div>

          {/* Toggles */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3 pt-1">
            <ToggleRow
              label="Invert"
              checked={store.invert}
              onChange={store.setInvert}
            />
            <ToggleRow
              label="Color"
              checked={store.colorMode === "color"}
              onChange={(v) => store.setColorMode(v ? "color" : "mono")}
            />
            {store.mediaType === "image" && (
              <ToggleRow
                label="Animate"
                checked={store.animate}
                onChange={store.setAnimate}
              />
            )}
          </div>

          {/* Animation controls */}
          {store.animate && store.mediaType === "image" && (
            <div className="space-y-4 rounded-lg border border-neutral-800 bg-neutral-900/50 p-4">
              <ControlRow
                icon={<Timer className="h-3.5 w-3.5" />}
                label={`FPS: ${store.fps}`}
              >
                <Slider
                  min={2}
                  max={24}
                  step={1}
                  value={[store.fps]}
                  onValueChange={([v]) => store.setFps(v)}
                />
              </ControlRow>
              <ControlRow
                icon={<Film className="h-3.5 w-3.5" />}
                label={`Frames: ${store.totalFrames}`}
              >
                <Slider
                  min={4}
                  max={64}
                  step={1}
                  value={[store.totalFrames]}
                  onValueChange={([v]) => store.setTotalFrames(v)}
                />
              </ControlRow>
            </div>
          )}
        </aside>

        {/* ── Canvas output (with drag-and-drop zone) ─────────────────── */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative rounded-xl border bg-black p-2 overflow-auto max-h-[38rem] flex items-start justify-center transition-colors duration-200 ${
            store.dragOver
              ? "border-indigo-500 ring-2 ring-indigo-500/30"
              : "border-neutral-800"
          }`}
        >
          {/* Drag overlay */}
          {store.dragOver && (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-black/70 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-2 text-indigo-400">
                <Upload className="h-8 w-8" />
                <span className="text-sm font-medium">Drop file to import</span>
              </div>
            </div>
          )}

          <canvas
            ref={outputCanvasRef}
            className="max-w-full"
            style={{ imageRendering: "pixelated" }}
          />
        </div>
      </div>

      {/* ── Media type indicator ───────────────────────────────────────── */}
      {hasMedia && (
        <div className="flex items-center gap-2 text-xs text-neutral-500">
          {store.mediaType === "image" ? (
            <ImageIcon className="h-3.5 w-3.5" />
          ) : (
            <Video className="h-3.5 w-3.5" />
          )}
          Source: {store.mediaType}
        </div>
      )}
    </div>
  );
}
