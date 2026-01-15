"use client";

import { Suspense } from "react";

import { StackCloudContent } from "./stack-cloud-content";
import { StackCloudLoader } from "./stack-cloud-loader";

/**
 * Main StackCloud component - Pure CSS visualization
 * Replaces D3.js force-directed graph with CSS Grid layout
 * Mobile-first design with responsive breakpoints
 */
export function StackCloud() {
  return (
    // biome-ignore lint/correctness/useUniqueElementIds: Static ID required for skip link navigation target
    <div id="stack" className="flex flex-col h-full md:h-full">
      <h2 className="pb-6 md:pb-0 text-2xl font-bold md:text-center md:pt-10 hidden md:block landscape-mobile:hidden">
        Stack
      </h2>
      <div className="flex-1 flex items-center justify-center">
        <Suspense fallback={<StackCloudLoader />}>
          <StackCloudContent />
        </Suspense>
      </div>
    </div>
  );
}
