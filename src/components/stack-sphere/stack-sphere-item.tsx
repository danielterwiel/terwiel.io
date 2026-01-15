"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { forwardRef, memo, useTransition } from "react";

import type { Domain } from "~/types";

import type { SpherePosition } from "./use-sphere-positions";
import { Icon } from "~/components/icon";
import { useAccessibility } from "~/hooks/use-accessibility";
import { getIconHexColor } from "~/utils/icon-colors";
import { getSearchFilter, toggleFilterParam } from "~/utils/search-params";
import { isExactParamMatchAny } from "~/utils/search-params-match";

/** Round to 2 decimal places to prevent hydration mismatches from floating-point variance */
const round = (value: number): number => Math.round(value * 100) / 100;

interface StackSphereItemProps {
  stack: {
    id: string;
    name: string;
    iconKey: string;
    color: string;
    domain: Domain;
  };
  position: SpherePosition;
  sizeFactor: number;
  baseRadius: number;
  experience?: { years: number; months: number };
  selected?: boolean;
  highlighted?: boolean;
  isDirectlyHovered?: boolean;
  tabIndex?: number;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onFocus?: () => void;
  onKeyDown?: (event: React.KeyboardEvent) => void;
}

/**
 * Individual item on the sphere surface
 * Positioned using CSS 3D transforms (rotateY, rotateX, translateZ)
 * Memoized to prevent unnecessary re-renders
 * Uses forwardRef for roving tabindex focus management
 */
const StackSphereItemComponent = forwardRef<
  HTMLButtonElement,
  StackSphereItemProps
>(function StackSphereItemComponent(props, ref) {
  const {
    stack,
    position,
    sizeFactor,
    baseRadius,
    experience,
    selected = false,
    highlighted = false,
    isDirectlyHovered = false,
    tabIndex = 0,
    onMouseEnter,
    onMouseLeave,
    onFocus,
    onKeyDown: externalKeyDown,
  } = props;

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const a11y = useAccessibility();

  const IconComponent = Icon[stack.iconKey as keyof typeof Icon];
  const currentFilter = getSearchFilter(searchParams);

  // Calculate item size based on sizeFactor (rounded to prevent hydration mismatch)
  const itemSize = round(baseRadius * sizeFactor * 2);
  // Base icon size - will be scaled proportionally via CSS transform
  // This avoids SVG viewBox issues where icons without viewBox don't scale with width/height
  const baseIconSize = 24;
  const iconScale = round((itemSize * 0.7) / baseIconSize);

  // Determine state for styling
  const state = selected ? "selected" : highlighted ? "highlighted" : "default";

  // Get accessibility-aware styles
  const borderColor = a11y.getBorderColor(
    stack.domain,
    selected || highlighted,
  );
  const borderWidth = a11y.getBorderWidth(state);
  const fillColor = a11y.getFillColor();
  const iconStyle = a11y.getIconStyle(stack.domain, state);
  const focusColor = a11y.getFocusColor();

  // Get icon-specific color for hover/selected override
  const iconSpecificColor = getIconHexColor(stack.iconKey);
  const isExactlyMatched = isExactParamMatchAny(searchParams, stack.name);
  const finalIconColor =
    isDirectlyHovered || isExactlyMatched ? iconSpecificColor : iconStyle.color;

  const transitionDuration = a11y.getTransitionDuration(200);

  // Glow effect for hover/selected states
  const getDropShadow = () => {
    if (!a11y.shouldShowGlow || state === "default") return "none";
    if (state === "highlighted") {
      return `drop-shadow(0 0 2px ${borderColor})`;
    }
    return `drop-shadow(0 0 4px ${borderColor})`;
  };

  // Handle click to toggle URL filter
  const handleClick = () => {
    onMouseEnter?.(); // Preserve hover state during click
    const queryString = toggleFilterParam(currentFilter, stack.name);
    startTransition(() => {
      router.push(`${pathname}${queryString}`, { scroll: false });
    });
  };

  // Handle keyboard interaction
  const handleKeyDown = (event: React.KeyboardEvent) => {
    // Enter/Space selects the item
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleClick();
      return;
    }
    // Pass arrow keys to parent for roving tabindex navigation
    externalKeyDown?.(event);
  };

  // Opacity based on z-depth (items at back are slightly faded, rounded for hydration)
  const depthOpacity = round(0.6 + (1 - position.depth) * 0.4);

  return (
    <button
      ref={ref}
      type="button"
      className={`stack-sphere-item ${a11y.getStateClasses({ selected, highlighted })}`}
      tabIndex={tabIndex}
      aria-label={`${stack.name} technology`}
      aria-pressed={selected}
      data-selected={selected}
      data-highlighted={highlighted}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onFocus={onFocus}
      style={{
        // 3D positioning on sphere surface
        transform: `${position.transform} translate(-50%, -50%)`,
        width: itemSize,
        height: itemSize,
        // Depth-based styling
        opacity: depthOpacity,
        filter: getDropShadow(),
        // Focus ring color
        ["--focus-color" as string]: focusColor,
        // GPU hints and transitions
        willChange: selected || highlighted ? "transform, filter" : "auto",
        transition:
          transitionDuration > 0
            ? `filter ${transitionDuration}ms ease-in-out, opacity ${transitionDuration}ms ease-in-out`
            : "none",
      }}
    >
      {/* Circle background - decorative SVG, label provided by button */}
      <svg
        aria-hidden="true"
        width={itemSize}
        height={itemSize}
        viewBox={`0 0 ${itemSize} ${itemSize}`}
        style={{ position: "absolute", inset: 0 }}
      >
        <circle
          cx={itemSize / 2}
          cy={itemSize / 2}
          r={itemSize / 2 - borderWidth / 2}
          fill={fillColor}
          stroke={borderColor}
          strokeWidth={borderWidth}
        />
        {/* Selection indicator - subtle background tint */}
        {selected && a11y.shouldShowSelectionIndicator && (
          <circle
            cx={itemSize / 2}
            cy={itemSize / 2}
            r={round((itemSize / 2) * 0.88)}
            fill={borderColor}
            opacity={0.15}
          />
        )}
      </svg>

      {/* Icon - centered via flexbox on parent, scaled via CSS transform */}
      {IconComponent && (
        <IconComponent
          width={baseIconSize}
          height={baseIconSize}
          style={{
            color: finalIconColor,
            opacity: iconStyle.opacity,
            // Scale icon proportionally to container size
            // Using transform avoids SVG viewBox issues
            transform: `scale(${iconScale})`,
            transition:
              transitionDuration > 0
                ? `color ${transitionDuration}ms ease-in-out, transform ${transitionDuration}ms ease-in-out`
                : "none",
          }}
        />
      )}

      {/* Experience tooltip - shown on hover */}
      {isDirectlyHovered && experience && (
        <span
          className="stack-sphere-item-tooltip"
          aria-hidden="true"
          style={{
            position: "absolute",
            bottom: "-1.5rem",
            left: "50%",
            transform: "translateX(-50%)",
            whiteSpace: "nowrap",
            fontSize: "0.75rem",
            fontWeight: 500,
            color: borderColor,
            pointerEvents: "none",
          }}
        >
          {experience.years > 0 && `${experience.years}y`}
          {experience.years > 0 && experience.months > 0 && " "}
          {experience.months > 0 && `${experience.months}m`}
          {experience.years === 0 && experience.months === 0 && "< 1m"}
        </span>
      )}
    </button>
  );
});

// Memoize with custom comparison to prevent re-renders
export const StackSphereItem = memo(StackSphereItemComponent);
