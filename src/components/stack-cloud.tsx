"use client";

import * as d3 from "d3";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Icon } from "~/components/icon";
import { PROJECTS } from "~/data/projects";
import { calculateStackSizeFactors } from "~/utils/calculate-stack-size";
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
 * Clamp helper
 */
function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

/**
 * Proper D3 custom force: boundary constraint
 * - Uses .initialize(nodes) to capture simulation nodes
 * - Provides .update(width, height) to change bounds dynamically
 */
function makeBoundaryForce(width: number, height: number, padding = 10) {
  let nodes: SimulationNode[] = [];

  function force() {
    for (const node of nodes) {
      if (node.fx !== undefined) continue; // skip fixed nodes
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
  }

  // biome-ignore lint/suspicious/noExplicitAny: D3 force type extension
  (force as any).initialize = (_nodes: SimulationNode[]) => {
    nodes = _nodes;
  };
  // biome-ignore lint/suspicious/noExplicitAny: D3 force type extension
  (force as any).update = (w: number, h: number) => {
    width = w;
    height = h;
  };

  return force as unknown as d3.Force<SimulationNode, undefined>;
}

/**
 * Proper D3 custom force: root exclusion ring
 * - pushes stack nodes outward if they enter root exclusion radius
 * - Uses .initialize(nodes) to capture simulation nodes
 * - Provides .update(cx, cy, r) to change center/radius dynamically
 */
function makeRootExclusionForce(
  cx: number,
  cy: number,
  rootRadius: number,
  strength = 0.12,
  factor = 1.3,
) {
  let nodes: SimulationNode[] = [];
  let exclusionRadius = rootRadius * factor;

  function force() {
    for (const node of nodes) {
      if (node.fx !== undefined || node.x === undefined || node.y === undefined)
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

  // biome-ignore lint/suspicious/noExplicitAny: D3 force type extension
  (force as any).initialize = (_nodes: SimulationNode[]) => {
    nodes = _nodes;
  };
  // biome-ignore lint/suspicious/noExplicitAny: D3 force type extension
  (force as any).update = (nx: number, ny: number, r: number) => {
    cx = nx;
    cy = ny;
    exclusionRadius = r * factor;
  };

  return force as unknown as d3.Force<SimulationNode, undefined>;
}

/**
 * Helper: seed initial positions outside root exclusion ring
 */
function seedPosition(
  cx: number,
  cy: number,
  width: number,
  height: number,
  nodeRadius: number,
  rootExcl: number,
  padding = 10,
) {
  const angle = Math.random() * Math.PI * 2;
  const maxR =
    Math.min(
      cx - padding - nodeRadius,
      width - cx - padding - nodeRadius,
      cy - padding - nodeRadius,
      height - cy - padding - nodeRadius,
    ) || 0;
  const minR = rootExcl + nodeRadius + 4;
  const r = clamp(minR + Math.random() * (maxR - minR), minR, maxR);
  const x = clamp(
    cx + Math.cos(angle) * r,
    padding + nodeRadius,
    width - padding - nodeRadius,
  );
  const y = clamp(
    cy + Math.sin(angle) * r,
    padding + nodeRadius,
    height - padding - nodeRadius,
  );
  return { x, y };
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

  // Custom forces refs to update in-place (avoid re-allocating)
  const boundaryForceRef = useRef<
    d3.Force<SimulationNode, undefined> & {
      update?: (w: number, h: number) => void;
    }
  >(undefined);
  const rootExclusionForceRef = useRef<
    d3.Force<SimulationNode, undefined> & {
      update?: (cx: number, cy: number, r: number) => void;
    }
  >(undefined);

  // Kick-once flag to simulate the "resize/scroll" reheat after mount
  const didInitialKickRef = useRef(false);

  // State
  const [dimensions, setDimensions] = useState<Dimensions | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Extract stacks once
  const stacks = useMemo(() => extractUniqueStacks(PROJECTS), []);

  // Calculate size factors based on experience
  const sizeFactors = useMemo(() => calculateStackSizeFactors(PROJECTS), []);

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

      // Experience-based stack nodes and seeded positions
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

      // biome-ignore lint/suspicious/noExplicitAny: D3 force ref assignment
      boundaryForceRef.current = boundary as any;
      // biome-ignore lint/suspicious/noExplicitAny: D3 force ref assignment
      rootExclusionForceRef.current = rootExclusion as any;

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

      // Paint initial positions once; animation/elegant separation will be
      // kicked via a synthetic viewport change after mount.
      handleTick();
    },
    [stacks, sizeFactors, handleTick],
  );

  /**
   * Update simulation when dimensions change (resize/scroll/orientation)
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

      // Update root
      const rootNode = nodes[0];
      if (rootNode) {
        rootNode.fx = centerX;
        rootNode.fy = centerY;
        rootNode.radius = rootRadius;
      }

      // Update stack node radii only - let forces handle positioning
      for (const node of nodes.slice(1)) {
        const sizeFactor = sizeFactors.get(node.name) ?? 1.0;
        node.radius = stackRadius * sizeFactor;
      }

      // Update center force
      sim.force("center", d3.forceCenter(centerX, centerY).strength(0.05));

      // Update collide radii in-place (radius accessor is cached)
      const collide = sim.force("collide") as d3.ForceCollide<SimulationNode>;
      // biome-ignore lint/suspicious/noExplicitAny: D3 force property check
      if (collide && (collide as any).radius) {
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

      // Update custom forces without re-allocating
      const boundary = boundaryForceRef.current;
      if (boundary?.update) boundary.update(width, height);
      else sim.force("boundary", makeBoundaryForce(width, height, 10));

      const rootExclusionForce = rootExclusionForceRef.current;
      if (rootExclusionForce?.update)
        rootExclusionForce.update(centerX, centerY, rootRadius);
      else
        sim.force(
          "rootExclusion",
          makeRootExclusionForce(centerX, centerY, rootRadius),
        );

      // Gentle reheat using alphaTarget pattern (recommended for dynamic updates)
      if (prefersReducedMotion) {
        // Static, no animation
        sim.stop();
        sim.tick(40);
        handleTick();
      } else {
        // Use low alphaTarget to smoothly adjust to new dimensions
        // This is the standard pattern for dynamic force layout updates
        sim.alphaTarget(0.1).restart();

        // Reset alphaTarget after brief period to allow cooling
        setTimeout(() => {
          if (sim) sim.alphaTarget(0);
        }, 300);
      }
    },
    [sizeFactors, handleTick],
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
        setDimensions(measurements);
        updateSimulation(measurements);
      }
    }, 150);

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
        setDimensions(measurements);
        updateSimulation(measurements);
      }
    }, 150);

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

  /**
   * IMPORTANT: Trigger the same elegant separation immediately after mount.
   * We simulate a viewport change (like iOS scroll/resize) using double RAF,
   * then call the same updateSimulation path and dispatch synthetic events.
   */
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
      const m = measureContainer() ?? dimensions;
      if (simulationRef.current) {
        // Run through the exact same path as a real resize/scroll
        setDimensions(m);
        updateSimulation(m);
      }

      // Also synthesize browser events to mimic environment triggers
      try {
        window.dispatchEvent(new Event("resize"));
        // biome-ignore lint/suspicious/noEmptyBlockStatements: Intentional - errors are not critical
      } catch {}
      try {
        window.visualViewport?.dispatchEvent?.(new Event("resize"));
        // biome-ignore lint/suspicious/noEmptyBlockStatements: Intentional - errors are not critical
      } catch {}
      if (!prefersReducedMotion) {
        // Nudge alpha target briefly like a drag/interaction
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
  }, [dimensions, measureContainer, updateSimulation]);

  return (
    <div ref={wrapperRef} className="stack-cloud-wrapper">
      {!dimensions ? null : (
        <svg
          ref={svgRef}
          className="stack-cloud-svg"
          viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
          role="img"
          aria-label="Technology stack visualization"
          style={{
            opacity: isVisible ? 1 : 0,
            transition: "opacity 0.6s ease-in-out",
          }}
        >
          {/* Root node */}
          <g
            ref={(el) => {
              if (el) nodesRef.current.set("root", el);
              else nodesRef.current.delete("root");
            }}
            className="node root-node"
            aria-label="Root node"
            transform={`translate(${dimensions.centerX}, ${dimensions.centerY})`}
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
            const sizeFactor = sizeFactors.get(stack.name) ?? 1.0;
            const nodeRadius = dimensions.stackRadius * sizeFactor;
            const iconSize = nodeRadius * 1.4; // 70% of diameter

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
                  r={nodeRadius}
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
