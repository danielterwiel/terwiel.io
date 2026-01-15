"use client";

import { Suspense, useCallback, useState } from "react";

import type { Domain, Stack } from "~/types";

import { DOMAINS } from "~/constants/domains";
import { PROJECTS } from "~/data/projects";
import { useRovingTabindex } from "~/hooks/use-roving-tabindex";
import { extractUniqueStacks } from "~/utils/extract-stacks";
import { calculateStackSizeFactors } from "~/utils/stack-cloud/calculate-stack-size";
import { StackSphereExperience } from "./stack-sphere-experience";
import { StackSphereItem } from "./stack-sphere-item";
import { StackSphereSegment } from "./stack-sphere-segment";
import { useSpherePositions } from "./use-sphere-positions";

import "./stack-sphere.css";

// Default sphere configuration
const SPHERE_RADIUS = 150; // Base radius for translateZ
const BASE_ITEM_RADIUS = 24; // Base radius for individual items

/**
 * Inner component that uses hooks
 * Wrapped in Suspense for useSearchParams compatibility
 */
// Position segments around the sphere perimeter
const SEGMENT_POSITIONS: Record<
  Domain,
  {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
    transform?: string;
  }
> = {
  "Front-end": { top: "-28px", left: "50%", transform: "translateX(-50%)" },
  "Back-end": { bottom: "-28px", left: "50%", transform: "translateX(-50%)" },
  DevOps: { top: "50%", right: "-48px", transform: "translateY(-50%)" },
  Design: { top: "50%", left: "-40px", transform: "translateY(-50%)" },
  QA: { top: "15%", right: "-24px" },
  AI: { bottom: "15%", left: "-16px" },
};

function StackSphereInner() {
  const [hoveredStack, setHoveredStack] = useState<{
    name: string;
    iconKey: string;
  } | null>(null);
  const [hoveredDomain, setHoveredDomain] = useState<Domain | null>(null);

  // Extract stacks from projects
  const stacks = extractUniqueStacks(PROJECTS);

  // Calculate size factors based on experience
  const sizeFactors = calculateStackSizeFactors(PROJECTS);

  // Calculate sphere positions for all items
  const positions = useSpherePositions(stacks.length, SPHERE_RADIUS);

  // Roving tabindex for keyboard navigation
  const { getTabIndex, handleKeyDown, registerItemRef } = useRovingTabindex(
    stacks,
    {
      direction: "both",
      loop: true,
    },
  );

  const handleMouseEnter = useCallback(
    (stack: { name: string; iconKey: string }) => {
      setHoveredStack(stack);
    },
    [],
  );

  const handleMouseLeave = useCallback(() => {
    setHoveredStack(null);
  }, []);

  const handleDomainMouseEnter = useCallback((domain: Domain) => {
    setHoveredDomain(domain);
  }, []);

  const handleDomainMouseLeave = useCallback(() => {
    setHoveredDomain(null);
  }, []);

  return (
    <div className="stack-sphere-container">
      {/* Center experience display - positioned absolutely, doesn't rotate */}
      <StackSphereExperience
        hoveredStack={hoveredStack}
        hoveredDomain={hoveredDomain}
      />

      <div
        className="stack-sphere"
        style={{
          width: SPHERE_RADIUS * 2 + BASE_ITEM_RADIUS * 4,
          height: SPHERE_RADIUS * 2 + BASE_ITEM_RADIUS * 4,
          margin: "0 auto",
        }}
      >
        {stacks.map((stack: Stack, index: number) => {
          const position = positions[index];
          if (!position) return null;

          const sizeFactor = sizeFactors.get(stack.name) ?? 1.0;
          const isHovered = hoveredStack?.name === stack.name;
          const isDomainHighlighted = hoveredDomain === stack.domain;

          return (
            <StackSphereItem
              ref={(el) => registerItemRef(stack.id, el)}
              key={stack.id}
              stack={stack}
              position={position}
              sizeFactor={sizeFactor}
              baseRadius={BASE_ITEM_RADIUS}
              tabIndex={getTabIndex(stack.id)}
              isDirectlyHovered={isHovered}
              highlighted={isHovered || isDomainHighlighted}
              onMouseEnter={() =>
                handleMouseEnter({ name: stack.name, iconKey: stack.iconKey })
              }
              onMouseLeave={handleMouseLeave}
              onKeyDown={handleKeyDown}
            />
          );
        })}
      </div>

      {/* Domain segment indicators around the sphere */}
      {DOMAINS.map((domain) => (
        <StackSphereSegment
          key={domain}
          domain={domain}
          position={SEGMENT_POSITIONS[domain]}
          onMouseEnter={() => handleDomainMouseEnter(domain)}
          onMouseLeave={handleDomainMouseLeave}
        />
      ))}
    </div>
  );
}

/**
 * StackSphere - CSS 3D sphere visualization
 *
 * Displays technology stacks distributed on a rotating 3D sphere.
 * Uses pure CSS transforms for GPU-accelerated performance.
 *
 * Features:
 * - Fibonacci sphere distribution for even point placement
 * - Experience-based variable sizing
 * - Hover to pause rotation and highlight
 * - Click to filter by stack
 * - Keyboard navigation with roving tabindex
 * - Full a11y support (reduced motion, screen readers)
 */
export function StackSphere() {
  return (
    <div className="flex flex-col h-full md:h-full">
      <h2 className="pb-6 md:pb-0 text-2xl font-bold md:text-center md:pt-10 hidden md:block landscape-mobile:hidden">
        Stack
      </h2>
      <div className="flex-1 flex items-center justify-center">
        {/* biome-ignore lint/a11y/useSemanticElements: fieldset not appropriate for this visual grouping */}
        <div
          className="stack-sphere-wrapper w-full"
          role="group"
          aria-label="Technology stack visualization"
          style={{ position: "relative" }}
        >
          <Suspense fallback={<div className="stack-sphere-loading" />}>
            <StackSphereInner />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
