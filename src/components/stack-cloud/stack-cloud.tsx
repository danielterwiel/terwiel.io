"use client";

import { useEffect, useMemo, useRef } from "react";

import { RootNode } from "~/components/stack-cloud/root-node";
import { StackNode } from "~/components/stack-cloud/stack-node";
import { PROJECTS } from "~/data/projects";
import { useDimensions } from "~/hooks/use-dimensions";
import { useStackSimulation } from "~/hooks/use-stack-simulation";
import { extractUniqueStacks } from "~/utils/extract-stacks";
import { calculateStackSizeFactors } from "~/utils/stack-cloud/calculate-stack-size";

/**
 * StackCloud Component
 * A responsive D3 force-directed visualization of technology stacks
 * Optimized for iOS Safari with dynamic viewport handling
 */
export function StackCloud() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Extract stacks and calculate size factors once
  const stacks = useMemo(() => extractUniqueStacks(PROJECTS), []);
  const sizeFactors = useMemo(() => calculateStackSizeFactors(PROJECTS), []);

  // Custom hooks for dimensions and simulation
  const { dimensions } = useDimensions(wrapperRef);
  const { nodesRef, isVisible, updateSimulation } = useStackSimulation({
    dimensions,
    stacks,
    sizeFactors,
  });

  // Update simulation when dimensions change
  useEffect(() => {
    if (dimensions) {
      updateSimulation(dimensions);
    }
  }, [dimensions, updateSimulation]);

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
          <RootNode
            dimensions={dimensions}
            nodeRef={(el) => {
              if (el) nodesRef.current.set("root", el);
              else nodesRef.current.delete("root");
            }}
          />

          {stacks.map((stack) => (
            <StackNode
              key={stack.id}
              stack={stack}
              dimensions={dimensions}
              sizeFactors={sizeFactors}
              nodeRef={(el) => {
                if (el) nodesRef.current.set(stack.id, el);
                else nodesRef.current.delete(stack.id);
              }}
            />
          ))}
        </svg>
      )}
    </div>
  );
}
