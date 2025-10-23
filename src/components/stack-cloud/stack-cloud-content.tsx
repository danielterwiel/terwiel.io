"use client";

import { useSearchParams } from "next/navigation";

import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type { Domain } from "~/types";

import { RootNode } from "~/components/stack-cloud/root-node";
import { StackNode } from "~/components/stack-cloud/stack-node";
import { STACK_SELECTION_SCALE } from "~/constants/stack-selection-scale";
import { PROJECTS } from "~/data/projects";
import { useAccessibility } from "~/hooks/use-accessibility";
import { useDimensions } from "~/hooks/use-dimensions";
import { useStackSimulation } from "~/hooks/use-stack-simulation";
import { buildExperienceCache } from "~/utils/experience-cache";
import { extractUniqueStacks } from "~/utils/extract-stacks";
import {
  getInitialSelectedDomain,
  getInitialSelectedStack,
} from "~/utils/get-initial-selection";
import {
  getHoverStackOnLeave,
  isActiveStackHover,
} from "~/utils/hover-state-manager";
import { getSearchDomain } from "~/utils/search-params";
import { calculateStackSizeFactors } from "~/utils/stack-cloud/calculate-stack-size";
import { buildSelectionIndex } from "~/utils/stack-cloud/selection-index";

/**
 * D3 force-directed visualization of technology stacks
 * Optimized for iOS Safari with dynamic viewport handling
 * Must be wrapped in Suspense (uses useSearchParams)
 *
 * Performance optimizations:
 * - useDeferredValue defers heavy stack re-evaluations
 * - Selection state cached to avoid O(n) lookups per render
 * - D3 transitions don't block urgent UI updates
 */
export function StackCloudContent() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const searchParams = useSearchParams();

  // Defer search params updates to let animations complete first
  // This prevents expensive O(n) stack selection checks from blocking UI
  const deferredSearchParams = useDeferredValue(searchParams);

  const a11y = useAccessibility();

  // Extract stacks and calculate size factors once
  const stacks = useMemo(() => extractUniqueStacks(PROJECTS), []);
  const sizeFactors = useMemo(() => calculateStackSizeFactors(PROJECTS), []);

  // Build experience cache once for instant toast lookups (O(1) instead of O(n))
  // This precomputes all domain and stack experiences to eliminate expensive
  // date parsing and overlap calculations during interactions
  useMemo(() => buildExperienceCache(PROJECTS), []);

  // Build selection index once for O(1) stack selection checks
  const selectionIndex = useMemo(() => {
    return buildSelectionIndex(PROJECTS);
  }, []);

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
  // IMPORTANT: Use regular searchParams (not deferred) to immediately update D3 simulation
  // Deferred values would cause the simulation to restart multiple times per click
  // Uses selection index for O(1) lookup instead of O(n) scan
  const scaleFactors = useMemo(() => {
    const scaleFactorMap = new Map<string, number>();

    // Get selected domain from search params using existing helper
    // Use regular searchParams to trigger simulation updates immediately on clicks
    const query = searchParams.get("query")?.toLowerCase().trim() ?? "";
    const selectedDomain = getSearchDomain(query, PROJECTS) as Domain | null;

    for (const stack of stacks) {
      // A stack is selected if:
      // 1. Its domain matches the search query, OR
      // 2. Its name matches the search query directly (case-insensitive start match)
      const isInSelectedDomain =
        selectedDomain !== null &&
        selectionIndex.isStackInDomain(stack.name, selectedDomain);

      const isDirectlyNamed =
        query !== "" && stack.name.toLowerCase().startsWith(query);

      const selected = isInSelectedDomain || isDirectlyNamed;
      scaleFactorMap.set(stack.id, selected ? STACK_SELECTION_SCALE : 1.0);
    }
    return scaleFactorMap;
  }, [stacks, searchParams, selectionIndex]);

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
  // Uses deferredSearchParams to defer hover state updates
  useEffect(() => {
    const searchQuery =
      deferredSearchParams.get("query")?.toLowerCase().trim() ?? "";

    // Clear all hover states when search param is empty (iOS Safari touch fix)
    if (searchQuery === "") {
      setHoveredStack(null);
      setHoveredDomain(null);
      return;
    }

    // Get the appropriate hover state based on current selection
    const hoverStack = getInitialSelectedStack(
      deferredSearchParams,
      stacks,
      PROJECTS,
    );
    const hoverDomain = getInitialSelectedDomain(
      deferredSearchParams,
      PROJECTS,
    );

    // Update hover states
    setHoveredStack(hoverStack);
    setHoveredDomain(hoverDomain);
  }, [deferredSearchParams, stacks]);

  // Memoize callback for setting hovered domain
  const handleSetHoveredDomain = useCallback((domain: Domain | null) => {
    setHoveredDomain(domain);
  }, []);

  // Memoize root node ref callback
  const handleRootNodeRef = useCallback(
    (el: SVGGElement | null) => {
      if (el) nodesRef.current.set("root", el);
      else nodesRef.current.delete("root");
    },
    [nodesRef],
  );

  // Create memoized factory function for stack node ref callbacks
  const createStackNodeRefCallback = useCallback(
    (stackId: string) => (el: SVGGElement | null) => {
      if (el) nodesRef.current.set(stackId, el);
      else nodesRef.current.delete(stackId);
    },
    [nodesRef],
  );

  // Create memoized factory function for stack mouse enter callbacks
  const createStackMouseEnterCallback = useCallback(
    (stack: {
      id: string;
      name: string;
      iconKey: string;
      color: string;
      domain: Domain;
    }) =>
      () => {
        setHoveredStack(stack);
      },
    [],
  );

  // Create memoized mouse leave callback
  const handleStackMouseLeave = useCallback(() => {
    // Restore the appropriate hover state when mouse leaves
    const hoverStack = getHoverStackOnLeave(searchParams, stacks, PROJECTS);
    setHoveredStack(hoverStack);
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
            // Prevent text selection on rapid clicks while maintaining keyboard a11y
            userSelect: "none",
            WebkitUserSelect: "none",
            WebkitTouchCallout: "none",
          }}
        >
          {/* No SVG filters - using CSS drop-shadow for better performance */}

          <RootNode
            dimensions={dimensions}
            nodeRef={handleRootNodeRef}
            onDomainHover={handleSetHoveredDomain}
            hoveredStack={hoveredStack}
            isActiveHover={isActiveHover}
          />

          {stacks.map((stack) => {
            // Use selection index for O(1) lookup instead of isStackSelected O(n)
            // Use regular searchParams to show immediate visual feedback on clicks
            const query = searchParams.get("query")?.toLowerCase().trim() ?? "";
            const selectedDomain = getSearchDomain(
              query,
              PROJECTS,
            ) as Domain | null;
            const isInSelectedDomain =
              selectedDomain !== null &&
              selectionIndex.isStackInDomain(stack.name, selectedDomain);
            const isDirectlyNamed =
              query !== "" && stack.name.toLowerCase().startsWith(query);
            const selected = isInSelectedDomain || isDirectlyNamed;

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
                nodeRef={createStackNodeRefCallback(stack.id)}
                onMouseEnter={createStackMouseEnterCallback(stack)}
                onMouseLeave={handleStackMouseLeave}
              />
            );
          })}
        </svg>
      )}
    </div>
  );
}
