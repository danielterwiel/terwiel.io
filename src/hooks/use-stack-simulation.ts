import * as d3 from "d3";

import { useCallback, useEffect, useRef, useState } from "react";

import type { Dimensions, SimulationNode } from "~/types/simulation";
import { makeBoundaryForce } from "~/utils/stack-cloud/boundary-force";
import { makeRootExclusionForce } from "~/utils/stack-cloud/root-exclusion-force";
import { seedPosition } from "~/utils/stack-cloud/seed-position";

interface UseStackSimulationProps {
  dimensions: Dimensions | null;
  stacks: Array<{ id: string; name: string; iconKey: string; color: string }>;
  sizeFactors: Map<string, number>;
}

/**
 * Hook to manage D3 force simulation for the stack cloud
 * Handles simulation initialization, updates, and cleanup
 */
export function useStackSimulation({
  dimensions,
  stacks,
  sizeFactors,
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

  /**
   * Handle simulation tick - update DOM transforms
   */
  const handleTick = useCallback(() => {
    if (!simulationRef.current) return;

    for (const node of simulationRef.current.nodes()) {
      const el = nodesRef.current.get(node.id);
      if (el && node.x !== undefined && node.y !== undefined) {
        el.setAttribute("transform", `translate(${node.x}, ${node.y})`);
      }
    }
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

      // Experience-based stack nodes with seeded positions
      const rootExcl = rootRadius * 1.3;
      const stackNodes: SimulationNode[] = stacks.map((stack) => {
        const sizeFactor = sizeFactors.get(stack.name) ?? 1.0;
        const r = stackRadius * sizeFactor;
        const { x, y } = seedPosition(
          centerX,
          centerY,
          width,
          height,
          r,
          rootExcl,
        );
        return {
          id: stack.id,
          type: "stack",
          name: stack.name,
          radius: r,
          iconKey: stack.iconKey,
          color: stack.color,
          x,
          y,
        };
      });

      const allNodes = [rootNode, ...stackNodes];

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      // Forces
      const collide = d3
        .forceCollide<SimulationNode>()
        .radius((d) => d.radius + 6)
        .strength(0.5)
        .iterations(2);

      const charge = d3.forceManyBody<SimulationNode>().strength(-12);

      const boundary = makeBoundaryForce(width, height, 10);
      const rootExclusion = makeRootExclusionForce(
        centerX,
        centerY,
        rootRadius,
      );

      boundaryForceRef.current = boundary;
      rootExclusionForceRef.current = rootExclusion;

      const simulation = d3
        .forceSimulation<SimulationNode>(allNodes)
        .force("center", d3.forceCenter(centerX, centerY).strength(0.05))
        .force("collide", collide)
        .force("charge", charge)
        .force("boundary", boundary)
        .force("rootExclusion", rootExclusion)
        .alphaDecay(prefersReducedMotion ? 0.9 : 0.03)
        .velocityDecay(0.4)
        .on("tick", handleTick);

      simulationRef.current = simulation;

      // Paint initial positions once
      handleTick();
    },
    [stacks, sizeFactors, handleTick],
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

      // Update center force
      sim.force("center", d3.forceCenter(centerX, centerY).strength(0.05));

      // Update collide radii
      const collide = sim.force("collide") as d3.ForceCollide<SimulationNode>;
      if (collide?.radius) {
        collide
          .radius((d: SimulationNode) => d.radius + 6)
          .strength(0.5)
          .iterations(2);
      } else {
        sim.force(
          "collide",
          d3
            .forceCollide<SimulationNode>()
            .radius((d) => d.radius + 6)
            .strength(0.5)
            .iterations(2),
        );
      }

      // Update custom forces
      if (boundaryForceRef.current) {
        boundaryForceRef.current.update(width, height);
      } else {
        const newBoundary = makeBoundaryForce(width, height, 10);
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

  return {
    simulationRef,
    nodesRef,
    isVisible,
    updateSimulation,
  };
}
