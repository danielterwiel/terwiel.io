"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { memo, useTransition } from "react";

import type { Domain } from "~/types";

import { useAccessibility } from "~/hooks/use-accessibility";
import { getSearchFilter, toggleFilterParam } from "~/utils/search-params";

interface StackSphereSegmentProps {
  domain: Domain;
  position: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
    transform?: string;
  };
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

/**
 * Domain segment indicator around the sphere perimeter
 * Clickable to filter by domain, hoverable to highlight related items
 */
function StackSphereSegmentComponent({
  domain,
  position,
  onMouseEnter,
  onMouseLeave,
}: StackSphereSegmentProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const a11y = useAccessibility();

  const currentFilter = getSearchFilter(searchParams);
  const isSelected = currentFilter === domain;

  const borderColor = a11y.getBorderColor(domain, isSelected);
  const transitionDuration = a11y.getTransitionDuration(150);

  const handleClick = () => {
    const queryString = toggleFilterParam(currentFilter, domain);
    startTransition(() => {
      router.push(`${pathname}${queryString}`, { scroll: false });
    });
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleClick();
    }
  };

  return (
    <button
      type="button"
      className="stack-sphere-segment"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      aria-label={`Filter by ${domain}`}
      aria-pressed={isSelected}
      data-selected={isSelected}
      style={{
        position: "absolute",
        ...position,
        padding: "4px 10px",
        fontSize: "11px",
        fontWeight: 500,
        color: isSelected ? borderColor : "var(--text-muted, #666)",
        backgroundColor: isSelected
          ? `color-mix(in srgb, ${borderColor} 15%, transparent)`
          : "transparent",
        border: `1px solid ${isSelected ? borderColor : "var(--border-subtle, #333)"}`,
        borderRadius: "12px",
        cursor: "pointer",
        whiteSpace: "nowrap",
        transition:
          transitionDuration > 0
            ? `color ${transitionDuration}ms, background-color ${transitionDuration}ms, border-color ${transitionDuration}ms`
            : "none",
        zIndex: 10,
      }}
    >
      {domain}
    </button>
  );
}

export const StackSphereSegment = memo(StackSphereSegmentComponent);
