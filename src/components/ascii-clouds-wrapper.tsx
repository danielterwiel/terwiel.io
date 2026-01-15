"use client";

import dynamic from "next/dynamic";

/**
 * ASCII Clouds Wrapper - Client component for dynamic loading (PERF-001)
 *
 * This wrapper enables `ssr: false` for the AsciiClouds component, which is
 * only allowed in Client Components. The AsciiClouds component is:
 * 1. Purely decorative (canvas-based background effect)
 * 2. Not critical for initial render or LCP
 * 3. Heavy with Perlin noise calculations
 *
 * Loading it dynamically with `ssr: false` ensures:
 * - Zero impact on First Contentful Paint (FCP)
 * - Reduced initial JavaScript bundle size
 * - No SSR overhead for canvas-based rendering
 */
const AsciiClouds = dynamic(
  () => import("~/components/ascii-clouds").then((mod) => mod.AsciiClouds),
  {
    ssr: false,
  },
);

export function AsciiCloudsWrapper() {
  return <AsciiClouds />;
}
