"use client";

import { useSearchParams } from "next/navigation";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";

import type { Domain } from "~/data/projects";
import { RootNode } from "~/components/stack-cloud/root-node";
import { StackNode } from "~/components/stack-cloud/stack-node";
import { DOMAIN_COLORS } from "~/constants/colors";
import { STACK_SELECTION_SCALE } from "~/constants/stack-selection-scale";
import { PROJECTS } from "~/data/projects";
import { useDimensions } from "~/hooks/use-dimensions";
import { useStackSimulation } from "~/hooks/use-stack-simulation";
import { extractUniqueStacks } from "~/utils/extract-stacks";
import { calculateStackSizeFactors } from "~/utils/stack-cloud/calculate-stack-size";
import { isStackSelected } from "~/utils/stack-selection";

/**
 * StackCloudContent Component
 * A responsive D3 force-directed visualization of technology stacks
 * Optimized for iOS Safari with dynamic viewport handling
 * Uses useSearchParams() so must be wrapped in Suspense
 */
export function StackCloudContent() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const searchParams = useSearchParams();

  // Hover state management
  const [hoveredStackId, setHoveredStackId] = useState<string | null>(null);
  const [hoveredDomain, setHoveredDomain] = useState<Domain | null>(null);

  // Extract stacks and calculate size factors once
  const stacks = useMemo(() => extractUniqueStacks(PROJECTS), []);
  const sizeFactors = useMemo(() => calculateStackSizeFactors(PROJECTS), []);

  // Calculate scale factors based on selection state
  const scaleFactors = useMemo(() => {
    const scaleFactorMap = new Map<string, number>();
    for (const stack of stacks) {
      const selected = isStackSelected(stack, searchParams, PROJECTS);
      scaleFactorMap.set(stack.id, selected ? STACK_SELECTION_SCALE : 1.0);
    }
    return scaleFactorMap;
  }, [stacks, searchParams]);

  // Custom hooks for dimensions and simulation
  const { dimensions } = useDimensions(wrapperRef);
  const { nodesRef, isVisible, updateSimulation, updateNodeScaleFactors } =
    useStackSimulation({
      dimensions,
      stacks,
      sizeFactors,
      scaleFactors,
    });

  // Update simulation when dimensions change
  useEffect(() => {
    if (dimensions) {
      updateSimulation(dimensions);
    }
  }, [dimensions, updateSimulation]);

  // Update node scale factors when selection changes (after initial setup)
  useEffect(() => {
    updateNodeScaleFactors(scaleFactors);
  }, [scaleFactors, updateNodeScaleFactors]);

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
          {/* SVG Radial Gradient Definitions for Glow Effects */}
          <defs>
            {Object.entries(DOMAIN_COLORS).map(([domain, color]) => (
              <g key={domain}>
                {/* Subtle glow for unselected state */}
                <radialGradient id={`glow-${domain}-unselected`}>
                  <stop offset="0%" stopColor={color} stopOpacity="0.6" />
                  <stop offset="50%" stopColor={color} stopOpacity="0.3" />
                  <stop offset="100%" stopColor={color} stopOpacity="0" />
                </radialGradient>
                {/* Prominent glow for selected state */}
                <radialGradient id={`glow-${domain}-selected`}>
                  <stop offset="0%" stopColor={color} stopOpacity="0.7" />
                  <stop offset="40%" stopColor={color} stopOpacity="0.4" />
                  <stop offset="100%" stopColor={color} stopOpacity="0" />
                </radialGradient>
              </g>
            ))}
          </defs>

          <RootNode
            dimensions={dimensions}
            nodeRef={(el) => {
              if (el) nodesRef.current.set("root", el);
              else nodesRef.current.delete("root");
            }}
            onDomainHover={setHoveredDomain}
          />

          {stacks.map((stack) => {
            const selected = isStackSelected(stack, searchParams, PROJECTS);
            const highlighted =
              hoveredStackId === stack.id ||
              (hoveredDomain !== null && stack.domain === hoveredDomain);

            return (
              <StackNode
                key={stack.id}
                stack={stack}
                dimensions={dimensions}
                sizeFactors={sizeFactors}
                selected={selected}
                highlighted={highlighted}
                nodeRef={(el) => {
                  if (el) nodesRef.current.set(stack.id, el);
                  else nodesRef.current.delete(stack.id);
                }}
                onMouseEnter={() => setHoveredStackId(stack.id)}
                onMouseLeave={() => setHoveredStackId(null)}
              />
            );
          })}
        </svg>
      )}
    </div>
  );
}

/**
 * StackCloud Wrapper Component
 * Wraps StackCloudContent in Suspense for Next.js 15 compatibility
 */
export function StackCloud() {
  return (
    <Suspense fallback={<div className="stack-cloud-wrapper" />}>
      <StackCloudContent />
    </Suspense>
  );
}
