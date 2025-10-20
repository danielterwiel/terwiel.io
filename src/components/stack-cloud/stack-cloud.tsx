"use client";

import dynamic from "next/dynamic";

import { useEffect, useState } from "react";

import { StackCloudLoader } from "./stack-cloud-loader";

/**
 * Main StackCloud component with dynamic loading
 * Splits d3.js (290.4kB) into separate bundle and shows loader during load
 * Cross-fades between loader and content with minimum display time
 */
const StackCloudContent = dynamic(
  () =>
    import("./stack-cloud-content").then((mod) => ({
      default: mod.StackCloudContent,
    })),
  {
    ssr: false,
  },
);

const MIN_LOADING_TIME = 800;

export function StackCloud() {
  const [mounted, setMounted] = useState(false);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => {
      setMinTimeElapsed(true);
    }, MIN_LOADING_TIME);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (mounted && minTimeElapsed) {
      const fadeTimer = setTimeout(() => {
        setShowContent(true);
      }, 50);
      return () => clearTimeout(fadeTimer);
    }
  }, [mounted, minTimeElapsed]);

  return (
    <div className="flex flex-col md:h-full md:overflow-hidden">
      <h2 className="mb-6 hidden shrink-0 text-2xl font-bold md:block md:text-center">
        Stack
      </h2>
      <div
        className="flex-1 flex items-center justify-center md:min-h-0"
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
