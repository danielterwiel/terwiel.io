import * as d3 from "d3";

import type { IconNode } from "~/types/icon-node";
import {
  getIconTargetColor,
  type NodeState,
  updateNodeDOMClasses,
} from "~/utils/node-styling";

/**
 * Updates node visual styling without full rerender
 * Applies DOM class changes and smooth color transitions
 */
export function updateNodeVisualStyling(
  svgRef: SVGSVGElement | null,
  targetNode: IconNode,
  isSelected: boolean,
): void {
  if (!svgRef) return;

  const svg = d3.select(svgRef);
  const nodeGroups = svg.selectAll<SVGGElement, IconNode>("g.node");

  nodeGroups.each(function (d) {
    const foreignObject = d3.select(this).select("foreignObject");
    const outerContainer = foreignObject.select("div").node() as HTMLElement;

    if (outerContainer) {
      const shouldBeSelected = d.id === targetNode.id && isSelected;
      const nodeState: NodeState = {
        isHovered: d.isHovered || false,
        isSelected: shouldBeSelected,
        isActive: false,
      };

      updateNodeDOMClasses(outerContainer, d, nodeState);

      // Update icon color with smooth transition
      const iconElement = outerContainer.querySelector("svg");
      if (iconElement) {
        const targetColor = getIconTargetColor(d, nodeState);
        d3.select(iconElement)
          .interrupt() // Cancel any ongoing transitions
          .transition()
          .duration(300)
          .ease(d3.easeCubicInOut)
          .style("color", targetColor);
      }
    }
  });
}
