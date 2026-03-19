"use client";

import { useEffect, useRef, useState } from "react";

const GRAIN_TEXTURE_SVG =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc1IiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIxIi8+PC9zdmc+";

interface VideoBackgroundProps {
  src: string;
  fallbackColor?: string;
  overlayOpacity?: number;
  className?: string;
  /** CSS length value (e.g. "3.5rem") to offset the top of the video container,
   *  so the video starts below a fixed/sticky header instead of behind it. */
  topOffset?: string;
  /** Uniform scale applied to the video element (e.g. 0.85 zooms out by 15%).
   *  Values < 1 show more of the video content at the cost of revealing the
   *  fallbackColor background at the edges. Defaults to 1 (no scaling).
   *  Note: this is a cosmetic CSS transform applied to a decorative background
   *  element; it does not affect page layout or interact with browser zoom. */
  videoScale?: number;
  /** Blur radius in pixels applied to the video to soften low-quality footage.
   *  Defaults to 0 (no blur). */
  blur?: number;
}

export default function VideoBackground({
  src,
  fallbackColor = "#0a0a0f",
  overlayOpacity = 0.55,
  className = "",
  topOffset = "0px",
  videoScale = 1,
  blur = 0,
}: VideoBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const rafRef = useRef<number | null>(null);

  // Video ready detection
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let settled = false;
    const handleReady = () => {
      if (settled) return;
      settled = true;
      // Start at frame 2 to avoid a buggy first frame (~1 frame at 30 fps)
      video.currentTime = 0.04;
      setIsLoaded(true);
    };
    video.addEventListener("canplay", handleReady);
    video.addEventListener("canplaythrough", handleReady);
    video.addEventListener("loadeddata", handleReady);

    // If the browser already has the video buffered (e.g. from cache), trigger now.
    if (video.readyState >= 3) {
      handleReady();
    }

    return () => {
      video.removeEventListener("canplay", handleReady);
      video.removeEventListener("canplaythrough", handleReady);
      video.removeEventListener("loadeddata", handleReady);
    };
  }, []);

  // Scroll-driven frame scrubbing — advances the video currentTime as the user scrolls
  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");

    const onScroll = () => {
      // Skip scheduling a new frame if one is already pending
      if (rafRef.current !== null) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        const video = videoRef.current;
        if (!video || !video.duration || video.seekable.length === 0) return;

        const scrollMax =
          document.documentElement.scrollHeight - window.innerHeight;
        // Clamp to [0, 1] to guard against negative overscroll and transient
        // scrollHeight fluctuations (e.g. mobile address-bar hide/show) that
        // would otherwise push currentTime past the end of the video.
        const progress =
          scrollMax > 0
            ? Math.max(0, Math.min(1, window.scrollY / scrollMax))
            : 0;
        // Skip buggy first frame: remap so progress 0 maps to frame 2
        const frameOffset = 0.04;
        const usable = video.duration - frameOffset;
        video.currentTime = frameOffset + progress * usable;
      });
    };

    const attach = () =>
      window.addEventListener("scroll", onScroll, { passive: true });
    const detach = () => {
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };

    // Respond dynamically if the user changes their motion preference mid-session
    const handleMqlChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        detach();
      } else {
        attach();
      }
    };

    if (!mql.matches) attach();
    mql.addEventListener("change", handleMqlChange);

    return () => {
      mql.removeEventListener("change", handleMqlChange);
      detach();
    };
  }, []);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 -z-10 overflow-hidden ${className}`}
      style={{ top: topOffset, backgroundColor: fallbackColor }}
      aria-hidden="true"
    >
      {/*
       * The video is deliberately kept at 100% height so it fills the fixed
       * viewport. Scroll-driven scrubbing updates currentTime directly, so
       * no parallax oversizing is required.
       */}
      <video
        ref={videoRef}
        muted
        playsInline
        preload="auto"
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[1800ms] ease-out ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
        style={(() => {
          const s: React.CSSProperties = {};
          if (videoScale !== 1) s.transform = `scale(${videoScale})`;
          if (blur > 0) s.filter = `blur(${blur}px)`;
          return Object.keys(s).length > 0 ? s : undefined;
        })()}
      >
        <source src={src} type="video/mp4" />
      </video>

      {/* Dark overlay to ensure text readability */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: `rgba(10, 10, 15, ${overlayOpacity})` }}
      />

      {/* Subtle grain texture for cinematic feel */}
      <div
        className="absolute inset-0 opacity-[0.03] mix-blend-overlay bg-repeat"
        style={{ backgroundImage: `url('${GRAIN_TEXTURE_SVG}')` }}
      />
    </div>
  );
}
