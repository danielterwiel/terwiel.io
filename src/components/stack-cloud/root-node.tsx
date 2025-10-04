import type { Dimensions } from "~/types/simulation";

interface RootNodeProps {
  dimensions: Dimensions;
  nodeRef: (el: SVGGElement | null) => void;
}

/**
 * Root node component for the stack visualization
 * Displays the centered "root" node
 */
export function RootNode({ dimensions, nodeRef }: RootNodeProps) {
  return (
    <g
      ref={nodeRef}
      className="node root-node"
      aria-label="Root node"
      transform={`translate(${dimensions.centerX}, ${dimensions.centerY})`}
    >
      <circle
        r={dimensions.rootRadius}
        fill="white"
        stroke="#002FA7"
        strokeWidth={3}
      />
      <text
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={dimensions.rootRadius * 0.3}
        fill="#002FA7"
        fontWeight="600"
      >
        root
      </text>
    </g>
  );
}
