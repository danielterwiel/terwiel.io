import type { Dimensions } from "~/types/simulation";
import { Icon } from "~/components/icon";

interface StackNodeProps {
  stack: {
    id: string;
    name: string;
    iconKey: string;
    color: string;
  };
  dimensions: Dimensions;
  sizeFactors: Map<string, number>;
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

  return (
    <g
      ref={nodeRef}
      className="node stack-node"
      aria-label={`${stack.name} technology`}
    >
      <circle
        r={nodeRadius}
        fill="white"
        stroke="#002FA7"
        strokeWidth={2}
      />
      {IconComponent && (
        <g
          transform={`translate(${-iconSize / 2},${-iconSize / 2}) scale(${scale})`}
          style={{ pointerEvents: "none", color: stack.color }}
        >
          <IconComponent width={24} height={24} viewBox="0 0 24 24" />
        </g>
      )}
    </g>
  );
}
