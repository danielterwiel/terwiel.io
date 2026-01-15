"use client";

import { useSearchParams } from "next/navigation";

import { useCallback, useMemo, useRef, useState } from "react";

import type { Domain } from "~/types";

import { PROJECTS } from "~/data/projects";
import { useRovingTabindex } from "~/hooks/use-roving-tabindex";
import { calculateDomainExperiences } from "~/utils/calculate-domain-size";
import { extractUniqueStacks } from "~/utils/extract-stacks";
import {
  getInitialSelectedDomain,
  getInitialSelectedStack,
} from "~/utils/get-initial-selection";
import {
  getSearchDomain,
  getSearchFilter,
  getSearchQuery,
} from "~/utils/search-params";
import { isExactParamMatch } from "~/utils/search-params-match";
import { buildSelectionIndex } from "~/utils/selection-index";
import { DomainGroup } from "./domain-group";
import { RootNode } from "./root-node";

/**
 * StackCloudContent - CSS Grid-based Stack Visualization
 *
 * ## Design Overview (VIZ-001)
 *
 * This component replaces the D3.js force-directed graph with a pure CSS solution.
 * It uses a hybrid CSS Grid + Flexbox approach for responsive layout.
 *
 * ## Visual Layout Structure
 *
 * ```
 * ┌─────────────────────────────────────────────────┐
 * │                   RootNode                       │
 * │              (SVG Pie Chart)                     │
 * │           ┌─────────────────┐                   │
 * │           │    ╭─────╮      │                   │
 * │           │   ╱ Back- ╲     │ ← Domain segments │
 * │           │  │  end    │    │   (clickable)     │
 * │           │   ╲ Front-╱     │                   │
 * │           │    ╰─────╯      │                   │
 * │           └─────────────────┘                   │
 * │              [Domain: X%]    ← Live label       │
 * └─────────────────────────────────────────────────┘
 *
 * ┌─────────────────────────────────────────────────┐
 * │            CSS Grid Container                    │
 * │    grid-template-columns: auto-fit minmax(140px)│
 * │                                                 │
 * │  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
 * │  │Front-end │  │ Back-end │  │  DevOps  │      │
 * │  │ ─────────│  │ ─────────│  │ ─────────│      │
 * │  │[■][■][■] │  │[■][■][■] │  │[■][■]    │      │
 * │  │[■][■]    │  │[■]       │  │          │      │
 * │  └──────────┘  └──────────┘  └──────────┘      │
 * │                                                 │
 * │  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
 * │  │  Design  │  │    QA    │  │    AI    │      │
 * │  │ ─────────│  │ ─────────│  │ ─────────│      │
 * │  │[■][■]    │  │[■]       │  │[■][■]    │      │
 * │  └──────────┘  └──────────┘  └──────────┘      │
 * └─────────────────────────────────────────────────┘
 * ```
 *
 * ## Layout Approach: CSS Grid + Flexbox Hybrid
 *
 * - **Outer container**: CSS Grid with `auto-fit` for responsive columns
 *   - `grid-template-columns: repeat(auto-fit, minmax(140px, 1fr))`
 *   - Automatically adjusts columns based on viewport width
 *   - 140px minimum ensures readable domain groups
 *
 * - **Domain groups**: Flexbox column layout
 *   - Header with domain color indicator
 *   - Stack items wrap naturally with `flex-wrap`
 *
 * - **Stack items**: 44x44px minimum (WCAG 2.2 touch targets)
 *   - Flexbox for internal icon centering
 *
 * ## Visual Hierarchy
 *
 * 1. **Domain level**: Color-coded borders and headers
 *    - Each domain has a distinct color from DOMAIN_COLORS_HEX
 *    - Domain header shows: [●] DOMAIN_NAME (count)
 *
 * 2. **Stack level**: Icon buttons within domain groups
 *    - Organized by domain grouping
 *    - Hierarchical parent-child relationships indicated by:
 *      - Shared domain grouping
 *      - Parent field in data structure (for filtering)
 *
 * ## Color Scheme
 *
 * Uses OKLCH color palette from ~/constants/colors:
 * - Klein blue (#002FA7): Primary accent, borders, focus rings
 * - Domain colors: Front-end (blue), Back-end (green), Design (pink),
 *                  DevOps (orange), QA (purple), AI (cyan)
 *
 * ## Animation Strategy (CSS-only, respects prefers-reduced-motion)
 *
 * | State    | Property           | Duration | Easing                          |
 * |----------|--------------------| ---------|--------------------------------|
 * | Hover    | transform: scale   | 200ms    | cubic-bezier(0.25, 1.65, 0.65, 1) |
 * | Focus    | ring-2, ring-offset| instant  | none (immediate feedback)       |
 * | Selected | border, background | 200ms    | ease-out                        |
 * | Opacity  | opacity            | 200ms    | ease-out                        |
 *
 * All animations disabled when `prefers-reduced-motion: reduce` is set.
 *
 * ## Interaction Pattern
 *
 * - **Click/tap**: Toggle filter (uses router.replace, no history entry)
 * - **Hover**: Highlight stack item, show tooltip
 * - **Focus**: Visible focus ring, keyboard navigation
 * - **Keyboard**: Arrow keys for roving tabindex, Enter/Space to activate
 *
 * ## Responsive Breakpoints
 *
 * - Mobile (320-768px): 2-3 columns, compact gaps
 * - Tablet (768-1024px): 3-4 columns
 * - Desktop (1024px+): 4-6 columns, sidebar layout
 *
 * @see PRD.md VIZ-001 for full acceptance criteria
 */
export function StackCloudContent() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();

  // Extract stacks and group by domain
  const stacks = useMemo(() => extractUniqueStacks(PROJECTS), []);

  // Calculate domain experiences for the root node pie chart
  const domainExperiences = useMemo(
    () => calculateDomainExperiences(PROJECTS),
    [],
  );

  // Build selection index once for O(1) stack selection checks
  const selectionIndex = useMemo(() => {
    return buildSelectionIndex(PROJECTS);
  }, []);

  // Group stacks by domain for CSS Grid layout
  const stacksByDomain = useMemo(() => {
    const grouped = new Map<Domain, typeof stacks>();
    for (const stack of stacks) {
      const domainStacks = grouped.get(stack.domain) ?? [];
      domainStacks.push(stack);
      grouped.set(stack.domain, domainStacks);
    }
    return grouped;
  }, [stacks]);

  // Hover state management
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

  // Calculate selected stacks based on URL parameters
  const selectedStacks = useMemo(() => {
    const selected = new Set<string>();
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

      if (
        isInQueryDomain ||
        isDirectlyNamedByQuery ||
        isInFilterDomain ||
        isDirectlyNamedByFilter
      ) {
        selected.add(stack.id);
      }
    }
    return selected;
  }, [stacks, searchParams, selectionIndex]);

  // Memoize callback for setting hovered domain
  const handleSetHoveredDomain = useCallback((domain: Domain | null) => {
    setHoveredDomain(domain);
  }, []);

  // Create stack mouse enter callback
  const handleStackMouseEnter = useCallback(
    (stack: {
      id: string;
      name: string;
      iconKey: string;
      color: string;
      domain: Domain;
    }) => {
      setHoveredStack(stack);
      setHoveredDomain(null);
    },
    [],
  );

  // Create stack mouse leave callback
  const handleStackMouseLeave = useCallback(() => {
    // Clear hover state on mouse leave
    // The selected state will be shown from URL params
    setHoveredStack(null);
  }, []);

  // Build navigation items for roving tabindex
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
    initialIndex: 0,
    loop: true,
    direction: "both",
    onActiveIndexChange: (index) => {
      const item = allNavigableItems[index];
      if (!item) return;

      if (item.type === "segment") {
        setHoveredDomain(item.domain as Domain);
        setHoveredStack(null);
      } else {
        setHoveredStack(item);
        setHoveredDomain(null);
      }
    },
  });

  // Determine domains order based on experience
  const domainsOrdered = useMemo(
    () => domainExperiences.map((exp) => exp.domain),
    [domainExperiences],
  );

  return (
    // biome-ignore lint/a11y/useSemanticElements: div with role="group" is semantically appropriate for this visualization container
    <div
      ref={wrapperRef}
      className="stack-cloud-wrapper w-full"
      role="group"
      aria-label="Technology stack visualization - use arrow keys to navigate, Enter or Space to filter"
      onKeyDown={rovingTabindex.handleKeyDown}
    >
      {/* CSS Grid Layout for Stack Visualization */}
      <div className="flex flex-col items-center gap-6 md:gap-8 px-4 md:px-6">
        {/* Root Node with Domain Pie Chart */}
        <RootNode
          domainExperiences={domainExperiences}
          hoveredDomain={hoveredDomain}
          hoveredStack={hoveredStack}
          onDomainHover={handleSetHoveredDomain}
          rovingTabindex={rovingTabindex}
        />

        {/* Domain Groups - CSS Grid Layout */}
        <div
          className="w-full grid gap-4 md:gap-6"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          }}
        >
          {domainsOrdered.map((domain, domainIndex) => {
            const domainStacks = stacksByDomain.get(domain) ?? [];
            if (domainStacks.length === 0) return null;

            return (
              <DomainGroup
                key={domain}
                domain={domain}
                stacks={domainStacks}
                selectedStacks={selectedStacks}
                hoveredStack={hoveredStack}
                hoveredDomain={hoveredDomain}
                onStackMouseEnter={handleStackMouseEnter}
                onStackMouseLeave={handleStackMouseLeave}
                rovingTabindex={rovingTabindex}
                domainIndex={domainIndex}
                segmentCount={domainExperiences.length}
              />
            );
          })}
        </div>
      </div>

      <style jsx>{`
        /* Respect reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .stack-cloud-wrapper * {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </div>
  );
}
