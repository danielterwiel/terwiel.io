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
  const sizeFactor = sizeFactors.get(stack.name) ?? 1.0;
  const nodeRadius = dimensions.stackRadius * sizeFactor;
  const iconSize = nodeRadius * 1.4; // 70% of diameter

  return (
    <g
      ref={nodeRef}
      className="node stack-node"
      aria-label={`${stack.name} technology`}
    >
      <circle
        r={nodeRadius}
        fill="white"
        stroke={stack.color}
        strokeWidth={2}
      />
      {IconComponent && (
        <g
          transform={`translate(${-iconSize / 2}, ${-iconSize / 2})`}
          pointerEvents="none"
        >
          <IconComponent width={iconSize} height={iconSize} />
        </g>
      )}
    </g>
  );
}
