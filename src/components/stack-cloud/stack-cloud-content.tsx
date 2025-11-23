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
import { useRovingTabindex } from "~/hooks/use-roving-tabindex";
import { useStackSimulation } from "~/hooks/use-stack-simulation";
import { calculateDomainExperiences } from "~/utils/calculate-domain-size";
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
import {
  getSearchDomain,
  getSearchFilter,
  getSearchQuery,
} from "~/utils/search-params";
import { isExactParamMatch } from "~/utils/search-params-match";
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

  // Calculate domain experiences for pie chart segments
  const domainExperiences = useMemo(
    () => calculateDomainExperiences(PROJECTS),
    [],
  );

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

  // Sync hoveredStack with search params when they change
  // This ensures hoveredStack is cleared when user searches or filter is removed
  useEffect(() => {
    const hoverStack = getHoverStackOnLeave(searchParams, stacks, PROJECTS);
    setHoveredStack(hoverStack);
  }, [searchParams, stacks]);

  // Calculate scale factors based on selection state
  // IMPORTANT: Use regular searchParams (not deferred) to immediately update D3 simulation
  // Deferred values would cause the simulation to restart multiple times per click
  // Uses selection index for O(1) lookup instead of O(n) scan
  // Checks BOTH query (from SearchInput) and filter (from StackCloud) parameters
  const scaleFactors = useMemo(() => {
    const scaleFactorMap = new Map<string, number>();

    // Get selected domain from search params using existing helper
    // Use regular searchParams to trigger simulation updates immediately on clicks
    const query = getSearchQuery(searchParams).toLowerCase();
    const filter = getSearchFilter(searchParams).toLowerCase();
    const querySelectedDomain = getSearchDomain(
      query,
      PROJECTS,
    ) as Domain | null;
    const filterSelectedDomain = getSearchDomain(
      filter,
      PROJECTS,
    ) as Domain | null;

    for (const stack of stacks) {
      // A stack is selected if it matches EITHER query or filter:
      // 1. Its domain matches the query/filter, OR
      // 2. Its name matches the query/filter directly (exact match via utility)

      const isInQueryDomain =
        querySelectedDomain !== null &&
        selectionIndex.isStackInDomain(stack.name, querySelectedDomain);
      const isDirectlyNamedByQuery = isExactParamMatch(
        searchParams,
        "query",
        stack.name,
      );

      const isInFilterDomain =
        filterSelectedDomain !== null &&
        selectionIndex.isStackInDomain(stack.name, filterSelectedDomain);
      const isDirectlyNamedByFilter = isExactParamMatch(
        searchParams,
        "filter",
        stack.name,
      );

      const selected =
        isInQueryDomain ||
        isDirectlyNamedByQuery ||
        isInFilterDomain ||
        isDirectlyNamedByFilter;
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
  // Checks BOTH query and filter parameters
  // IMPORTANT: Only clear hover states when selection is completely cleared
  // Do NOT update hover states when selection changes - preserve user's hover
  useEffect(() => {
    const searchQuery =
      deferredSearchParams.get("query")?.toLowerCase().trim() ?? "";
    const filter =
      deferredSearchParams.get("filter")?.toLowerCase().trim() ?? "";

    // Clear all hover states when both search params are empty (iOS Safari touch fix)
    if (searchQuery === "" && filter === "") {
      setHoveredStack(null);
      setHoveredDomain(null);
      return;
    }

    // When selection exists, preserve current hover state
    // Hover state should only be updated by user interaction (mouse/keyboard),
    // not by selection changes in the URL
  }, [deferredSearchParams]);

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

  // Roving tabindex for keyboard navigation (WAI-ARIA APG pattern)
  // Single tab stop for entire StackCloud with SEGMENTS FIRST, then stack nodes
  // This creates one unified navigation: segment-0, segment-1, ..., stack-0, stack-1, ...
  const allNavigableItems = useMemo(() => {
    // Segments come first in navigation order
    const segmentItems = domainExperiences.map((exp, index) => ({
      id: `segment-${index}`,
      type: "segment" as const,
      domain: exp.domain,
    }));

    // Stack nodes come after segments
    const stackItems = stacks.map((stack) => ({
      type: "stack" as const,
      ...stack,
    }));

    return [...segmentItems, ...stackItems];
  }, [domainExperiences, stacks]);

  const rovingTabindex = useRovingTabindex(allNavigableItems, {
    initialIndex: 0, // Start with first segment
    loop: true,
    direction: "both",
    onActiveIndexChange: (index) => {
      const item = allNavigableItems[index];
      if (!item) return;

      // Update hover state when keyboard navigating
      if (item.type === "segment") {
        // Hovering a segment - set domain hover
        setHoveredDomain(item.domain as Domain);
        setHoveredStack(null);
      } else {
        // Hovering a stack node
        setHoveredStack(item);
        setHoveredDomain(null);
      }
    },
  });

  return (
    <div ref={wrapperRef} className="stack-cloud-wrapper">
      {!dimensions ? null : (
        // biome-ignore lint/a11y/useSemanticElements: SVG with role="group" is required for WAI-ARIA roving tabindex pattern
        <svg
          ref={svgRef}
          className="stack-cloud-svg"
          viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
          role="group"
          aria-label="Technology stack visualization - use arrow keys to navigate, Enter or Space to filter"
          tabIndex={-1}
          onKeyDown={rovingTabindex.handleKeyDown}
          onFocus={rovingTabindex.handleContainerFocus}
          onBlur={rovingTabindex.handleContainerBlur}
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
            rovingTabindex={rovingTabindex}
          />

          {stacks.map((stack) => {
            // Use selection index for O(1) lookup instead of isStackSelected O(n)
            // Use regular searchParams to show immediate visual feedback on clicks
            // Check BOTH query and filter parameters for selection
            const query = getSearchQuery(searchParams).toLowerCase();
            const filter = getSearchFilter(searchParams).toLowerCase();
            const querySelectedDomain = getSearchDomain(
              query,
              PROJECTS,
            ) as Domain | null;
            const filterSelectedDomain = getSearchDomain(
              filter,
              PROJECTS,
            ) as Domain | null;

            const isInQueryDomain =
              querySelectedDomain !== null &&
              selectionIndex.isStackInDomain(stack.name, querySelectedDomain);
            const isDirectlyNamedByQuery = isExactParamMatch(
              searchParams,
              "query",
              stack.name,
            );

            const isInFilterDomain =
              filterSelectedDomain !== null &&
              selectionIndex.isStackInDomain(stack.name, filterSelectedDomain);
            const isDirectlyNamedByFilter = isExactParamMatch(
              searchParams,
              "filter",
              stack.name,
            );

            const selected =
              isInQueryDomain ||
              isDirectlyNamedByQuery ||
              isInFilterDomain ||
              isDirectlyNamedByFilter;

            const isDirectlyHovered = hoveredStack?.id === stack.id;
            const highlighted =
              isDirectlyHovered ||
              (hoveredDomain !== null && stack.domain === hoveredDomain);

            // Use roving tabindex for keyboard navigation
            const tabIndex = rovingTabindex.getTabIndex(stack.id);

            return (
              <StackNode
                key={stack.id}
                stack={stack}
                dimensions={dimensions}
                sizeFactors={sizeFactors}
                selected={selected}
                highlighted={highlighted}
                isDirectlyHovered={isDirectlyHovered}
                tabIndex={tabIndex}
                nodeRef={(el) => {
                  createStackNodeRefCallback(stack.id)(el);
                  rovingTabindex.registerItemRef(stack.id, el);
                }}
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
