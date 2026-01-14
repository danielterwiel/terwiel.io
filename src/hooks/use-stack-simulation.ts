import { type ForceCollide, forceSimulation, type Simulation } from "d3-force";

import { useCallback, useEffect, useRef, useState } from "react";

import type { Dimensions, Domain, SimulationNode } from "~/types";

import type { makeBoundaryForce } from "~/utils/stack-cloud/boundary-force";
import type { makeRootExclusionForce } from "~/utils/stack-cloud/root-exclusion-force";
import {
  BASE_CHARGE_STRENGTH,
  BOUNDARY_PADDING,
  INITIAL_ALPHA_TARGET,
  INITIAL_ANIMATION_DURATION,
  MANY_BODY_THETA,
  ROOT_EXCLUSION_FACTOR,
} from "~/constants/stack-cloud-physics";
import { PROJECTS } from "~/data/projects";
import { calculateDomainExperiences } from "~/utils/calculate-domain-size";
import {
  calculateAdaptivePhysics,
  calculateAlphaTarget,
  calculateNodeStats,
  calculateSettlingTime,
  calculateViewportMetrics,
} from "~/utils/stack-cloud/adaptive-physics";
import { calculateDomainAngles } from "~/utils/stack-cloud/calculate-domain-angles";
import { arcAngleToMathAngle } from "~/utils/stack-cloud/convert-arc-angle";
import {
  createSimulationForces,
  updateSimulationForces,
} from "~/utils/stack-cloud/create-forces";
import { calculateNodeAngleInSegment } from "~/utils/stack-cloud/distribute-nodes-in-segment";
import {
  calculateOptimalAlphaTarget,
  calculateOptimalSettlingTime,
  clearPositionCache,
  clearRadiusCache,
  forceNodeUpdate,
  hasNodeMovedSignificantly,
  isLargeSelectionChange,
  TICKS_PER_FRAME,
} from "~/utils/stack-cloud/performance-utils";
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
  const simulationRef = useRef<Simulation<SimulationNode, undefined> | null>(
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

  // Track simulation state for optimizations
  const isSettlingRef = useRef(false);

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

      const sim = simulationRef.current;
      const currentAlpha = sim.alpha();

      // Run multiple physics ticks per frame during settling phase
      if (currentAlpha > 0.05 && isSettlingRef.current) {
        for (let i = 1; i < TICKS_PER_FRAME; i++) {
          sim.tick();
        }
      }

      // Only update nodes that have moved significantly
      for (const node of sim.nodes()) {
        // Skip nodes that haven't moved significantly
        if (!hasNodeMovedSignificantly(node)) continue;

        const el = nodesRef.current.get(node.id);
        if (el && node.x !== undefined && node.y !== undefined) {
          const scale = node.scaleFactor ?? 1.0;
          const transform =
            scale !== 1.0
              ? `translate3d(${node.x}px, ${node.y}px, 0) scale(${scale})`
              : `translate3d(${node.x}px, ${node.y}px, 0)`;

          (el as SVGGElement).style.transform = transform;
          (el as SVGGElement).style.transformOrigin = "0 0";
        }
      }
    });
  }, []);

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

      // Calculate viewport metrics and node statistics
      const viewport = calculateViewportMetrics(width, height);
      const nodeStats = calculateNodeStats(stackNodes, viewport.viewportArea);

      // Calculate adaptive physics parameters
      const physics = calculateAdaptivePhysics(
        viewport,
        nodeStats,
        BASE_CHARGE_STRENGTH,
        MANY_BODY_THETA,
      );

      // Create all simulation forces
      const forces = createSimulationForces({
        centerX,
        centerY,
        width,
        height,
        rootRadius,
        physics,
        avgRadius: nodeStats.avgRadius,
      });

      boundaryForceRef.current = forces.boundary;
      rootExclusionForceRef.current = forces.rootExclusion;

      const simulation = forceSimulation<SimulationNode>(allNodes)
        .force("x", forces.forceX)
        .force("y", forces.forceY)
        .force("collide", forces.collide)
        .force("charge", forces.charge)
        .force("massDampen", forces.massDampen)
        .force("boundary", forces.boundary)
        .force("rootExclusion", forces.rootExclusion)
        .alphaDecay(prefersReducedMotion ? 0.9 : physics.alphaDecay)
        .velocityDecay(physics.velocityDecay)
        .on("tick", handleTick);

      simulationRef.current = simulation;

      // Clear performance caches for fresh start
      clearPositionCache();
      clearRadiusCache();

      // Paint initial positions once
      handleTick();
    },
    [stacks, sizeFactors, scaleFactors, handleTick],
  );

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
      const stackNodeList = nodes.slice(1); // Exclude root node
      for (const node of stackNodeList) {
        const sizeFactor = sizeFactors.get(node.name) ?? 1.0;
        node.radius = stackRadius * sizeFactor;
      }

      // Calculate viewport metrics and node statistics
      const viewport = calculateViewportMetrics(width, height);
      const nodeStats = calculateNodeStats(
        stackNodeList,
        viewport.viewportArea,
      );

      // Calculate adaptive physics parameters
      const physics = calculateAdaptivePhysics(
        viewport,
        nodeStats,
        BASE_CHARGE_STRENGTH,
        MANY_BODY_THETA,
      );

      // Update all forces with new parameters
      updateSimulationForces(
        sim,
        {
          centerX,
          centerY,
          width,
          height,
          rootRadius,
          physics,
          avgRadius: nodeStats.avgRadius,
        },
        {
          boundary: boundaryForceRef.current,
          rootExclusion: rootExclusionForceRef.current,
        },
      );

      // Gentle reheat with viewport-adaptive alphaTarget
      if (prefersReducedMotion) {
        sim.stop();
        sim.tick(40);
        handleTick();
      } else {
        const reheatAlphaTarget = calculateAlphaTarget(viewport.vmin);
        isSettlingRef.current = true;
        sim.alphaTarget(reheatAlphaTarget).restart();

        const settlingTime = calculateSettlingTime(
          sim.alpha(),
          physics.alphaDecay,
        );

        setTimeout(() => {
          if (sim) {
            sim.alphaTarget(0);
            isSettlingRef.current = false;
          }
        }, settlingTime);
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
          sim.alphaTarget(INITIAL_ALPHA_TARGET).restart();
          setTimeout(() => sim.alphaTarget(0), INITIAL_ANIMATION_DURATION);
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

  const updateNodeScaleFactors = useCallback(
    (scaleFactorMap: Map<string, number>) => {
      const sim = simulationRef.current;
      if (!sim) return;

      const nodes = sim.nodes();
      let hasChanges = false;
      const changedNodeIds: string[] = [];

      // Update scale factors and track which nodes changed
      for (const node of nodes) {
        if (node.type === "stack") {
          const newScaleFactor = scaleFactorMap.get(node.id) ?? 1.0;
          const oldScaleFactor = node.scaleFactor ?? 1.0;

          if (oldScaleFactor !== newScaleFactor) {
            node.scaleFactor = newScaleFactor;
            hasChanges = true;
            changedNodeIds.push(node.id);

            // Force position cache update for changed nodes
            forceNodeUpdate(node.id);
          }
        }
      }

      if (!hasChanges) return;

      // Clear radius cache since effective radii changed
      clearRadiusCache();

      const collide = sim.force("collide") as ForceCollide<SimulationNode>;
      if (collide) {
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
        // Calculate viewport size and change magnitude for adaptive physics
        const stackNodeList = nodes.filter((n) => n.type === "stack");
        // Use actual changed count, not the helper function which has a bug
        const changeMagnitude = changedNodeIds.length / stackNodeList.length;
        const nodeCount = stackNodeList.length;

        const isLargeChange = isLargeSelectionChange(
          changeMagnitude,
          nodeCount,
        );

        const alphaTarget = calculateOptimalAlphaTarget(
          changeMagnitude,
          isLargeChange,
        );

        const settlingTime = calculateOptimalSettlingTime(
          changeMagnitude,
          isLargeChange,
        );

        // Mark that we're in settling phase for multiple ticks optimization
        isSettlingRef.current = true;

        sim.alphaTarget(alphaTarget).restart();

        setTimeout(() => {
          if (sim) {
            sim.alphaTarget(0);
            isSettlingRef.current = false;
          }
        }, settlingTime);
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
