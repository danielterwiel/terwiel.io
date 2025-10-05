import { usePathname, useRouter, useSearchParams } from "next/navigation";

import type { Domain } from "~/data/projects";
import type { Dimensions } from "~/types/simulation";
import { Icon } from "~/components/icon";
import { DOMAIN_COLORS } from "~/constants/colors";
import { STACK_SELECTION_SCALE } from "~/constants/stack-selection-scale";
import { getSearchQuery, toggleSearchParam } from "~/utils/search-params";

interface StackNodeProps {
  stack: {
    id: string;
    name: string;
    iconKey: string;
    color: string;
    domain: Domain;
  };
  dimensions: Dimensions;
  sizeFactors: Map<string, number>;
  selected?: boolean;
  highlighted?: boolean;
  nodeRef: (el: SVGGElement | null) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

/**
 * Individual stack node component
 * Displays a technology stack icon with proper sizing based on experience
 */
export function StackNode({
  stack,
  dimensions,
  sizeFactors,
  selected = false,
  highlighted = false,
  nodeRef,
  onMouseEnter,
  onMouseLeave,
}: StackNodeProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const IconComponent = Icon[stack.iconKey as keyof typeof Icon];

  const currentSearchQuery = getSearchQuery(searchParams);

  // Get experience-based size factor (0.75-2.5x baseline)
  const sizeFactor = sizeFactors.get(stack.name) ?? 1.0;

  // Apply size factor to both node radius and icon size
  const nodeRadius = dimensions.stackRadius * sizeFactor;
  const iconSize = nodeRadius * 1.4; // 70% of diameter

  // Scale factor for SVG with 24x24 viewBox
  const iconScale = iconSize / 24;

  // Grow when selected (applied via transform scale)
  const groupScale = selected ? STACK_SELECTION_SCALE : 1;

  // Get domain color for border
  const borderColor = DOMAIN_COLORS[stack.domain];

  // Determine gradient based on selection state
  const gradientId = `glow-${stack.domain}-${selected ? "selected" : "unselected"}`;

  // Glow circle size based on selection state
  const glowRadius = selected || highlighted ? nodeRadius * 1.5 : nodeRadius;

  // Calculate icon color and opacity based on selected/highlighted state
  let iconColor: string;
  let iconOpacity: number;

  if (selected) {
    iconColor = stack.color;
    iconOpacity = 1;
  } else if (highlighted) {
    iconColor = stack.color;
    iconOpacity = 0.5;
  } else {
    iconColor = borderColor;
    iconOpacity = 0.2;
  }

  // Handle click to toggle URL search params
  const handleClick = () => {
    const queryString = toggleSearchParam(currentSearchQuery, stack.name);
    router.push(`${pathname}${queryString}`);
  };

  return (
    // Outer group: controlled by D3 for positioning (translate)
    <g ref={nodeRef}>
      {/* Inner group: controlled by React for scaling */}
      {/* biome-ignore lint/a11y/useSemanticElements: SVG elements cannot use semantic HTML elements */}
      <g
        transform={`scale(${groupScale})`}
        role="button"
        tabIndex={0}
        aria-label={`${stack.name} technology`}
        onClick={handleClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        style={{ cursor: "pointer", transition: "transform 0.3s ease" }}
      >
        {/* Glow circle behind the main node */}
        <circle r={glowRadius} fill={`url(#${gradientId})`} />

        {/* Main node circle */}
        <circle
          r={nodeRadius}
          fill="white"
          stroke={borderColor}
          strokeWidth={1}
        />

        {/* Icon */}
        {IconComponent && (
          <g
            transform={`translate(${-iconSize / 2},${-iconSize / 2}) scale(${iconScale})`}
            style={{ pointerEvents: "none", color: iconColor }}
            opacity={iconOpacity}
          >
            <IconComponent width={24} height={24} viewBox="0 0 24 24" />
          </g>
        )}
      </g>
    </g>
  );
}
