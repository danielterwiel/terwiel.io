"use client";

import { useSearchParams } from "next/navigation";

import { useEffect, useMemo, useRef, useState } from "react";

import type { Domain } from "~/types";

import { RootNode } from "~/components/stack-cloud/root-node";
import { StackNode } from "~/components/stack-cloud/stack-node";
import { STACK_SELECTION_SCALE } from "~/constants/stack-selection-scale";
import { PROJECTS } from "~/data/projects";
import { useAccessibility } from "~/hooks/use-accessibility";
import { useDimensions } from "~/hooks/use-dimensions";
import { useStackSimulation } from "~/hooks/use-stack-simulation";
import { extractUniqueStacks } from "~/utils/extract-stacks";
import {
  getInitialSelectedDomain,
  getInitialSelectedStack,
} from "~/utils/get-initial-selection";
import {
  getHoverStackOnLeave,
  isActiveStackHover,
} from "~/utils/hover-state-manager";
import { calculateStackSizeFactors } from "~/utils/stack-cloud/calculate-stack-size";
import { isStackSelected } from "~/utils/stack-selection";

/**
 * D3 force-directed visualization of technology stacks
 * Optimized for iOS Safari with dynamic viewport handling
 * Must be wrapped in Suspense (uses useSearchParams)
 */
export function StackCloudContent() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const searchParams = useSearchParams();

  const a11y = useAccessibility();

  // Extract stacks and calculate size factors once
  const stacks = useMemo(() => extractUniqueStacks(PROJECTS), []);
  const sizeFactors = useMemo(() => calculateStackSizeFactors(PROJECTS), []);

  // Hover state management - initialize with selected domain/stack if present
  const [hoveredDomain, setHoveredDomain] = useState<Domain | null>(() =>
    getInitialSelectedDomain(searchParams, PROJECTS),
  );
  const [hoveredStack, setHoveredStack] = useState<{
    id: string;
    name: string;
    iconKey: string;
    color: string;
    domain: Domain;
  } | null>(() => getInitialSelectedStack(searchParams, stacks, PROJECTS));

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

  // Derive if actively hovering by checking if hoveredStack differs from selected stack
  const isActiveHover = useMemo(
    () => isActiveStackHover(hoveredStack, searchParams, stacks, PROJECTS),
    [hoveredStack, searchParams, stacks],
  );

  // Sync hover state with search params (selected stack/domain)
  useEffect(() => {
    const searchQuery = searchParams.get("search")?.toLowerCase().trim() ?? "";

    // Clear all hover states when search param is empty (iOS Safari touch fix)
    if (searchQuery === "") {
      setHoveredStack(null);
      setHoveredDomain(null);
      return;
    }

    // Get the appropriate hover state based on current selection
    const hoverStack = getInitialSelectedStack(searchParams, stacks, PROJECTS);
    const hoverDomain = getInitialSelectedDomain(searchParams, PROJECTS);

    // Update hover states
    setHoveredStack(hoverStack);
    setHoveredDomain(hoverDomain);
  }, [searchParams, stacks]);

  return (
    <div ref={wrapperRef} className="stack-cloud-wrapper">
      {!dimensions ? null : (
        <svg
          ref={svgRef}
          className="stack-cloud-svg"
          viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
          role="img"
          aria-label="Technology stack visualization - interactive buttons to filter by technology"
          style={{
            opacity: isVisible ? 1 : 0,
            transition: a11y.prefersReducedMotion
              ? "none"
              : "opacity 0.6s ease-in-out",
          }}
        >
          {/* No SVG filters - using CSS drop-shadow for better performance */}

          <RootNode
            dimensions={dimensions}
            nodeRef={(el) => {
              if (el) nodesRef.current.set("root", el);
              else nodesRef.current.delete("root");
            }}
            onDomainHover={setHoveredDomain}
            hoveredStack={hoveredStack}
            isActiveHover={isActiveHover}
          />

          {stacks.map((stack) => {
            const selected = isStackSelected(stack, searchParams, PROJECTS);
            const isDirectlyHovered = hoveredStack?.id === stack.id;
            const highlighted =
              isDirectlyHovered ||
              (hoveredDomain !== null && stack.domain === hoveredDomain);

            return (
              <StackNode
                key={stack.id}
                stack={stack}
                dimensions={dimensions}
                sizeFactors={sizeFactors}
                selected={selected}
                highlighted={highlighted}
                isDirectlyHovered={isDirectlyHovered}
                nodeRef={(el) => {
                  if (el) nodesRef.current.set(stack.id, el);
                  else nodesRef.current.delete(stack.id);
                }}
                onMouseEnter={() => setHoveredStack(stack)}
                onMouseLeave={() => {
                  // Restore the appropriate hover state when mouse leaves
                  const hoverStack = getHoverStackOnLeave(
                    searchParams,
                    stacks,
                    PROJECTS,
                  );
                  setHoveredStack(hoverStack);
                }}
              />
            );
          })}
        </svg>
      )}
    </div>
  );
}
