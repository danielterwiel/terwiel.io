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
  const [hoveredDomain, setHoveredDomain] = useState<Domain | null>(null);
  const [hoveredStack, setHoveredStack] = useState<{
    id: string;
    name: string;
    iconKey: string;
    color: string;
    domain: Domain;
  } | null>(null);

  // Track active hover state without triggering effects
  const isActivelyHoveringRef = useRef(false);

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

  // Keep ref in sync with hover state
  // Derive if actively hovering by checking if hoveredStack differs from selected stack
  const selectedStack = useMemo(
    () => stacks.find((s) => isStackSelected(s, searchParams, PROJECTS)),
    [stacks, searchParams],
  );

  useEffect(() => {
    isActivelyHoveringRef.current =
      hoveredStack !== null &&
      (selectedStack === undefined || hoveredStack.id !== selectedStack.id);
  }, [hoveredStack, selectedStack]);

  // Set initial hovered stack based on selected stack in search params
  // But only if a domain is not selected
  useEffect(() => {
    const searchQuery = searchParams.get("search")?.toLowerCase().trim() ?? "";

    // On iOS Safari, touch events don't reliably trigger onMouseLeave
    // So we need to clear hover state when search param is cleared, regardless of hover ref
    const shouldClearHoverState = searchQuery === "";

    // Clear all hover states when search param is empty (iOS Safari touch fix)
    if (shouldClearHoverState) {
      setHoveredStack(null);
      setHoveredDomain(null);
      return;
    }

    // Don't override if actively hovering a node
    if (isActivelyHoveringRef.current) return;

    // Check if the search query is a domain name
    const domains = ["DevOps", "Back-end", "Front-end", "Design"];
    const isDomainSelected = domains.some(
      (domain) => domain.toLowerCase() === searchQuery,
    );

    // Only set hovered stack if a domain is not selected
    if (!isDomainSelected && selectedStack) {
      setHoveredStack(selectedStack);
    } else {
      setHoveredStack(null);
    }
  }, [searchParams, selectedStack]);

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
                {/* Outer glow for highlighted state */}
                <filter
                  id={`glow-${domain}-highlighted`}
                  x="-100%"
                  y="-100%"
                  width="300%"
                  height="300%"
                >
                  <feGaussianBlur
                    in="SourceAlpha"
                    stdDeviation="5"
                    result="blur"
                  />
                  <feFlood floodColor={color} floodOpacity="0.5" />
                  <feComposite in2="blur" operator="in" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                {/* Outer glow for selected state */}
                <filter
                  id={`glow-${domain}-selected`}
                  x="-100%"
                  y="-100%"
                  width="300%"
                  height="300%"
                >
                  <feGaussianBlur
                    in="SourceAlpha"
                    stdDeviation="8"
                    result="blur"
                  />
                  <feFlood floodColor={color} floodOpacity="0.7" />
                  <feComposite in2="blur" operator="in" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
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
            isActiveHover={
              hoveredStack !== null &&
              (selectedStack === undefined ||
                hoveredStack.id !== selectedStack.id)
            }
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
                  // Keep selected stack if exists (but not if a domain is selected)
                  const searchQuery =
                    searchParams.get("search")?.toLowerCase().trim() ?? "";
                  const domains = ["DevOps", "Back-end", "Front-end", "Design"];
                  const isDomainSelected = domains.some(
                    (domain) => domain.toLowerCase() === searchQuery,
                  );

                  if (!isDomainSelected && selectedStack) {
                    setHoveredStack(selectedStack);
                  } else {
                    setHoveredStack(null);
                  }
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
