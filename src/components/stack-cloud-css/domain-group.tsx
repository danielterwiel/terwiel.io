"use client";

import type { Domain } from "~/types";

import { DOMAIN_COLORS_HEX } from "~/constants/colors";
import { useAccessibility } from "~/hooks/use-accessibility";
import { StackItem } from "./stack-item";

interface Stack {
  id: string;
  name: string;
  iconKey: string;
  color: string;
  domain: Domain;
}

interface DomainGroupProps {
  /** The domain category (Front-end, Back-end, etc.) */
  domain: Domain;
  /** Array of stack technologies in this domain */
  stacks: Stack[];
  /** Set of currently selected stack IDs (from URL params) */
  selectedStacks: Set<string>;
  /** Currently hovered stack item, if any */
  hoveredStack: Stack | null;
  /** Currently hovered domain segment, if any */
  hoveredDomain: Domain | null;
  /** Callback when mouse enters a stack item */
  onStackMouseEnter: (stack: Stack) => void;
  /** Callback when mouse leaves a stack item */
  onStackMouseLeave: () => void;
  /** Roving tabindex controller for keyboard navigation */
  rovingTabindex: {
    registerItemRef: (
      id: string,
      element: HTMLElement | SVGGElement | null,
    ) => void;
    getTabIndex: (itemId: string) => number;
    setActiveIndex: (index: number) => void;
  };
  /** Index of this domain in the ordered domain list */
  domainIndex: number;
  /** Total number of pie chart segments (for tabindex calculation) */
  segmentCount: number;
}

/**
 * DomainGroup - Container for stacks within a single domain
 *
 * ## Visual Structure
 *
 * ```
 * ┌────────────────────────────────────┐
 * │ [●] FRONT-END (12)                 │ ← Header with color indicator
 * │ ──────────────────────────────────│ ← Border in domain color
 * │ [■][■][■][■][■][■]                │ ← Stack items (flex-wrap)
 * │ [■][■][■][■][■][■]                │
 * └────────────────────────────────────┘
 * ```
 *
 * ## CSS Layout
 *
 * - **Container**: `flex flex-col gap-2`
 * - **Header**: `flex items-center gap-2` with border-bottom
 * - **Items**: `flex flex-wrap gap-2` for automatic wrapping
 *
 * ## Accessibility
 *
 * - Domain groups are visually distinct via color-coded borders
 * - Opacity dims non-hovered domains (0.6 opacity) for focus guidance
 * - Respects prefers-reduced-motion for opacity transitions
 *
 * @see stack-cloud-content.tsx for parent layout documentation
 */
export function DomainGroup({
  domain,
  stacks,
  selectedStacks,
  hoveredStack,
  hoveredDomain,
  onStackMouseEnter,
  onStackMouseLeave,
  rovingTabindex,
  domainIndex,
  segmentCount,
}: DomainGroupProps) {
  const a11y = useAccessibility();
  const domainColor = DOMAIN_COLORS_HEX[domain];
  const isDomainHovered = hoveredDomain === domain;
  const isDomainHighlighted =
    isDomainHovered || hoveredStack?.domain === domain;

  return (
    <section
      className="domain-group flex flex-col gap-2"
      aria-label={`${domain} technologies - ${stacks.length} items`}
      style={{
        opacity: isDomainHighlighted || !hoveredDomain ? 1 : 0.6,
        transition: a11y.prefersReducedMotion
          ? "none"
          : "opacity 200ms ease-out",
      }}
    >
      {/* Domain header with color indicator */}
      <header
        className="domain-header flex items-center gap-2 pb-1 border-b"
        style={{
          borderColor: domainColor,
        }}
      >
        <div
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ backgroundColor: domainColor }}
          aria-hidden="true"
        />
        <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-600">
          {domain}
        </h3>
        <span className="text-xs text-gray-400" aria-hidden="true">
          ({stacks.length})
        </span>
      </header>

      {/* Stack items - semantic list for accessibility */}
      <ul className="flex flex-wrap gap-2 list-none m-0 p-0">
        {stacks.map((stack, stackIndex) => {
          const isSelected = selectedStacks.has(stack.id);
          const isDirectlyHovered = hoveredStack?.id === stack.id;
          const isHighlighted = isDirectlyHovered || isDomainHovered;

          // Calculate global index for roving tabindex (segments + stacks)
          const globalIndex = segmentCount + domainIndex * 100 + stackIndex;

          return (
            <StackItem
              key={stack.id}
              stack={stack}
              selected={isSelected}
              highlighted={isHighlighted}
              isDirectlyHovered={isDirectlyHovered}
              tabIndex={rovingTabindex.getTabIndex(stack.id)}
              onMouseEnter={() => onStackMouseEnter(stack)}
              onMouseLeave={onStackMouseLeave}
              onFocus={() => rovingTabindex.setActiveIndex(globalIndex)}
              ref={(el) => rovingTabindex.registerItemRef(stack.id, el)}
            />
          );
        })}
      </ul>
    </section>
  );
}
