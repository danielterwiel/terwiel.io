import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { memo, useTransition } from "react";

import type { Dimensions, Domain } from "~/types";

import { Icon } from "~/components/icon";
import { useAccessibility } from "~/hooks/use-accessibility";
import { getIconHexColor } from "~/utils/icon-colors";
import {
  getSearchFilter,
  getSearchQuery,
  toggleFilterParam,
} from "~/utils/search-params";
import { isExactParamMatchAny } from "~/utils/search-params-match";

interface StackNodeProps {
  stack: {
    id: string;
    name: string;
    iconKey: string;
    color: string;
    domain: Domain;
  };
  dimensions: Dimensions;
  sizeFactors: Map<string, number>;
  selected?: boolean;
  highlighted?: boolean;
  isDirectlyHovered?: boolean;
  nodeRef: (el: SVGGElement | null) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

/**
 * Individual stack node component
 * Displays a technology stack icon with proper sizing based on experience
 * Memoized to prevent unnecessary re-renders when other nodes update
 */
// biome-ignore lint/style/useComponentExportOnlyModules: Component is exported via memo wrapper
const StackNodeComponent = (props: StackNodeProps) => {
  const {
    stack,
    dimensions,
    sizeFactors,
    selected,
    highlighted,
    isDirectlyHovered,
    nodeRef,
    onMouseEnter,
    onMouseLeave,
  } = props;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const IconComponent = Icon[stack.iconKey as keyof typeof Icon];
  const [_isPending, startTransition] = useTransition();

  // Unified accessibility hook
  const a11y = useAccessibility();

  const currentFilter = getSearchFilter(searchParams);
  const currentQuery = getSearchQuery(searchParams);

  // Apply default values
  const isSelected = selected ?? false;
  const isHighlighted = highlighted ?? false;
  const isDirectHovered = isDirectlyHovered ?? false;

  // Get experience-based size factor (0.75-2.5x baseline)
  const sizeFactor = sizeFactors.get(stack.name) ?? 1.0;

  // Apply size factor to both node radius and icon size
  const nodeRadius = dimensions.stackRadius * sizeFactor;
  const iconSize = nodeRadius * 1.4; // 70% of diameter

  // Scale factor for SVG with 24x24 viewBox
  const iconScale = iconSize / 24;

  // Determine state for styling
  const state = isSelected
    ? "selected"
    : isHighlighted
      ? "highlighted"
      : "default";

  // Get colors and styles from accessibility hook
  const borderColor = a11y.getBorderColor(
    stack.domain,
    isSelected || isHighlighted,
  );
  const borderWidth = a11y.getBorderWidth(state);
  const fillColor = a11y.getFillColor();
  const iconStyle = a11y.getIconStyle(stack.domain, state);
  const focusColor = a11y.getFocusColor();

  // CSS drop-shadow for glow effect (much better performance than SVG filters)
  // Balanced glow: subtle for hover, moderate for selected (WCAG 2.2 multi-modal feedback)
  const getDropShadow = () => {
    if (!a11y.shouldShowGlow || state === "default") return "none";

    const color = borderColor;
    if (state === "highlighted") {
      // Subtle glow for hover
      return `drop-shadow(0 0 3px ${color})`;
    }
    // Moderate glow for selected - visible but not overwhelming
    return `drop-shadow(0 0 6px ${color})`;
  };

  // Get icon-specific color for hover override
  const iconSpecificColor = getIconHexColor(stack.iconKey);

  // Check if this stack is exactly matched by query or filter parameter
  const isExactlyMatched = isExactParamMatchAny(searchParams, stack.name);

  // Determine final icon color: use specific color on direct hover OR exact URLSearchParams match
  const finalIconColor =
    isDirectHovered || isExactlyMatched ? iconSpecificColor : iconStyle.color;

  // DEBUG: Log only nodes with filter/query and their color
  if (currentFilter || currentQuery) {
    console.log(
      `[${stack.name}] f="${currentFilter}" q="${currentQuery}" matched=${isExactlyMatched} state=${state} color=${finalIconColor === iconStyle.color ? "default" : "colored"}`,
    );
  }

  const transitionDuration = a11y.getTransitionDuration(200);

  // Handle click to toggle URL filter params
  const handleClick = () => {
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

  // Get CSS classes
  const nodeClasses = `stack-node ${a11y.getStateClasses({ selected: isSelected, highlighted: isHighlighted })}`;
  const circleClasses = `stack-node-circle ${a11y.getStateClasses({ selected: isSelected, highlighted: isHighlighted })}`;
  const iconClasses = `stack-node-icon ${a11y.getStateClasses({ selected: isSelected, highlighted: isHighlighted })}`;
  const focusRingClasses = `stack-node-focus-ring ${a11y.getStateClasses({})}`;

  return (
    // Single group: D3 controls translate, React adds scale to the same transform
    // biome-ignore lint/a11y/useSemanticElements: SVG elements cannot use semantic HTML elements
    <g
      ref={nodeRef}
      className={nodeClasses}
      role="button"
      tabIndex={0}
      aria-label={`${stack.name} technology`}
      aria-pressed={isSelected}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        filter: getDropShadow(),
        transition:
          transitionDuration > 0
            ? `filter ${transitionDuration}ms ease-in-out`
            : "none",
      }}
    >
      {/* Main node circle */}
      <circle
        className={circleClasses}
        r={nodeRadius}
        fill={fillColor}
        stroke={borderColor}
        strokeWidth={borderWidth}
        shapeRendering="geometricPrecision"
      />

      {/* Inner fill for selected state - subtle background tint for multi-modal feedback */}
      {isSelected && a11y.shouldShowSelectionIndicator && (
        <circle
          r={nodeRadius * 0.88}
          fill={borderColor}
          opacity={0.15}
          style={{ pointerEvents: "none" }}
        />
      )}

      {/* Focus ring - visible only on keyboard focus */}
      <circle
        className={focusRingClasses}
        r={nodeRadius + 4}
        fill="none"
        stroke={focusColor}
        strokeWidth={3}
      />

      {/* Icon */}
      {IconComponent && (
        <g
          className={iconClasses}
          transform={`translate(${-iconSize / 2},${-iconSize / 2}) scale(${iconScale})`}
          style={{
            color: finalIconColor,
            transition:
              transitionDuration > 0
                ? `color ${transitionDuration}ms ease-in-out`
                : "none",
          }}
          opacity={iconStyle.opacity}
        >
          <IconComponent width={24} height={24} viewBox="0 0 24 24" />
        </g>
      )}
    </g>
  );
};

// Memoize with custom comparison to prevent re-renders when unrelated stacks change
export const StackNode = memo(StackNodeComponent, (prevProps, nextProps) => {
  // Only re-render if props that affect this specific node have changed
  return (
    prevProps.stack.id === nextProps.stack.id &&
    prevProps.selected === nextProps.selected &&
    prevProps.highlighted === nextProps.highlighted &&
    prevProps.isDirectlyHovered === nextProps.isDirectlyHovered &&
    prevProps.dimensions.stackRadius === nextProps.dimensions.stackRadius &&
    prevProps.dimensions.width === nextProps.dimensions.width &&
    prevProps.dimensions.height === nextProps.dimensions.height &&
    prevProps.sizeFactors.get(prevProps.stack.name) ===
      nextProps.sizeFactors.get(nextProps.stack.name)
  );
});
