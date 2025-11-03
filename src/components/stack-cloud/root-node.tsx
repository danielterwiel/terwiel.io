import { useSearchParams } from "next/navigation";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { Dimensions, Domain } from "~/types";

import { KLEIN_BLUE } from "~/constants/colors";
import { PROJECTS } from "~/data/projects";
import { useAccessibility } from "~/hooks/use-accessibility";
import { calculateDomainExperiences } from "~/utils/calculate-domain-size";
import { matchesDomainName } from "~/utils/get-domain-names";
import { getSearchFilter, getSearchQuery } from "~/utils/search-params";
import { RootNodeChart } from "./root-node-chart";
import { RootNodeExperience } from "./root-node-experience";

interface RootNodeProps {
  dimensions: Dimensions;
  nodeRef: (el: SVGGElement | null) => void;
  onDomainHover?: (domain: Domain | null) => void;
  hoveredStack?: {
    id: string;
    name: string;
    iconKey: string;
    color: string;
    domain: Domain;
  } | null;
  isActiveHover?: boolean;
}

interface PieSegmentData {
  domain: string;
  value: number;
  color: string;
  percentage: number;
}

/**
 * Root node component for the stack visualization
 * Displays the centered "root" node with a domain pie chart using d3
 * Memoized to prevent unnecessary re-renders
 */
// biome-ignore lint/style/useComponentExportOnlyModules: Component is exported via memo wrapper
const RootNodeComponent = (props: RootNodeProps) => {
  const { dimensions, nodeRef, onDomainHover, hoveredStack, isActiveHover } =
    props;
  const searchParams = useSearchParams();
  const [hoveredDomain, setHoveredDomain] = useState<Domain | null>(null);
  const [isAnimating, setIsAnimating] = useState(true);
  const skipNextEffectRef = useRef(false);

  const a11y = useAccessibility();

  // Apply default value for isActiveHover
  const activeHover = isActiveHover ?? false;

  const currentSearchQuery = getSearchQuery(searchParams);
  const currentFilter = getSearchFilter(searchParams);

  const domainExperiences = useMemo(
    () => calculateDomainExperiences(PROJECTS),
    [],
  );

  // Prepare data for d3 pie chart
  const pieData: PieSegmentData[] = useMemo(
    () =>
      domainExperiences.map((exp) => ({
        domain: exp.domain,
        value: exp.percentage,
        color: a11y.getDomainColor(exp.domain),
        percentage: exp.percentage,
      })),
    [domainExperiences, a11y],
  );

  const pieRadius = dimensions.rootRadius * 0.75; // 75% of root radius

  // Set initial hovered domain based on selected domain in search/filter params
  // Check BOTH query (from SearchInput) and filter (from StackCloud) parameters
  // CRITICAL: Don't overwrite hover state set by RootNodeChart on click
  // The chart sets hover state BEFORE the URL updates, so we need to let it settle
  useEffect(() => {
    // If the chart just set the hover state, skip this update
    // to prevent flashing the default state
    if (skipNextEffectRef.current) {
      skipNextEffectRef.current = false;
      return;
    }

    // Check query first, then filter if no query match
    let matchedDomain = matchesDomainName(currentSearchQuery, PROJECTS);
    if (!matchedDomain) {
      matchedDomain = matchesDomainName(currentFilter, PROJECTS);
    }

    setHoveredDomain(matchedDomain);
  }, [currentSearchQuery, currentFilter]);

  const handleAnimationComplete = useCallback(() => {
    setIsAnimating(false);
  }, []);

  return (
    <g
      ref={nodeRef}
      aria-label="Root node with domain distribution"
      transform={`translate(${dimensions.centerX}, ${dimensions.centerY})`}
    >
      {/* Pie chart segments */}
      <RootNodeChart
        pieData={pieData}
        pieRadius={pieRadius}
        onDomainHover={onDomainHover}
        onAnimationComplete={handleAnimationComplete}
        setHoveredDomain={setHoveredDomain}
        onChartStateChange={() => {
          skipNextEffectRef.current = true;
        }}
      />

      {/* Border circle */}
      <circle
        r={dimensions.rootRadius}
        fill="none"
        stroke={KLEIN_BLUE}
        strokeWidth={0.1}
        className="magnetic-base magnetic-rounded-full"
        style={{
          animation: "borderGrow 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.4s both",
        }}
      />

      {/* Center experience display */}
      <RootNodeExperience
        dimensions={dimensions}
        hoveredStack={hoveredStack}
        hoveredDomain={hoveredDomain}
        isActiveHover={activeHover}
        isInitialAnimating={isAnimating}
      />

      <style jsx>{`
        @keyframes borderGrow {
          from {
            r: 0;
            opacity: 0;
          }
          to {
            r: ${dimensions.rootRadius};
            opacity: 1;
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        /* Respect reduced motion */
        @media (prefers-reduced-motion: reduce) {
          :global(.pie-segment),
          circle,
          text {
            animation: none !important;
            opacity: 0.7;
          }
          circle {
            opacity: 1;
          }
          text {
            opacity: 1;
          }
        }
      `}</style>
    </g>
  );
};

// Export component without memo to ensure RootNodeChart's useSearchParams() hook re-runs
// The memo was preventing re-renders when URL changed, causing the D3 chart to not update
export const RootNode = RootNodeComponent;
