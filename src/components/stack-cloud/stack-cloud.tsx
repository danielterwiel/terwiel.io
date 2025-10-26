"use client";

import dynamic from "next/dynamic";

import { useEffect, useState, useTransition } from "react";

import { StackCloudLoader } from "./stack-cloud-loader";

/**
 * Main StackCloud component with dynamic loading
 * Splits d3.js (290.4kB) into separate bundle and shows loader during load
 * Cross-fades between loader and content with minimum display time
 * Uses useTransition to defer content reveals and avoid blocking critical updates
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
const FADE_DELAY = 50;

export function StackCloud() {
  const [mounted, setMounted] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    // Mount component immediately to start dynamic import early
    setMounted(true);

    // Wait for minimum loading time, then defer content reveal using useTransition
    // This prevents the content reveal animation from blocking other updates
    const timer = setTimeout(() => {
      startTransition(() => {
        // Small delay before showing content to ensure smooth fade transition
        setTimeout(() => {
          setShowContent(true);
        }, FADE_DELAY);
      });
    }, MIN_LOADING_TIME);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col h-full md:h-full">
      <h2 className="mb-6 text-2xl font-bold md:text-center hidden md:block">
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
