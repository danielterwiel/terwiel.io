"use client";

import { Suspense, useState } from "react";

import type { Stack } from "~/types";

import { PROJECTS } from "~/data/projects";
import { extractUniqueStacks } from "~/utils/extract-stacks";
import { calculateStackSizeFactors } from "~/utils/stack-cloud/calculate-stack-size";
import { StackSphereItem } from "./stack-sphere-item";
import { useSpherePositions } from "./use-sphere-positions";

import "./stack-sphere.css";

// Default sphere configuration
const SPHERE_RADIUS = 150; // Base radius for translateZ
const BASE_ITEM_RADIUS = 24; // Base radius for individual items

/**
 * Inner component that uses hooks
 * Wrapped in Suspense for useSearchParams compatibility
 */
function StackSphereInner() {
  const [hoveredStack, setHoveredStack] = useState<string | null>(null);

  // Extract stacks from projects
  const stacks = extractUniqueStacks(PROJECTS);

  // Calculate size factors based on experience
  const sizeFactors = calculateStackSizeFactors(PROJECTS);

  // Calculate sphere positions for all items
  const positions = useSpherePositions(stacks.length, SPHERE_RADIUS);

  const handleMouseEnter = (stackName: string) => {
    setHoveredStack(stackName);
  };

  const handleMouseLeave = () => {
    setHoveredStack(null);
  };

  return (
    <div className="stack-sphere-container">
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
          const isHovered = hoveredStack === stack.name;

          return (
            <StackSphereItem
              key={stack.id}
              stack={stack}
              position={position}
              sizeFactor={sizeFactor}
              baseRadius={BASE_ITEM_RADIUS}
              isDirectlyHovered={isHovered}
              highlighted={isHovered}
              onMouseEnter={() => handleMouseEnter(stack.name)}
              onMouseLeave={handleMouseLeave}
            />
          );
        })}
      </div>
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
