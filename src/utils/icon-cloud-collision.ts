import * as d3 from "d3";

import type { IconNode } from "~/types/icon-node";

/**
 * Updates the collision force radius for nodes based on hover and selection state
 * Creates a gentle radius function that gradually expands around hovered/selected nodes
 */
export function updateCollisionForce(
  simulation: d3.Simulation<IconNode, undefined> | null,
  hoveredNode: IconNode | null,
  selectedNode: IconNode | null,
): void {
  if (!simulation) return;

  // Create a gentle radius function that gradually expands around hovered/selected nodes
  const radiusFunction = (node: IconNode) => {
    const baseRadius = node.r + 12;
    const minRadius = Math.max(baseRadius, 50);

    // If this is the hovered node, give it more space but less aggressive
    if (hoveredNode && node.id === hoveredNode.id) {
      return Math.max(baseRadius * 1.4, 75); // Much gentler expansion for hovered
    }

    // If this is the selected node (and not hovered), give it subtle space
    if (
      selectedNode &&
      node.id === selectedNode.id &&
      (!hoveredNode || node.id !== hoveredNode.id)
    ) {
      return Math.max(baseRadius * 1.2, 60); // Very subtle space for selected
    }

    // For other nodes, check distance to hovered/selected nodes
    const activeNode = hoveredNode || selectedNode;
    if (activeNode && activeNode.id !== node.id) {
      const dx = (node.x || 0) - (activeNode.x || 0);
      const dy = (node.y || 0) - (activeNode.y || 0);
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Very gradual influence with larger radius for smoother transitions
      const influenceRadius = hoveredNode ? 200 : 160; // Larger influence area
      const influenceFactor = Math.max(0, 1 - distance / influenceRadius);
      const expansionMultiplier = hoveredNode ? 1.08 : 1.05; // Much gentler expansion

      return Math.max(
        baseRadius * (1 + influenceFactor * (expansionMultiplier - 1)),
        minRadius,
      );
    }

    return minRadius;
  };

  // Update collision force with very gentle transition
  simulation
    .force(
      "collision",
      d3
        .forceCollide<IconNode>()
        .radius(radiusFunction)
        .strength(0.3) // Much gentler strength for calmer movement
        .iterations(1), // Fewer iterations for more natural, less rigid behavior
    )
    .alphaTarget(0.02) // Ultra-low energy for very calm, slow movement
    .restart();

  // Very gradually reduce alpha target for ultra-smooth settling
  setTimeout(() => {
    if (simulation) {
      simulation.alphaTarget(0.008);
    }
  }, 1200);

  setTimeout(() => {
    if (simulation) {
      simulation.alphaTarget(0.003);
    }
  }, 3000);

  setTimeout(() => {
    if (simulation) {
      simulation.alphaTarget(0);
    }
  }, 5000);
}
