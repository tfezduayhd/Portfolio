"use client";

import { useEffect, useRef, useState } from "react";

const GRAIN_TEXTURE_SVG =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc1IiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIxIi8+PC9zdmc+";

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

  return (
    <div
      className={`fixed inset-0 -z-10 overflow-hidden ${className}`}
      style={{ backgroundColor: fallbackColor }}
      aria-hidden="true"
    >
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[1800ms] ease-out ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
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
