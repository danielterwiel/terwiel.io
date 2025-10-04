import type { Force } from "d3";

import type { SimulationNode } from "~/types/simulation";

/**
 * Extended boundary force with update method
 */
interface BoundaryForce extends Force<SimulationNode, undefined> {
  update: (width: number, height: number) => void;
}

/**
 * Creates a D3 custom force that constrains nodes within boundaries
 * Prevents nodes from moving outside the container with padding
 */
export function makeBoundaryForce(
  width: number,
  height: number,
  padding = 10,
): BoundaryForce {
  let nodes: SimulationNode[] = [];
  let currentWidth = width;
  let currentHeight = height;

  function force() {
    for (const node of nodes) {
      if (node.fx !== undefined && node.fx !== null) continue; // skip fixed nodes
      const r = node.radius;

      if (node.x !== undefined) {
        if (node.x - r < padding) {
          node.x = padding + r;
          node.vx = (node.vx ?? 0) * 0.5;
        }
        if (node.x + r > currentWidth - padding) {
          node.x = currentWidth - padding - r;
          node.vx = (node.vx ?? 0) * 0.5;
        }
      }

      if (node.y !== undefined) {
        if (node.y - r < padding) {
          node.y = padding + r;
          node.vy = (node.vy ?? 0) * 0.5;
        }
        if (node.y + r > currentHeight - padding) {
          node.y = currentHeight - padding - r;
          node.vy = (node.vy ?? 0) * 0.5;
        }
      }
    }
  }

  force.initialize = (_nodes: SimulationNode[]) => {
    nodes = _nodes;
  };

  force.update = (w: number, h: number) => {
    currentWidth = w;
    currentHeight = h;
  };

  return force as BoundaryForce;
}
