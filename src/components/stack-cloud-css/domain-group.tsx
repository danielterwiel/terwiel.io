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
  domain: Domain;
  stacks: Stack[];
  selectedStacks: Set<string>;
  hoveredStack: Stack | null;
  hoveredDomain: Domain | null;
  onStackMouseEnter: (stack: Stack) => void;
  onStackMouseLeave: () => void;
  rovingTabindex: {
    registerItemRef: (
      id: string,
      element: HTMLElement | SVGGElement | null,
    ) => void;
    getTabIndex: (itemId: string) => number;
    setActiveIndex: (index: number) => void;
  };
  domainIndex: number;
  segmentCount: number;
}

/**
 * Domain group component - displays stacks grouped by domain
 * Uses CSS Flexbox for responsive layout within each domain
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
    <div
      className="domain-group flex flex-col gap-2"
      style={{
        opacity: isDomainHighlighted || !hoveredDomain ? 1 : 0.6,
        transition: a11y.prefersReducedMotion
          ? "none"
          : "opacity 200ms ease-out",
      }}
    >
      {/* Domain header */}
      <div
        className="domain-header flex items-center gap-2 pb-1 border-b"
        style={{
          borderColor: domainColor,
        }}
      >
        <div
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: domainColor }}
          aria-hidden="true"
        />
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-600">
          {domain}
        </span>
        <span className="text-xs text-gray-400">({stacks.length})</span>
      </div>

      {/* Stack items - flexbox wrap layout */}
      <div className="flex flex-wrap gap-2">
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
      </div>
    </div>
  );
}
