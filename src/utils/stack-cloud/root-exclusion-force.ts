import type { Force } from "d3-force";

import type { SimulationNode } from "~/types/simulation";
import {
  ROOT_EXCLUSION_FACTOR,
  ROOT_EXCLUSION_STRENGTH,
} from "~/constants/stack-cloud-physics";

/**
 * Extended root exclusion force with update method
 */
interface RootExclusionForce extends Force<SimulationNode, undefined> {
  update: (centerX: number, centerY: number, rootRadius: number) => void;
}

/**
 * Creates a D3 custom force that pushes stack nodes outward from the root node
 * Maintains an exclusion zone around the root node
 */
export function makeRootExclusionForce(
  centerX: number,
  centerY: number,
  rootRadius: number,
  strength = ROOT_EXCLUSION_STRENGTH,
  factor = ROOT_EXCLUSION_FACTOR,
): RootExclusionForce {
  let nodes: SimulationNode[] = [];
  let cx = centerX;
  let cy = centerY;
  let exclusionRadius = rootRadius * factor;

  function force() {
    for (const node of nodes) {
      if (
        (node.fx !== undefined && node.fx !== null) ||
        node.x === undefined ||
        node.y === undefined
      )
        continue;

      const dx = node.x - cx;
      const dy = node.y - cy;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Use effective radius accounting for scale factor
      const effectiveRadius = node.radius * (node.scaleFactor ?? 1);

      if (distance < exclusionRadius) {
        const angle = Math.atan2(dy, dx);
        const target = exclusionRadius + effectiveRadius;
        const f = (target - distance) * strength;
        node.vx = (node.vx ?? 0) + Math.cos(angle) * f;
        node.vy = (node.vy ?? 0) + Math.sin(angle) * f;
      }
    }
  }

  force.initialize = (_nodes: SimulationNode[]) => {
    nodes = _nodes;
  };

  force.update = (nx: number, ny: number, r: number) => {
    cx = nx;
    cy = ny;
    exclusionRadius = r * factor;
  };

  return force as RootExclusionForce;
}
