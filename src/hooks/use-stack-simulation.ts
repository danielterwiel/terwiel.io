import * as d3 from "d3";

import { useCallback, useEffect, useRef, useState } from "react";

import type { Dimensions, Domain, SimulationNode } from "~/types";

import {
  BOUNDARY_PADDING,
  CHARGE_STRENGTH,
  COLLISION_ITERATIONS,
  COLLISION_PADDING,
  COLLISION_STRENGTH,
  POSITIONING_FORCE_STRENGTH,
  ROOT_EXCLUSION_FACTOR,
} from "~/constants/stack-cloud-physics";
import { PROJECTS } from "~/data/projects";
import { calculateDomainExperiences } from "~/utils/calculate-domain-size";
import { makeBoundaryForce } from "~/utils/stack-cloud/boundary-force";
import { calculateDomainAngles } from "~/utils/stack-cloud/calculate-domain-angles";
import { arcAngleToMathAngle } from "~/utils/stack-cloud/convert-arc-angle";
import { calculateNodeAngleInSegment } from "~/utils/stack-cloud/distribute-nodes-in-segment";
import { makeRootExclusionForce } from "~/utils/stack-cloud/root-exclusion-force";
import { seedPosition } from "~/utils/stack-cloud/seed-position";

interface UseStackSimulationProps {
  dimensions: Dimensions | null;
  stacks: Array<{
    id: string;
    name: string;
    iconKey: string;
    color: string;
    domain: Domain;
  }>;
  sizeFactors: Map<string, number>;
  scaleFactors: Map<string, number>; // Selection-based scaling (1.0 or STACK_SELECTION_SCALE)
}

/**
 * Hook to manage D3 force simulation for the stack cloud
 * Handles simulation initialization, updates, and cleanup
 */
export function useStackSimulation({
  dimensions,
  stacks,
  sizeFactors,
  scaleFactors,
}: UseStackSimulationProps) {
  const simulationRef = useRef<d3.Simulation<SimulationNode, undefined> | null>(
    null,
  );
  const nodesRef = useRef<Map<string, SVGGElement>>(new Map());
  const boundaryForceRef = useRef<ReturnType<typeof makeBoundaryForce> | null>(
    null,
  );
  const rootExclusionForceRef = useRef<ReturnType<
    typeof makeRootExclusionForce
  > | null>(null);
  const didInitialKickRef = useRef(false);

  const [isVisible, setIsVisible] = useState(false);

  // RAF throttle flag to prevent excessive transform updates
  const rafIdRef = useRef<number | null>(null);
  const lastTickTimeRef = useRef<number>(0);

  /**
   * Handle simulation tick - update DOM transforms
   * Throttled via requestAnimationFrame to prevent jitter
   */
  const handleTick = useCallback(() => {
    if (!simulationRef.current) return;

    // Cancel any pending RAF
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
    }

    rafIdRef.current = requestAnimationFrame(() => {
      rafIdRef.current = null;
      const now = performance.now();

      // Throttle to ~60fps (16ms minimum between updates)
      if (now - lastTickTimeRef.current < 16) return;
      lastTickTimeRef.current = now;

      if (!simulationRef.current) return;

      for (const node of simulationRef.current.nodes()) {
        const el = nodesRef.current.get(node.id);
        if (el && node.x !== undefined && node.y !== undefined) {
          // Apply both translate and scale in a single transform
          // Scale from node center: translate(x,y) then scale from that point
          const scale = node.scaleFactor ?? 1.0;
          if (scale !== 1.0) {
            el.setAttribute(
              "transform",
              `translate(${node.x}, ${node.y}) scale(${scale})`,
            );
          } else {
            el.setAttribute("transform", `translate(${node.x}, ${node.y})`);
          }
        }
      }
    });
  }, []);

  /**
   * Initialize D3 simulation with all nodes and forces
   */
  const initializeSimulation = useCallback(
    (measurements: Dimensions) => {
      const { centerX, centerY, rootRadius, stackRadius, width, height } =
        measurements;

      // Root node pinned at center
      const rootNode: SimulationNode = {
        id: "root",
        type: "root",
        name: "root",
        radius: rootRadius,
        x: centerX,
        y: centerY,
        fx: centerX,
        fy: centerY,
      };

      // Calculate domain angles for positioning nodes at their domain segment midpoints
      const domainExperiences = calculateDomainExperiences(PROJECTS);
      const domainAngles = calculateDomainAngles(domainExperiences);

      // Group stacks by domain for angular distribution
      const stacksByDomain = new Map<Domain, typeof stacks>();
      for (const stack of stacks) {
        const domainStacks = stacksByDomain.get(stack.domain) ?? [];
        domainStacks.push(stack);
        stacksByDomain.set(stack.domain, domainStacks);
      }

      // Experience-based stack nodes with positions spread across domain segments
      const rootExclusionRadius = rootRadius * ROOT_EXCLUSION_FACTOR;
      const stackNodes: SimulationNode[] = [];

      for (const [domain, domainStacks] of stacksByDomain) {
        const angleRange = domainAngles.get(domain);
        if (!angleRange) continue;

        domainStacks.forEach((stack, index) => {
          const sizeFactor = sizeFactors.get(stack.name) ?? 1.0;
          const scaleFactor = scaleFactors.get(stack.id) ?? 1.0;
          const baseRadius = stackRadius * sizeFactor;
          const effectiveRadius = baseRadius * scaleFactor;

          // Calculate angle for this stack within its domain segment
          const arcAngle = calculateNodeAngleInSegment(
            angleRange,
            index,
            domainStacks.length,
          );

          // Convert from d3.arc() angle to Math angle for positioning
          const mathAngle = arcAngleToMathAngle(arcAngle);

          const { x, y } = seedPosition(
            centerX,
            centerY,
            width,
            height,
            effectiveRadius,
            rootExclusionRadius,
            BOUNDARY_PADDING,
            mathAngle,
          );

          stackNodes.push({
            id: stack.id,
            type: "stack",
            name: stack.name,
            radius: baseRadius,
            iconKey: stack.iconKey,
            color: stack.color,
            x,
            y,
            scaleFactor,
          });
        });
      }

      const allNodes = [rootNode, ...stackNodes];

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      // Adaptive parameters based on viewport size
      // Larger viewports need higher velocity decay to dampen jitter
      const vmin = Math.min(width, height);
      const isLargeViewport = vmin >= 600;
      const velocityDecayValue = isLargeViewport ? 0.6 : 0.4; // Higher friction on large screens
      const alphaDecayValue = isLargeViewport ? 0.04 : 0.03; // Faster cooling on large screens
      const chargeStrengthValue = isLargeViewport ? -8 : CHARGE_STRENGTH; // Weaker repulsion on large screens

      // Forces
      // Collision radius includes scaleFactor for physics-based repositioning
      // When node scales up, it pushes neighbors away smoothly
      const collide = d3
        .forceCollide<SimulationNode>()
        .radius((d) => d.radius * (d.scaleFactor ?? 1) + COLLISION_PADDING)
        .strength(COLLISION_STRENGTH)
        .iterations(COLLISION_ITERATIONS);

      const charge = d3
        .forceManyBody<SimulationNode>()
        .strength(chargeStrengthValue);

      const boundary = makeBoundaryForce(width, height, BOUNDARY_PADDING);
      const rootExclusion = makeRootExclusionForce(
        centerX,
        centerY,
        rootRadius,
      );

      boundaryForceRef.current = boundary;
      rootExclusionForceRef.current = rootExclusion;

      const simulation = d3
        .forceSimulation<SimulationNode>(allNodes)
        .force("x", d3.forceX(centerX).strength(POSITIONING_FORCE_STRENGTH))
        .force("y", d3.forceY(centerY).strength(POSITIONING_FORCE_STRENGTH))
        .force("collide", collide)
        .force("charge", charge)
        .force("boundary", boundary)
        .force("rootExclusion", rootExclusion)
        .alphaDecay(prefersReducedMotion ? 0.9 : alphaDecayValue)
        .velocityDecay(velocityDecayValue)
        .on("tick", handleTick);

      simulationRef.current = simulation;

      // Paint initial positions once
      handleTick();
    },
    [stacks, sizeFactors, scaleFactors, handleTick],
  );

  /**
   * Update simulation when dimensions change
   */
  const updateSimulation = useCallback(
    (measurements: Dimensions) => {
      const sim = simulationRef.current;
      if (!sim) return;

      const { centerX, centerY, rootRadius, stackRadius, width, height } =
        measurements;
      const nodes = sim.nodes();

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      // Update root node
      const rootNode = nodes[0];
      if (rootNode) {
        rootNode.fx = centerX;
        rootNode.fy = centerY;
        rootNode.radius = rootRadius;
      }

      // Update stack node radii
      for (const node of nodes.slice(1)) {
        const sizeFactor = sizeFactors.get(node.name) ?? 1.0;
        node.radius = stackRadius * sizeFactor;
      }

      // Update simulation parameters based on new viewport size
      const vmin = Math.min(width, height);
      const isLargeViewport = vmin >= 600;
      const velocityDecayValue = isLargeViewport ? 0.6 : 0.4;
      const alphaDecayValue = isLargeViewport ? 0.04 : 0.03;
      const chargeStrengthValue = isLargeViewport ? -8 : CHARGE_STRENGTH;

      sim.velocityDecay(velocityDecayValue);
      sim.alphaDecay(alphaDecayValue);

      // Update position forces
      sim.force("x", d3.forceX(centerX).strength(POSITIONING_FORCE_STRENGTH));
      sim.force("y", d3.forceY(centerY).strength(POSITIONING_FORCE_STRENGTH));

      // Update charge force
      sim.force(
        "charge",
        d3.forceManyBody<SimulationNode>().strength(chargeStrengthValue),
      );

      // Update collide radii (includes scaleFactor for repositioning)
      const collide = sim.force("collide") as d3.ForceCollide<SimulationNode>;
      if (collide?.radius) {
        collide
          .radius(
            (d: SimulationNode) =>
              d.radius * (d.scaleFactor ?? 1) + COLLISION_PADDING,
          )
          .strength(COLLISION_STRENGTH)
          .iterations(COLLISION_ITERATIONS);
        // CRITICAL: Re-initialize collision force to re-evaluate radii after dimension changes
        // Use simulation's own random source for deterministic behavior
        collide.initialize(sim.nodes(), sim.randomSource());
      } else {
        const newCollide = d3
          .forceCollide<SimulationNode>()
          .radius((d) => d.radius * (d.scaleFactor ?? 1) + COLLISION_PADDING)
          .strength(COLLISION_STRENGTH)
          .iterations(COLLISION_ITERATIONS);
        sim.force("collide", newCollide);
        newCollide.initialize(sim.nodes(), sim.randomSource());
      }

      // Update custom forces
      if (boundaryForceRef.current) {
        boundaryForceRef.current.update(width, height);
      } else {
        const newBoundary = makeBoundaryForce(width, height, BOUNDARY_PADDING);
        boundaryForceRef.current = newBoundary;
        sim.force("boundary", newBoundary);
      }

      if (rootExclusionForceRef.current) {
        rootExclusionForceRef.current.update(centerX, centerY, rootRadius);
      } else {
        const newRootExclusion = makeRootExclusionForce(
          centerX,
          centerY,
          rootRadius,
        );
        rootExclusionForceRef.current = newRootExclusion;
        sim.force("rootExclusion", newRootExclusion);
      }

      // Gentle reheat
      if (prefersReducedMotion) {
        sim.stop();
        sim.tick(40);
        handleTick();
      } else {
        sim.alphaTarget(0.1).restart();
        setTimeout(() => {
          if (sim) sim.alphaTarget(0);
        }, 300);
      }
    },
    [sizeFactors, handleTick],
  );

  // Initialize simulation once when dimensions are first available
  useEffect(() => {
    if (!dimensions || simulationRef.current) return;
    initializeSimulation(dimensions);

    return () => {
      simulationRef.current?.stop();
    };
  }, [dimensions, initializeSimulation]);

  // Trigger initial animation kick after mount
  useEffect(() => {
    if (!dimensions || !simulationRef.current || didInitialKickRef.current)
      return;

    didInitialKickRef.current = true;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let raf1 = 0;
    let raf2 = 0;

    const kick = () => {
      if (simulationRef.current) {
        updateSimulation(dimensions);
      }

      // Synthesize browser events
      try {
        window.dispatchEvent(new Event("resize"));
      } catch {
        // Intentionally ignore errors - event dispatching is not critical
      }
      try {
        window.visualViewport?.dispatchEvent?.(new Event("resize"));
      } catch {
        // Intentionally ignore errors - event dispatching is not critical
      }

      if (!prefersReducedMotion) {
        const sim = simulationRef.current;
        if (sim) {
          sim.alphaTarget(0.2).restart();
          setTimeout(() => sim.alphaTarget(0), 200);
        }
      }

      // Fade in after initial settlement
      setTimeout(() => setIsVisible(true), prefersReducedMotion ? 0 : 400);
    };

    // Double RAF ensures DOM paint + iOS viewport settles before kick
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(kick);
    });

    return () => {
      if (raf1) cancelAnimationFrame(raf1);
      if (raf2) cancelAnimationFrame(raf2);
    };
  }, [dimensions, updateSimulation]);

  /**
   * Update scale factors for nodes (e.g., when selection changes)
   */
  const updateNodeScaleFactors = useCallback(
    (scaleFactorMap: Map<string, number>) => {
      const sim = simulationRef.current;
      if (!sim) return;

      const nodes = sim.nodes();
      let hasChanges = false;

      for (const node of nodes) {
        if (node.type === "stack") {
          const newScaleFactor = scaleFactorMap.get(node.id) ?? 1.0;
          const oldScaleFactor = node.scaleFactor ?? 1.0;

          if (oldScaleFactor !== newScaleFactor) {
            node.scaleFactor = newScaleFactor;
            hasChanges = true;
          }
        }
      }

      if (!hasChanges) return;

      // Update collision force with new scale factors
      const collide = sim.force("collide") as d3.ForceCollide<SimulationNode>;
      if (collide?.radius) {
        collide
          .radius(
            (d: SimulationNode) =>
              d.radius * (d.scaleFactor ?? 1) + COLLISION_PADDING,
          )
          .strength(COLLISION_STRENGTH)
          .iterations(COLLISION_ITERATIONS); // Keep full iterations for stability
        // CRITICAL: Re-initialize collision force to re-evaluate radii after scaleFactor changes
        // Use simulation's own random source for deterministic behavior
        collide.initialize(sim.nodes(), sim.randomSource());
      }

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (prefersReducedMotion) {
        // For reduced motion, update instantly without animation
        sim.stop();
        sim.tick(30);
        handleTick();
      } else {
        const currentAlpha = sim.alpha();

        // Very gentle warmup - use very low alpha to minimize jitter
        if (currentAlpha < 0.005) {
          sim.alpha(0.005); // Ultra-low alpha for minimal disruption
        }

        // Ultra-low alphaTarget for extremely smooth repositioning
        // This allows the simulation to gently redistribute nodes without violent corrections
        sim.alphaTarget(0.002).restart(); // Reduced from 0.005 to minimize jitter

        setTimeout(() => {
          if (sim) {
            sim.alphaTarget(0);
          }
        }, 800); // Extended from 500ms for more gradual settling
      }
    },
    [handleTick],
  );

  return {
    simulationRef,
    nodesRef,
    isVisible,
    updateSimulation,
    updateNodeScaleFactors,
  };
}
