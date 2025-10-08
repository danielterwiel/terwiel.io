"use client";

import { useSearchParams } from "next/navigation";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";

import type { Domain } from "~/types";

import { RootNode } from "~/components/stack-cloud/root-node";
import { StackNode } from "~/components/stack-cloud/stack-node";
import { DOMAIN_COLORS } from "~/constants/colors";
import { STACK_SELECTION_SCALE } from "~/constants/stack-selection-scale";
import { PROJECTS } from "~/data/projects";
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
 * StackCloudContent Component
 * A responsive D3 force-directed visualization of technology stacks
 * Optimized for iOS Safari with dynamic viewport handling
 * Uses useSearchParams() so must be wrapped in Suspense
 */
export function StackCloudContent() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const searchParams = useSearchParams();

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
          aria-label="Technology stack visualization"
          style={{
            opacity: isVisible ? 1 : 0,
            transition: "opacity 0.6s ease-in-out",
          }}
        >
          {/* SVG Filter Definitions for Outer Glow Effects */}
          <defs>
            {/* Outer glow filters for each domain color */}
            {Object.entries(DOMAIN_COLORS).map(([domain, color]) => (
              <g key={domain}>
                {/* Outer glow for highlighted state - Multi-layer for depth */}
                <filter
                  id={`glow-${domain}-highlighted`}
                  x="-150%"
                  y="-150%"
                  width="400%"
                  height="400%"
                  colorInterpolationFilters="sRGB"
                >
                  {/* Outer soft glow */}
                  <feGaussianBlur
                    in="SourceAlpha"
                    stdDeviation="8"
                    result="blur1"
                  />
                  <feFlood floodColor={color} floodOpacity="0.4" />
                  <feComposite in2="blur1" operator="in" result="glow1" />

                  {/* Inner stronger glow */}
                  <feGaussianBlur
                    in="SourceAlpha"
                    stdDeviation="3"
                    result="blur2"
                  />
                  <feFlood floodColor={color} floodOpacity="0.6" />
                  <feComposite in2="blur2" operator="in" result="glow2" />

                  <feMerge>
                    <feMergeNode in="glow1" />
                    <feMergeNode in="glow2" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                {/* Outer glow for selected state - Stronger multi-layer glow */}
                <filter
                  id={`glow-${domain}-selected`}
                  x="-150%"
                  y="-150%"
                  width="400%"
                  height="400%"
                  colorInterpolationFilters="sRGB"
                >
                  {/* Outer soft glow */}
                  <feGaussianBlur
                    in="SourceAlpha"
                    stdDeviation="12"
                    result="blur1"
                  />
                  <feFlood floodColor={color} floodOpacity="0.5" />
                  <feComposite in2="blur1" operator="in" result="glow1" />

                  {/* Middle glow */}
                  <feGaussianBlur
                    in="SourceAlpha"
                    stdDeviation="6"
                    result="blur2"
                  />
                  <feFlood floodColor={color} floodOpacity="0.7" />
                  <feComposite in2="blur2" operator="in" result="glow2" />

                  {/* Inner strong glow */}
                  <feGaussianBlur
                    in="SourceAlpha"
                    stdDeviation="2"
                    result="blur3"
                  />
                  <feFlood floodColor={color} floodOpacity="0.8" />
                  <feComposite in2="blur3" operator="in" result="glow3" />

                  <feMerge>
                    <feMergeNode in="glow1" />
                    <feMergeNode in="glow2" />
                    <feMergeNode in="glow3" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
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
            hoveredStack={hoveredStack}
            isActiveHover={isActiveHover}
          />

          {stacks.map((stack) => {
            const selected = isStackSelected(stack, searchParams, PROJECTS);
            const highlighted =
              hoveredStack?.id === stack.id ||
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
