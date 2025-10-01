"use client";

import { useState } from "react";

import type { Domain } from "~/data/projects";
import { PROJECTS } from "~/data/projects";
import { calculateDomainWeights } from "~/utils/calculate-domain-weights";
import { createArcPath } from "~/utils/create-arc-path";
import { getDomainColor } from "~/utils/domain-colors";

type PieChartProps = {
  size?: number;
  onDomainHover?: (domain: Domain | null) => void;
};

export function DomainPieChart({ size = 200, onDomainHover }: PieChartProps) {
  const [hoveredDomain, setHoveredDomain] = useState<Domain | null>(null);

  // Calculate domain weights from projects
  const domainWeights = calculateDomainWeights(PROJECTS);

  // Calculate pie chart sectors
  let currentAngle = -90; // Start at top (12 o'clock position)
  const sectors = domainWeights.map(({ domain, percentage }) => {
    const startAngle = currentAngle;
    const sweepAngle = (percentage / 100) * 360;
    const endAngle = startAngle + sweepAngle;
    currentAngle = endAngle;

    return {
      domain,
      percentage,
      startAngle,
      endAngle,
      sweepAngle,
    };
  });

  const centerX = size / 2;
  const centerY = size / 2;
  const radius = (size / 2) * 0.98; // Use almost full size

  const handleMouseEnter = (domain: Domain) => {
    setHoveredDomain(domain);
    onDomainHover?.(domain);
  };

  const handleMouseLeave = () => {
    setHoveredDomain(null);
    onDomainHover?.(null);
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="overflow-visible"
        role="img"
        aria-label="Domain distribution pie chart"
      >
        <title>Domain distribution across projects</title>
        <defs>
          {/* Define gradients for each domain */}
          {sectors.map(({ domain }) => {
            const color = getDomainColor(domain);
            return (
              <linearGradient
                key={`gradient-${domain}`}
                id={`gradient-${domain}`}
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop offset="0%" stopColor={color} stopOpacity="0.85" />
                <stop offset="100%" stopColor={color} stopOpacity="0.65" />
              </linearGradient>
            );
          })}
        </defs>
        {sectors.map(({ domain, startAngle, endAngle }) => {
          const isHovered = hoveredDomain === domain;
          const color = getDomainColor(domain);

          return (
            <g key={domain}>
              {/* Pie sector */}
              {/* biome-ignore lint/a11y/useSemanticElements: SVG path elements cannot be replaced with semantic button elements */}
              <path
                d={createArcPath(
                  centerX,
                  centerY,
                  radius,
                  startAngle,
                  endAngle,
                  isHovered,
                )}
                fill={`url(#gradient-${domain})`}
                opacity={isHovered ? 1 : 0.95}
                className="cursor-pointer transition-all duration-300 ease-out"
                style={{
                  filter: isHovered
                    ? `drop-shadow(0 0 12px ${color}80) drop-shadow(0 0 6px ${color}60)`
                    : `drop-shadow(0 2px 4px rgba(0, 0, 0, 0.12))`,
                }}
                role="button"
                tabIndex={0}
                aria-label={`${domain} domain sector`}
                onMouseEnter={() => handleMouseEnter(domain)}
                onMouseLeave={handleMouseLeave}
              />

              {/* Subtle border between sectors */}
              <path
                d={createArcPath(
                  centerX,
                  centerY,
                  radius,
                  startAngle,
                  endAngle,
                  isHovered,
                )}
                fill="none"
                stroke="rgba(255, 255, 255, 0.3)"
                strokeWidth="1.5"
                className="pointer-events-none"
              />
            </g>
          );
        })}
      </svg>

      {/* Domain label spanning entire node when hovered */}
      {hoveredDomain && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
          style={{
            animation: "fadeIn 0.3s ease-out",
          }}
        >
          <div
            className="w-full h-full rounded-full flex flex-col items-center justify-center text-center px-6"
            style={{
              background:
                "radial-gradient(circle, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0.95) 60%, rgba(255, 255, 255, 0.85) 100%)",
              backdropFilter: "blur(8px)",
            }}
          >
            <div
              className="text-2xl font-bold mb-2 drop-shadow-sm"
              style={{ color: getDomainColor(hoveredDomain) }}
            >
              {hoveredDomain}
            </div>
            <div className="text-lg text-gray-700 font-semibold">
              {sectors
                .find((s) => s.domain === hoveredDomain)
                ?.percentage.toFixed(1)}
              %
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
