"use client";

import { useEffect, useRef, useState } from "react";

const GRAIN_TEXTURE_SVG =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc1IiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIxIi8+PC9zdmc+";

// How fast the video drifts relative to scroll (0 = no drift, 1 = full scroll speed)
const PARALLAX_RATIO = 0.25;

interface VideoBackgroundProps {
  src: string;
  fallbackColor?: string;
  overlayOpacity?: number;
  className?: string;
}

export default function VideoBackground({
  src,
  fallbackColor = "#0a0a0f",
  overlayOpacity = 0.55,
  className = "",
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

  // Parallax scroll effect — direct DOM mutation for zero-React-overhead 60 fps
  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");

    const onScroll = () => {
      // Skip scheduling a new frame if one is already pending
      if (rafRef.current !== null) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        const video = videoRef.current;
        if (video) {
          // translate3d triggers GPU compositing; only Y axis is animated
          video.style.transform = `translate3d(0, ${-window.scrollY * PARALLAX_RATIO}px, 0)`;
        }
      });
    };

    const resetTransform = () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      if (videoRef.current) videoRef.current.style.transform = "";
    };

    const attach = () => window.addEventListener("scroll", onScroll, { passive: true });
    const detach = () => {
      window.removeEventListener("scroll", onScroll);
      resetTransform();
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
      className={`fixed inset-0 -z-10 overflow-hidden ${className}`}
      style={{ backgroundColor: fallbackColor }}
      aria-hidden="true"
    >
      {/*
       * The video is deliberately oversized (160% tall, centered at -30%)
       * so there is always enough visual margin for the parallax translation.
       * overflow-hidden on the parent clips anything that drifts out of view.
       */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className={`absolute w-full object-cover transition-opacity duration-[1800ms] ease-out ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
        style={{
          height: "160%",
          top: "-30%",
          willChange: "transform",
        }}
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
