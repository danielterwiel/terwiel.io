"use client";

import { clsx } from "clsx";

import { DOMAIN_COLORS_HEX, PRIMARY_COLOR } from "~/constants/colors";
import { DOMAINS } from "~/constants/domains";

/**
 * Loading state for StackCloud
 * Ring-style animation with domain colors
 *
 * ## Accessibility (WCAG 2.2 SC 4.1.3 - Status Messages)
 *
 * - Uses `<output>` element with `aria-live="polite"` to announce loading state
 * - Screen readers will announce "Loading technology stack" when this renders
 * - Animation respects prefers-reduced-motion (via CSS in globals.css)
 * - SVG is decorative (aria-hidden) since text provides accessible content
 */
export function StackCloudLoader() {
  const colors = DOMAINS.map((domain) => DOMAIN_COLORS_HEX[domain]);

  return (
    <output
      className="stack-cloud-wrapper w-full flex items-center justify-center min-h-[300px] md:min-h-[400px]"
      aria-live="polite"
      aria-label="Loading technology stack visualization"
    >
      {/* Screen reader announcement */}
      <span className="sr-only">Loading technology stack, please wait...</span>
      <div className="relative w-32 h-32 md:w-40 md:h-40">
        {/* Animated ring segments - decorative, hidden from screen readers */}
        <svg
          className="w-full h-full animate-spin"
          style={{ animationDuration: "3s" }}
          viewBox="0 0 100 100"
          aria-hidden="true"
          focusable="false"
        >
          {DOMAINS.map((domain, index) => {
            const circumference = 2 * Math.PI * 40;
            const segmentLength = circumference / DOMAINS.length;
            const offset = -index * segmentLength;

            return (
              <circle
                key={domain}
                className={clsx("opacity-70")}
                cx={50}
                cy={50}
                r={40}
                fill="none"
                stroke={colors[index]}
                strokeWidth={4}
                strokeDasharray={`${segmentLength * 0.8} ${circumference - segmentLength * 0.8}`}
                strokeDashoffset={offset}
                strokeLinecap="round"
              />
            );
          })}
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="text-sm font-semibold"
            style={{ color: PRIMARY_COLOR }}
          >
            Loading...
          </span>
        </div>
      </div>
    </output>
  );
}
