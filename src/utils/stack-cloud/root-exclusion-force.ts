import type { Force } from "d3";

import type { SimulationNode } from "~/types/simulation";

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
  strength = 0.12,
  factor = 1.3,
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

      if (distance < exclusionRadius) {
        const angle = Math.atan2(dy, dx);
        const target = exclusionRadius + node.radius;
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
