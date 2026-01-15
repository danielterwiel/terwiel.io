"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { memo, useTransition } from "react";

import type { Domain } from "~/types";

import type { SpherePosition } from "./use-sphere-positions";
import { Icon } from "~/components/icon";
import { useAccessibility } from "~/hooks/use-accessibility";
import { getIconHexColor } from "~/utils/icon-colors";
import { getSearchFilter, toggleFilterParam } from "~/utils/search-params";
import { isExactParamMatchAny } from "~/utils/search-params-match";

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
  selected?: boolean;
  highlighted?: boolean;
  isDirectlyHovered?: boolean;
  tabIndex?: number;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onFocus?: () => void;
}

/**
 * Individual item on the sphere surface
 * Positioned using CSS 3D transforms (rotateY, rotateX, translateZ)
 * Memoized to prevent unnecessary re-renders
 */
// biome-ignore lint/style/useComponentExportOnlyModules: Component is exported via memo wrapper
function StackSphereItemComponent(props: StackSphereItemProps) {
  const {
    stack,
    position,
    sizeFactor,
    baseRadius,
    selected = false,
    highlighted = false,
    isDirectlyHovered = false,
    tabIndex = 0,
    onMouseEnter,
    onMouseLeave,
    onFocus,
  } = props;

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const a11y = useAccessibility();

  const IconComponent = Icon[stack.iconKey as keyof typeof Icon];
  const currentFilter = getSearchFilter(searchParams);

  // Calculate item size based on sizeFactor
  const itemSize = baseRadius * sizeFactor * 2;
  const iconSize = itemSize * 0.7;

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
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleClick();
    }
  };

  // Opacity based on z-depth (items at back are slightly faded)
  const depthOpacity = 0.6 + (1 - position.depth) * 0.4;

  return (
    <button
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
            r={(itemSize / 2) * 0.88}
            fill={borderColor}
            opacity={0.15}
          />
        )}
      </svg>

      {/* Icon */}
      {IconComponent && (
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            width: iconSize,
            height: iconSize,
            color: finalIconColor,
            opacity: iconStyle.opacity,
            transition:
              transitionDuration > 0
                ? `color ${transitionDuration}ms ease-in-out`
                : "none",
          }}
        >
          <IconComponent width={iconSize} height={iconSize} />
        </div>
      )}
    </button>
  );
}

// Memoize with custom comparison to prevent re-renders
export const StackSphereItem = memo(
  StackSphereItemComponent,
  (prevProps, nextProps) => {
    return (
      prevProps.stack.id === nextProps.stack.id &&
      prevProps.selected === nextProps.selected &&
      prevProps.highlighted === nextProps.highlighted &&
      prevProps.isDirectlyHovered === nextProps.isDirectlyHovered &&
      prevProps.tabIndex === nextProps.tabIndex &&
      prevProps.sizeFactor === nextProps.sizeFactor &&
      prevProps.baseRadius === nextProps.baseRadius &&
      prevProps.position.transform === nextProps.position.transform
    );
  },
);
