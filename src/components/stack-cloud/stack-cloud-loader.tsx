"use client";

import { STACK_CLOUD_BREAKPOINTS } from "~/constants/breakpoints";
import { DOMAIN_COLORS_HEX, PRIMARY_COLOR } from "~/constants/colors";
import { DOMAINS } from "~/constants/domains";

/**
 * Loading spinner matching RootNodeChart dimensions exactly
 * Ring-style "traffic jam" effect with domain colors animating around a donut ring
 * Pure SVG with CSS animations - uses percentage-based viewBox (0 0 100 100)
 */
export function StackCloudLoader() {
  const colors = DOMAINS.map((domain) => DOMAIN_COLORS_HEX[domain]);

  const centerX = 50;
  const centerY = 50;

  // Match RootNode dimension calculations (use-dimensions.ts:35, root-node.tsx:73, root-node-chart.tsx:71)
  const rootRadiusPercent = STACK_CLOUD_BREAKPOINTS.ROOT_RADIUS_SCALE * 100; // 20
  const pieRadiusPercent = rootRadiusPercent * 0.75; // 15
  const ringThicknessPercent = pieRadiusPercent * 0.1; // 1.5
  const ringRadiusPercent = pieRadiusPercent - ringThicknessPercent / 2;
  const circumference = 2 * Math.PI * ringRadiusPercent;

  const segmentLength = circumference / 4;
  const baseSegment = segmentLength;
  const expandedSegment = baseSegment * 1.6; // 60% expansion creates overlap effect
  const baseGap = circumference - baseSegment;
  const shrunkGap = circumference - expandedSegment;

  // Font sizing (root-node-experience.tsx:78, experience-ticker.tsx:116)
  const yearsFontSizePercent = rootRadiusPercent * 0.144 * 1.44;

  return (
    <div className="stack-cloud-wrapper">
      <svg
        className="stack-cloud-svg"
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid"
        role="img"
        aria-label="Loading technology stack visualization"
      >
        <g className="spinner-ring-container">
          {DOMAINS.map((domain, index) => {
            const offset = -index * segmentLength;

            return (
              <circle
                key={domain}
                className={`spinner-ring-segment spinner-ring-segment-${index}`}
                cx={centerX}
                cy={centerY}
                r={ringRadiusPercent}
                fill="none"
                stroke={colors[index]}
                strokeWidth={ringThicknessPercent}
                strokeDasharray={`${baseSegment} ${baseGap}`}
                strokeDashoffset={offset}
                opacity="0.85"
                style={{
                  animationDelay: `${index * 0.25}s`,
                  ["--dash-base" as string]: `${baseSegment}`,
                  ["--dash-expanded" as string]: `${expandedSegment}`,
                  ["--dash-gap" as string]: `${baseGap}`,
                  ["--dash-gap-shrink" as string]: `${shrunkGap}`,
                }}
              />
            );
          })}
        </g>

        <circle
          cx={centerX}
          cy={centerY}
          r={pieRadiusPercent - ringThicknessPercent * 2}
          fill={PRIMARY_COLOR}
          opacity="0.08"
        />

        <text
          x={centerX}
          y={centerY}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={PRIMARY_COLOR}
          fontSize={yearsFontSizePercent}
          fontWeight="700"
          style={{
            textShadow: "0 1px 3px oklch(0% 0 0 / 0.3)",
          }}
        >
          Loading...
        </text>
      </svg>
    </div>
  );
}
