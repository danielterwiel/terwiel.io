import type { SimulationNode } from "~/types/simulation";
import { MASS_DAMPEN_BASE } from "~/constants/stack-cloud-physics";
import { calculateMassFactor } from "./adaptive-physics";

/**
 * Custom D3 force that applies velocity dampening proportional to node mass
 * Simulates inertial dampening where smaller nodes lose velocity faster
 * This prevents small nodes from jittering due to overshooting
 *
 * Physics rationale:
 * - D3 applies forces equally to all nodes (unit mass assumption)
 * - Small nodes should have less inertia and dampen faster
 * - Large nodes should have more inertia and dampen slower
 * - Dampening ∝ 1 / radius² (inverse of mass)
 *
 * @param avgRadius - Average radius of all stack nodes (for normalization)
 * @param baseDampening - Base dampening factor (0-1, where 1 = instant stop)
 */
export function makeMassDampenForce(
  avgRadius: number,
  baseDampening = MASS_DAMPEN_BASE,
) {
  function force(alpha: number) {
    return (nodes: SimulationNode[]) => {
      for (const node of nodes) {
        if (node.type === "root" || !node.vx || !node.vy) continue;

        const massFactor = calculateMassFactor(node.radius, avgRadius);

        // Inertial dampening: smaller nodes dampen faster
        // Formula: dampening = baseDampening × alpha × (1 / massFactor)
        // This means:
        // - Small nodes (massFactor < 1): MORE dampening
        // - Large nodes (massFactor > 1): LESS dampening
        // - Scales with alpha (more dampening when simulation is hot)
        const dampeningFactor =
          1 - Math.min(0.5, baseDampening * alpha * (1 / massFactor));

        // Apply dampening to velocity
        node.vx *= dampeningFactor;
        node.vy *= dampeningFactor;
      }
    };
  }

  return force;
}
