import { useSearchParams } from "next/navigation";

import { memo, useCallback, useEffect, useMemo, useState } from "react";

import type { Dimensions, Domain } from "~/types";

import { KLEIN_BLUE } from "~/constants/colors";
import { PROJECTS } from "~/data/projects";
import { useAccessibility } from "~/hooks/use-accessibility";
import { calculateDomainExperiences } from "~/utils/calculate-domain-size";
import { matchesDomainName } from "~/utils/get-domain-names";
import { getSearchQuery } from "~/utils/search-params";
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

  const a11y = useAccessibility();

  // Apply default value for isActiveHover
  const activeHover = isActiveHover ?? false;

  const currentSearchQuery = getSearchQuery(searchParams);

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

  // Set initial hovered domain based on selected domain in search params
  useEffect(() => {
    const matchedDomain = matchesDomainName(currentSearchQuery, PROJECTS);
    setHoveredDomain(matchedDomain);
  }, [currentSearchQuery]);

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

// Memoize to prevent re-renders when dimensions or hover state haven't changed
export const RootNode = memo(RootNodeComponent, (prevProps, nextProps) => {
  return (
    prevProps.dimensions.rootRadius === nextProps.dimensions.rootRadius &&
    prevProps.dimensions.centerX === nextProps.dimensions.centerX &&
    prevProps.dimensions.centerY === nextProps.dimensions.centerY &&
    prevProps.hoveredStack?.id === nextProps.hoveredStack?.id &&
    prevProps.isActiveHover === nextProps.isActiveHover
  );
});
