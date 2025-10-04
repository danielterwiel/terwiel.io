import type { Domain } from "~/data/projects";
import type { Dimensions } from "~/types/simulation";
import { Icon } from "~/components/icon";
import { DOMAIN_COLORS } from "~/constants/domain-colors";

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
  nodeRef: (el: SVGGElement | null) => void;
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
  nodeRef,
}: StackNodeProps) {
  const IconComponent = Icon[stack.iconKey as keyof typeof Icon];

  // Get experience-based size factor (0.75-2.5x baseline)
  const sizeFactor = sizeFactors.get(stack.name) ?? 1.0;

  // Apply size factor to both node radius and icon size
  const nodeRadius = dimensions.stackRadius * sizeFactor;
  const iconSize = nodeRadius * 1.4; // 70% of diameter

  // Scale factor for SVG with 24x24 viewBox
  const scale = iconSize / 24;

  // Get domain color for border
  const borderColor = DOMAIN_COLORS[stack.domain];

  // Determine gradient based on selection state
  const gradientId = `glow-${stack.domain}-${selected ? "selected" : "unselected"}`;

  // Glow circle size based on selection state
  const glowRadius = selected ? nodeRadius * 1.8 : nodeRadius * 1.4;

  return (
    <g
      ref={nodeRef}
      className="node stack-node"
      aria-label={`${stack.name} technology`}
    >
      {/* Glow circle behind the main node */}
      <circle r={glowRadius} fill={`url(#${gradientId})`} />

      {/* Main node circle */}
      <circle
        r={nodeRadius}
        fill="white"
        stroke={borderColor}
        strokeWidth={0.5}
      />

      {/* Icon */}
      {IconComponent && (
        <g
          transform={`translate(${-iconSize / 2},${-iconSize / 2}) scale(${scale})`}
          style={{ pointerEvents: "none", color: stack.color }}
          opacity={0.5}
        >
          <IconComponent width={24} height={24} viewBox="0 0 24 24" />
        </g>
      )}
    </g>
  );
}
