"use client";

import * as d3 from "d3";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Icon } from "~/components/icon";
import { PROJECTS } from "~/data/projects";
import { extractUniqueStacks } from "~/utils/extractStacks";

type SimulationNode = {
  id: string;
  type: "root" | "stack";
  name: string;
  radius: number;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
  iconKey?: string;
  color?: string;
};

type Dimensions = {
  width: number;
  height: number;
  centerX: number;
  centerY: number;
  rootRadius: number;
  stackRadius: number;
};

/**
 * Debounce utility function
 */
function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * StackCloud Component
 * A responsive D3 force-directed visualization of technology stacks
 * Optimized for iOS Safari with dynamic viewport handling
 */
export function StackCloud() {
  // Refs
  const wrapperRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const simulationRef = useRef<d3.Simulation<SimulationNode, undefined> | null>(
    null,
  );
  const nodesRef = useRef<Map<string, SVGGElement>>(new Map());

  // State
  const [dimensions, setDimensions] = useState<Dimensions | null>(null);

  // Extract stacks once
  const stacks = useMemo(() => extractUniqueStacks(PROJECTS), []);

  /**
   * Measure container and compute layout dimensions
   */
  const measureContainer = useCallback((): Dimensions | null => {
    if (!wrapperRef.current) return null;

    const rect = wrapperRef.current.getBoundingClientRect();
    const vmin = Math.min(rect.width, rect.height);

    return {
      width: rect.width,
      height: rect.height,
      centerX: rect.width / 2,
      centerY: rect.height / 2,
      rootRadius: (vmin * 0.4) / 2,
      stackRadius: vmin < 400 ? 22 : vmin < 600 ? 26 : 30,
    };
  }, []);

  /**
   * Custom boundary force - keeps nodes within container bounds
   */
  const createBoundaryForce = useCallback((width: number, height: number) => {
    const padding = 10;
    return () => {
      const nodes = simulationRef.current?.nodes() ?? [];
      for (const node of nodes) {
        if (node.fx !== undefined) continue; // Skip fixed nodes

        const r = node.radius;
        if (node.x !== undefined) {
          if (node.x - r < padding) {
            node.x = padding + r;
            node.vx = (node.vx ?? 0) * 0.5;
          }
          if (node.x + r > width - padding) {
            node.x = width - padding - r;
            node.vx = (node.vx ?? 0) * 0.5;
          }
        }
        if (node.y !== undefined) {
          if (node.y - r < padding) {
            node.y = padding + r;
            node.vy = (node.vy ?? 0) * 0.5;
          }
          if (node.y + r > height - padding) {
            node.y = height - padding - r;
            node.vy = (node.vy ?? 0) * 0.5;
          }
        }
      }
    };
  }, []);

  /**
   * Custom root exclusion force - pushes stack nodes away from root
   */
  const createRootExclusionForce = useCallback(
    (cx: number, cy: number, rootRadius: number) => {
      const exclusionRadius = rootRadius * 1.3;
      const strength = 0.1;

      return () => {
        const nodes = simulationRef.current?.nodes() ?? [];
        for (const node of nodes) {
          if (
            node.fx !== undefined ||
            node.x === undefined ||
            node.y === undefined
          )
            continue;

          const dx = node.x - cx;
          const dy = node.y - cy;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < exclusionRadius) {
            const angle = Math.atan2(dy, dx);
            const targetDistance = exclusionRadius + node.radius;
            const force = (targetDistance - distance) * strength;

            node.vx = (node.vx ?? 0) + Math.cos(angle) * force;
            node.vy = (node.vy ?? 0) + Math.sin(angle) * force;
          }
        }
      };
    },
    [],
  );

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
      if (!svgRef.current) return;

      const { centerX, centerY, rootRadius, stackRadius, width, height } =
        measurements;

      // Create root node
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

      // Create stack nodes with random initial positions
      const stackNodes: SimulationNode[] = stacks.map((stack) => ({
        id: stack.id,
        type: "stack",
        name: stack.name,
        radius: stackRadius,
        iconKey: stack.iconKey,
        color: stack.color,
        x: centerX + (Math.random() - 0.5) * width * 0.6,
        y: centerY + (Math.random() - 0.5) * height * 0.6,
      }));

      const allNodes = [rootNode, ...stackNodes];

      // Check for reduced motion preference
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      // Create simulation with forces
      const simulation = d3
        .forceSimulation<SimulationNode>(allNodes)
        .force("center", d3.forceCenter(centerX, centerY).strength(0.05))
        .force(
          "collide",
          d3
            .forceCollide<SimulationNode>()
            .radius((d) => d.radius + 4)
            .iterations(2),
        )
        .force("boundary", createBoundaryForce(width, height))
        .force(
          "rootExclusion",
          createRootExclusionForce(centerX, centerY, rootRadius),
        )
        .alphaDecay(prefersReducedMotion ? 0.9 : 0.02)
        .velocityDecay(0.4)
        .on("tick", handleTick);

      simulationRef.current = simulation;
    },
    [stacks, handleTick, createBoundaryForce, createRootExclusionForce],
  );

  /**
   * Update simulation when dimensions change
   */
  const updateSimulation = useCallback(
    (measurements: Dimensions) => {
      if (!simulationRef.current) return;

      const { centerX, centerY, rootRadius, stackRadius, width, height } =
        measurements;
      const nodes = simulationRef.current.nodes();

      const padding = 10;

      // Update root node
      const rootNode = nodes[0];
      if (rootNode) {
        rootNode.fx = centerX;
        rootNode.fy = centerY;
        rootNode.radius = rootRadius;
      }

      // Update stack nodes and immediately clamp positions to new bounds
      for (const node of nodes.slice(1)) {
        node.radius = stackRadius;

        // Immediately clamp node positions to new bounds
        if (node.x !== undefined && node.y !== undefined) {
          const r = node.radius;
          // Clamp x
          node.x = Math.max(padding + r, Math.min(width - padding - r, node.x));
          // Clamp y
          node.y = Math.max(
            padding + r,
            Math.min(height - padding - r, node.y),
          );
          // Reset velocities to avoid momentum carrying nodes out
          node.vx = 0;
          node.vy = 0;
        }
      }

      // Update forces
      simulationRef.current
        .force("center", d3.forceCenter(centerX, centerY).strength(0.05))
        .force(
          "collide",
          d3
            .forceCollide<SimulationNode>()
            .radius((d) => d.radius + 4)
            .iterations(2),
        )
        .force("boundary", createBoundaryForce(width, height))
        .force(
          "rootExclusion",
          createRootExclusionForce(centerX, centerY, rootRadius),
        );

      // Reheat simulation
      simulationRef.current.alpha(0.3).restart();
    },
    [createBoundaryForce, createRootExclusionForce],
  );

  /**
   * Initial measurement on mount
   */
  useEffect(() => {
    const measurements = measureContainer();
    if (measurements) setDimensions(measurements);
  }, [measureContainer]);

  /**
   * Initialize simulation once when dimensions are first available
   */
  useEffect(() => {
    if (!dimensions || simulationRef.current) return;
    initializeSimulation(dimensions);

    return () => {
      simulationRef.current?.stop();
    };
  }, [dimensions, initializeSimulation]);

  /**
   * ResizeObserver for container size changes
   */
  useEffect(() => {
    if (!wrapperRef.current) return;

    const debouncedResize = debounce(() => {
      const measurements = measureContainer();
      if (measurements && simulationRef.current) {
        setDimensions(measurements); // Update viewBox
        updateSimulation(measurements);
      }
    }, 100);

    const resizeObserver = new ResizeObserver(debouncedResize);
    resizeObserver.observe(wrapperRef.current);

    return () => resizeObserver.disconnect();
  }, [measureContainer, updateSimulation]);

  /**
   * VisualViewport listener for iOS Safari toolbar show/hide
   */
  useEffect(() => {
    if (!window.visualViewport) return;

    const handleVisualViewportChange = debounce(() => {
      const measurements = measureContainer();
      if (measurements && simulationRef.current) {
        setDimensions(measurements); // Update viewBox
        updateSimulation(measurements);
      }
    }, 50);

    window.visualViewport.addEventListener(
      "resize",
      handleVisualViewportChange,
    );
    window.visualViewport.addEventListener(
      "scroll",
      handleVisualViewportChange,
    );

    return () => {
      window.visualViewport?.removeEventListener(
        "resize",
        handleVisualViewportChange,
      );
      window.visualViewport?.removeEventListener(
        "scroll",
        handleVisualViewportChange,
      );
    };
  }, [measureContainer, updateSimulation]);

  return (
    <div ref={wrapperRef} className="stack-cloud-wrapper">
      {!dimensions ? null : (
        <svg
          ref={svgRef}
          className="stack-cloud-svg"
          viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
          role="img"
          aria-label="Technology stack visualization"
        >
          {/* Root node */}
          <g
            ref={(el) => {
              if (el) nodesRef.current.set("root", el);
              else nodesRef.current.delete("root");
            }}
            className="node root-node"
            aria-label="Root node"
          >
            <circle
              r={dimensions.rootRadius}
              fill="white"
              stroke="#002FA7"
              strokeWidth={3}
            />
            <text
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={dimensions.rootRadius * 0.3}
              fill="#002FA7"
              fontWeight="600"
            >
              root
            </text>
          </g>

          {/* Stack nodes */}
          {stacks.map((stack) => {
            const IconComponent = Icon[stack.iconKey as keyof typeof Icon];
            const iconSize = dimensions.stackRadius * 1.4; // 70% of diameter

            return (
              <g
                key={stack.id}
                ref={(el) => {
                  if (el) nodesRef.current.set(stack.id, el);
                  else nodesRef.current.delete(stack.id);
                }}
                className="node stack-node"
                aria-label={`${stack.name} technology`}
              >
                <circle
                  r={dimensions.stackRadius}
                  fill="white"
                  stroke={stack.color}
                  strokeWidth={2}
                />
                {IconComponent && (
                  <g
                    transform={`translate(${-iconSize / 2}, ${-iconSize / 2})`}
                    pointerEvents="none"
                  >
                    <IconComponent width={iconSize} height={iconSize} />
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      )}
    </div>
  );
}
