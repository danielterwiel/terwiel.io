import { usePathname, useRouter, useSearchParams } from "next/navigation";

import type { Dimensions, Domain } from "~/types";

import { Icon } from "~/components/icon";
import { STACK_SELECTION_SCALE } from "~/constants/stack-selection-scale";
import { useAccessibility } from "~/hooks/use-accessibility";
import { getIconHexColor } from "~/utils/icon-colors";
import { getSearchQuery, toggleSearchParam } from "~/utils/search-params";

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
 */
export function StackNode({
  stack,
  dimensions,
  sizeFactors,
  selected = false,
  highlighted = false,
  isDirectlyHovered = false,
  nodeRef,
  onMouseEnter,
  onMouseLeave,
}: StackNodeProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const IconComponent = Icon[stack.iconKey as keyof typeof Icon];

  // Unified accessibility hook
  const a11y = useAccessibility();

  const currentSearchQuery = getSearchQuery(searchParams);

  // Get experience-based size factor (0.75-2.5x baseline)
  const sizeFactor = sizeFactors.get(stack.name) ?? 1.0;

  // Apply size factor to both node radius and icon size
  const nodeRadius = dimensions.stackRadius * sizeFactor;
  const iconSize = nodeRadius * 1.4; // 70% of diameter

  // Scale factor for SVG with 24x24 viewBox
  const iconScale = iconSize / 24;

  // Grow when selected (applied via transform scale)
  const groupScale = selected ? STACK_SELECTION_SCALE : 1;

  // Determine state for styling
  const state = selected ? "selected" : highlighted ? "highlighted" : "default";

  // Get colors and styles from accessibility hook
  const borderColor = a11y.getBorderColor(
    stack.domain,
    selected || highlighted,
  );
  const borderWidth = a11y.getBorderWidth(state);
  const fillColor = a11y.getFillColor();
  const iconStyle = a11y.getIconStyle(stack.domain, state);
  const focusColor = a11y.getFocusColor();

  // CSS drop-shadow for glow effect (much better performance than SVG filters)
  // Highlighted: subtle glow (2px blur), Selected: stronger glow (4px blur)
  const getDropShadow = () => {
    if (!a11y.shouldShowGlow || state === "default") return "none";

    const color = borderColor;
    if (state === "highlighted") {
      // Subtle glow for hover
      return `drop-shadow(0 0 2px ${color})`;
    }
    // Stronger glow for selected (2x the highlighted)
    return `drop-shadow(0 0 4px ${color}) drop-shadow(0 0 2px ${color})`;
  };

  // Get icon-specific color for hover override
  const iconSpecificColor = getIconHexColor(stack.iconKey);

  // Determine final icon color: use specific color ONLY on direct hover (not on selection or domain highlight)
  const finalIconColor = isDirectlyHovered
    ? iconSpecificColor
    : iconStyle.color;

  // Transition duration respecting accessibility preferences
  const transitionDuration = a11y.getTransitionDuration(300);

  // Handle click to toggle URL search params
  const handleClick = () => {
    const queryString = toggleSearchParam(currentSearchQuery, stack.name);
    router.push(`${pathname}${queryString}`);
  };

  // Handle keyboard interaction
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleClick();
    }
  };

  // Get CSS classes
  const nodeClasses = `stack-node ${a11y.getStateClasses({ selected, highlighted })}`;
  const circleClasses = `stack-node-circle ${a11y.getStateClasses({ selected, highlighted })}`;
  const iconClasses = `stack-node-icon ${a11y.getStateClasses({ selected, highlighted })}`;
  const focusRingClasses = `stack-node-focus-ring ${a11y.getStateClasses({})}`;

  return (
    // Outer group: controlled by D3 for positioning (translate)
    <g ref={nodeRef}>
      {/* Inner group: controlled by React for scaling */}
      {/* biome-ignore lint/a11y/useSemanticElements: SVG elements cannot use semantic HTML elements */}
      <g
        className={nodeClasses}
        transform={`scale(${groupScale})`}
        role="button"
        tabIndex={0}
        aria-label={`${stack.name} technology`}
        aria-pressed={selected}
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

        {/* Inner fill for selected state - subtle glow effect */}
        {selected && a11y.shouldShowSelectionIndicator && (
          <circle
            r={nodeRadius * 0.85}
            fill={borderColor}
            opacity={0.08}
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
    </g>
  );
}
