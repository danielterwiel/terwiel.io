import * as d3 from "d3";

import type { Domain } from "~/data/projects";
import type { IconNode } from "~/types/icon-node";
import { getDomainGlow, getDomainGlowHover } from "~/utils/domain-colors";

/**
 * Updates node glows based on hovered domain
 * Applies enhanced glow with transition for matching domains
 */
export function updateNodeGlows(
  svgRef: SVGSVGElement | null,
  hoveredDomain: Domain | null,
): void {
  if (!svgRef) return;

  const svg = d3.select(svgRef);
  const nodeGroups = svg.selectAll<SVGGElement, IconNode>("g.node");

  nodeGroups.each(function (d) {
    const foreignObject = d3.select(this).select("foreignObject");
    const magneticContainer = foreignObject
      .select("div.node-magnetic")
      .node() as HTMLElement;

    if (magneticContainer && d.domain) {
      const isMatchingDomain = hoveredDomain === d.domain;
      const glowColor = isMatchingDomain
        ? getDomainGlowHover(d.domain)
        : getDomainGlow(d.domain);

      // Apply enhanced glow with transition
      if (isMatchingDomain) {
        magneticContainer.style.boxShadow = `0 0 30px ${glowColor}, 0 0 60px ${glowColor}, 0 0 90px ${glowColor}`;
      } else {
        magneticContainer.style.boxShadow = `0 0 20px ${glowColor}, 0 0 40px ${glowColor}`;
      }
      magneticContainer.style.transition = "box-shadow 0.3s ease-out";
    }
  });
}
