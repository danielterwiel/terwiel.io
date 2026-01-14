"use client";

import dynamic from "next/dynamic";

import { useEffect, useState } from "react";

import { StackCloudLoader } from "./stack-cloud-loader";

/**
 * Main StackCloud component with dynamic loading
 * Splits d3.js (290.4kB) into separate bundle and shows loader during load
 * Cross-fades between loader and content with minimum display time
 * Optimized to prevent stuttering by using simpler state management
 */
const StackCloudContent = dynamic(
  () =>
    import("./stack-cloud-content").then((mod) => ({
      default: mod.StackCloudContent,
    })),
  {
    ssr: false,
    loading: () => null, // Return null to avoid flash of loading component
  },
);

const MIN_LOADING_TIME = 600;

export function StackCloud() {
  const [mounted, setMounted] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [contentLoaded, setContentLoaded] = useState(false);

  useEffect(() => {
    // Start dynamic import immediately
    setMounted(true);

    // Set minimum loading time
    const minTimer = setTimeout(() => {
      setContentLoaded(true);
    }, MIN_LOADING_TIME);

    return () => clearTimeout(minTimer);
  }, []);

  // Reveal content once both minimum time has passed and component is ready
  useEffect(() => {
    if (contentLoaded && mounted) {
      // Use requestAnimationFrame for smoother transition
      const raf = requestAnimationFrame(() => {
        setShowContent(true);
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [contentLoaded, mounted]);

  return (
    <div id="stack" className="flex flex-col h-full md:h-full">
      <h2 className="pb-6 md:pb-0 text-2xl font-bold md:text-center md:pt-10 hidden md:block landscape-mobile:hidden">
        Stack
      </h2>
      <div
        className="flex-1 flex items-center justify-center"
        style={{ position: "relative" }}
      >
        <div
          className="stack-cloud-wrapper w-full"
          style={{ position: "relative" }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              opacity: showContent ? 0 : 1,
              transition: "opacity 0.6s ease-in-out",
              pointerEvents: showContent ? "none" : "auto",
            }}
          >
            <StackCloudLoader />
          </div>

          {mounted && (
            <div
              style={{
                opacity: showContent ? 1 : 0,
                transition: "opacity 0.6s ease-in-out",
              }}
            >
              <StackCloudContent />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
