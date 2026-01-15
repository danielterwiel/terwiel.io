"use client";

import { clsx } from "clsx";

import { DOMAIN_COLORS_HEX, PRIMARY_COLOR } from "~/constants/colors";
import { DOMAINS } from "~/constants/domains";

/**
 * Loading state for StackCloud
 * Ring-style animation with domain colors
 */
export function StackCloudLoader() {
  const colors = DOMAINS.map((domain) => DOMAIN_COLORS_HEX[domain]);

  return (
    <div className="stack-cloud-wrapper w-full flex items-center justify-center min-h-[300px] md:min-h-[400px]">
      <div className="relative w-32 h-32 md:w-40 md:h-40">
        {/* Animated ring segments */}
        <svg
          className="w-full h-full animate-spin"
          style={{ animationDuration: "3s" }}
          viewBox="0 0 100 100"
          role="img"
          aria-label="Loading technology stack visualization"
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
    </div>
  );
}
