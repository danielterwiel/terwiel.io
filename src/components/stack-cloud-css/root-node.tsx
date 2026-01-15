"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { useMemo, useTransition } from "react";

import type { Domain, DomainExperience } from "~/types";

import {
  DOMAIN_COLORS_HEX,
  KLEIN_BLUE,
  PRIMARY_COLOR,
} from "~/constants/colors";
import { useAccessibility } from "~/hooks/use-accessibility";
import { getSearchFilter, toggleFilterParam } from "~/utils/search-params";

interface RootNodeProps {
  domainExperiences: DomainExperience[];
  hoveredDomain: Domain | null;
  hoveredStack: {
    id: string;
    name: string;
    iconKey: string;
    color: string;
    domain: Domain;
  } | null;
  onDomainHover: (domain: Domain | null) => void;
  rovingTabindex: {
    registerItemRef: (
      id: string,
      element: HTMLElement | SVGGElement | null,
    ) => void;
    getTabIndex: (itemId: string) => number;
    setActiveIndex: (index: number) => void;
  };
}

/**
 * Root node with domain pie chart - Pure SVG without D3
 * Uses CSS conic-gradient approach rendered as SVG paths
 */
export function RootNode({
  domainExperiences,
  hoveredDomain,
  hoveredStack,
  onDomainHover,
  rovingTabindex,
}: RootNodeProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [_isPending, startTransition] = useTransition();

  const a11y = useAccessibility();

  const currentFilter = getSearchFilter(searchParams);

  // Calculate pie chart segments using pure JavaScript
  const pieSegments = useMemo(() => {
    let currentAngle = -90; // Start at top (12 o'clock)
    const total = domainExperiences.reduce(
      (sum, exp) => sum + exp.percentage,
      0,
    );

    return domainExperiences.map((exp) => {
      const angle = (exp.percentage / total) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;
      currentAngle = endAngle;

      return {
        domain: exp.domain,
        percentage: exp.percentage,
        startAngle,
        endAngle,
        color: DOMAIN_COLORS_HEX[exp.domain],
      };
    });
  }, [domainExperiences]);

  // Convert angle to radians
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

  // Generate SVG arc path
  const getArcPath = (
    startAngle: number,
    endAngle: number,
    innerRadius: number,
    outerRadius: number,
    centerX: number,
    centerY: number,
  ) => {
    const startRadians = toRadians(startAngle);
    const endRadians = toRadians(endAngle);

    const x1 = centerX + outerRadius * Math.cos(startRadians);
    const y1 = centerY + outerRadius * Math.sin(startRadians);
    const x2 = centerX + outerRadius * Math.cos(endRadians);
    const y2 = centerY + outerRadius * Math.sin(endRadians);
    const x3 = centerX + innerRadius * Math.cos(endRadians);
    const y3 = centerY + innerRadius * Math.sin(endRadians);
    const x4 = centerX + innerRadius * Math.cos(startRadians);
    const y4 = centerY + innerRadius * Math.sin(startRadians);

    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

    return `
      M ${x1} ${y1}
      A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}
      L ${x3} ${y3}
      A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}
      Z
    `;
  };

  // Handle segment click
  const handleSegmentClick = (domain: Domain) => {
    const queryString = toggleFilterParam(currentFilter, domain);
    startTransition(() => {
      router.replace(`${pathname}${queryString}`, { scroll: false });
    });
  };

  // Handle keyboard interaction
  const handleKeyDown = (domain: Domain) => (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleSegmentClick(domain);
    }
  };

  // SVG dimensions
  const size = 160;
  const center = size / 2;
  const outerRadius = 60;
  const innerRadius = 40;

  // Calculate display text
  const displayDomain = hoveredStack?.domain ?? hoveredDomain;
  const displayExperience = displayDomain
    ? domainExperiences.find((exp) => exp.domain === displayDomain)
    : null;

  return (
    <div className="flex flex-col items-center">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="root-node-svg"
        role="img"
        aria-label="Domain experience distribution"
      >
        {/* Pie chart segments */}
        {pieSegments.map((segment, index) => {
          const isHovered = hoveredDomain === segment.domain;
          const isStackHovered = hoveredStack?.domain === segment.domain;
          const isHighlighted = isHovered || isStackHovered;

          return (
            // biome-ignore lint/a11y/useSemanticElements: SVG elements cannot use semantic HTML elements
            <g
              key={segment.domain}
              role="button"
              tabIndex={rovingTabindex.getTabIndex(`segment-${index}`)}
              aria-label={`${segment.domain}: ${segment.percentage.toFixed(1)}% experience`}
              aria-pressed={isHighlighted}
              ref={(el) =>
                rovingTabindex.registerItemRef(`segment-${index}`, el)
              }
              onClick={() => handleSegmentClick(segment.domain)}
              onKeyDown={handleKeyDown(segment.domain)}
              onMouseEnter={() => onDomainHover(segment.domain)}
              onMouseLeave={() => onDomainHover(null)}
              onFocus={() => rovingTabindex.setActiveIndex(index)}
              className="cursor-pointer outline-none"
              style={{
                transition: a11y.prefersReducedMotion
                  ? "none"
                  : "transform 200ms ease-out, opacity 200ms ease-out",
              }}
            >
              <path
                d={getArcPath(
                  segment.startAngle,
                  segment.endAngle,
                  innerRadius,
                  outerRadius,
                  center,
                  center,
                )}
                fill={segment.color}
                stroke={KLEIN_BLUE}
                strokeWidth={0.5}
                opacity={isHighlighted ? 1 : 0.7}
                style={{
                  transform: isHighlighted ? "scale(1.05)" : "scale(1)",
                  transformOrigin: `${center}px ${center}px`,
                  transition: a11y.prefersReducedMotion
                    ? "none"
                    : "transform 200ms ease-out, opacity 200ms ease-out",
                }}
              />
              {/* Focus ring for keyboard navigation */}
              <path
                d={getArcPath(
                  segment.startAngle,
                  segment.endAngle,
                  innerRadius - 2,
                  outerRadius + 2,
                  center,
                  center,
                )}
                fill="none"
                stroke={KLEIN_BLUE}
                strokeWidth={2}
                className="opacity-0 focus-within:opacity-100"
                style={{
                  pointerEvents: "none",
                }}
              />
            </g>
          );
        })}

        {/* Center circle background */}
        <circle
          cx={center}
          cy={center}
          r={innerRadius - 4}
          fill={PRIMARY_COLOR}
          opacity={0.1}
        />

        {/* Border circle */}
        <circle
          cx={center}
          cy={center}
          r={outerRadius + 2}
          fill="none"
          stroke={KLEIN_BLUE}
          strokeWidth={0.5}
          opacity={0.3}
        />
      </svg>

      {/* Experience display below the chart */}
      <div
        className="text-center mt-2 h-12"
        aria-live="polite"
        aria-atomic="true"
      >
        {displayDomain ? (
          <>
            <div
              className="text-sm font-semibold"
              style={{ color: DOMAIN_COLORS_HEX[displayDomain] }}
            >
              {displayDomain}
            </div>
            <div className="text-xs text-gray-500">
              {displayExperience
                ? `${displayExperience.percentage.toFixed(0)}%`
                : ""}
            </div>
          </>
        ) : (
          <div className="text-xs text-gray-400">Hover to explore</div>
        )}
      </div>
    </div>
  );
}
