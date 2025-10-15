import * as d3 from "d3";

import type { SimulationNode } from "~/types/simulation";
import type { AdaptivePhysicsParams } from "./adaptive-physics";
import {
  BOUNDARY_PADDING,
  COLLISION_ITERATIONS,
  COLLISION_STRENGTH,
  MASS_DAMPEN_BASE,
} from "~/constants/stack-cloud-physics";
import { calculateMassFactor } from "./adaptive-physics";
import { makeBoundaryForce } from "./boundary-force";
import { makeMassDampenForce } from "./mass-dampen-force";
import { makeRootExclusionForce } from "./root-exclusion-force";

/**
 * Creates all D3 forces for the stack cloud simulation
 * Centralizes force creation to eliminate duplication
 */
export function createSimulationForces(params: {
  centerX: number;
  centerY: number;
  width: number;
  height: number;
  rootRadius: number;
  physics: AdaptivePhysicsParams;
  avgRadius: number;
}) {
  const { centerX, centerY, width, height, rootRadius, physics, avgRadius } =
    params;

  // Collision force with adaptive padding
  const collide = d3
    .forceCollide<SimulationNode>()
    .radius((d) => d.radius * (d.scaleFactor ?? 1) + physics.collisionPadding)
    .strength(COLLISION_STRENGTH)
    .iterations(COLLISION_ITERATIONS);

  // Charge force scaled by node mass (radius²)
  const charge = d3
    .forceManyBody<SimulationNode>()
    .strength((d) => {
      if (d.type === "root") return 0;
      const massFactor = calculateMassFactor(d.radius, avgRadius);
      return physics.chargeStrength * massFactor;
    })
    .theta(physics.manyBodyTheta)
    .distanceMin(physics.manyBodyDistanceMin);

  // Boundary force to keep nodes in viewport
  const boundary = makeBoundaryForce(width, height, BOUNDARY_PADDING);

  // Root exclusion force to push nodes away from center
  const rootExclusion = makeRootExclusionForce(centerX, centerY, rootRadius);

  // Mass-based velocity dampening
  const massDampen = makeMassDampenForce(avgRadius, MASS_DAMPEN_BASE);

  // Positioning forces scaled by mass
  const forceX = d3.forceX<SimulationNode>(centerX).strength((d) => {
    if (d.type === "root") return 0;
    const massFactor = calculateMassFactor(d.radius, avgRadius);
    return physics.positioningStrength * massFactor;
  });

  const forceY = d3.forceY<SimulationNode>(centerY).strength((d) => {
    if (d.type === "root") return 0;
    const massFactor = calculateMassFactor(d.radius, avgRadius);
    return physics.positioningStrength * massFactor;
  });

  return {
    collide,
    charge,
    boundary,
    rootExclusion,
    massDampen,
    forceX,
    forceY,
  };
}

/**
 * Updates existing forces when simulation parameters change
 */
export function updateSimulationForces(
  simulation: d3.Simulation<SimulationNode, undefined>,
  params: {
    centerX: number;
    centerY: number;
    width: number;
    height: number;
    rootRadius: number;
    physics: AdaptivePhysicsParams;
    avgRadius: number;
  },
  forceRefs: {
    boundary: ReturnType<typeof makeBoundaryForce> | null;
    rootExclusion: ReturnType<typeof makeRootExclusionForce> | null;
  },
) {
  const { centerX, centerY, width, height, rootRadius, physics, avgRadius } =
    params;

  // Update velocity and alpha decay
  simulation.velocityDecay(physics.velocityDecay);
  simulation.alphaDecay(physics.alphaDecay);

  // Update positioning forces
  simulation.force(
    "x",
    d3.forceX<SimulationNode>(centerX).strength((d) => {
      if (d.type === "root") return 0;
      const massFactor = calculateMassFactor(d.radius, avgRadius);
      return physics.positioningStrength * massFactor;
    }),
  );

  simulation.force(
    "y",
    d3.forceY<SimulationNode>(centerY).strength((d) => {
      if (d.type === "root") return 0;
      const massFactor = calculateMassFactor(d.radius, avgRadius);
      return physics.positioningStrength * massFactor;
    }),
  );

  // Update charge force
  simulation.force(
    "charge",
    d3
      .forceManyBody<SimulationNode>()
      .strength((d) => {
        if (d.type === "root") return 0;
        const massFactor = calculateMassFactor(d.radius, avgRadius);
        return physics.chargeStrength * massFactor;
      })
      .theta(physics.manyBodyTheta)
      .distanceMin(physics.manyBodyDistanceMin),
  );

  // Update mass dampening
  simulation.force(
    "massDampen",
    makeMassDampenForce(avgRadius, MASS_DAMPEN_BASE),
  );

  // Update collision force
  const collide = simulation.force(
    "collide",
  ) as d3.ForceCollide<SimulationNode>;
  if (collide?.radius) {
    collide
      .radius(
        (d: SimulationNode) =>
          d.radius * (d.scaleFactor ?? 1) + physics.collisionPadding,
      )
      .strength(COLLISION_STRENGTH)
      .iterations(COLLISION_ITERATIONS);
  } else {
    const newCollide = d3
      .forceCollide<SimulationNode>()
      .radius((d) => d.radius * (d.scaleFactor ?? 1) + physics.collisionPadding)
      .strength(COLLISION_STRENGTH)
      .iterations(COLLISION_ITERATIONS);
    simulation.force("collide", newCollide);
  }

  // Update boundary force
  if (forceRefs.boundary) {
    forceRefs.boundary.update(width, height);
  } else {
    const newBoundary = makeBoundaryForce(width, height, BOUNDARY_PADDING);
    forceRefs.boundary = newBoundary;
    simulation.force("boundary", newBoundary);
  }

  // Update root exclusion force
  if (forceRefs.rootExclusion) {
    forceRefs.rootExclusion.update(centerX, centerY, rootRadius);
  } else {
    const newRootExclusion = makeRootExclusionForce(
      centerX,
      centerY,
      rootRadius,
    );
    forceRefs.rootExclusion = newRootExclusion;
    simulation.force("rootExclusion", newRootExclusion);
  }

  return forceRefs;
}
