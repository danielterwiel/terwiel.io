"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { forwardRef, useTransition } from "react";

import type { Domain } from "~/types";

import { Icon } from "~/components/icon";
import { DOMAIN_COLORS_HEX, FOCUS_COLOR_HEX } from "~/constants/colors";
import { useAccessibility } from "~/hooks/use-accessibility";
import { getIconHexColor } from "~/utils/icon-colors";
import { getSearchFilter, toggleFilterParam } from "~/utils/search-params";

interface Stack {
  id: string;
  name: string;
  iconKey: string;
  color: string;
  domain: Domain;
}

interface StackItemProps {
  stack: Stack;
  selected: boolean;
  highlighted: boolean;
  isDirectlyHovered: boolean;
  tabIndex: number;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onFocus: () => void;
}

/**
 * StackItem - Interactive technology button
 *
 * ## Visual States
 *
 * ```
 * Default:    [   ■   ]     Gray border, muted icon (70% opacity)
 * Hover:      [   ■   ]     Scale 1.05, domain border visible, 100% opacity
 * Active:     [   ■   ]     Scale 0.95 (pressed feedback), translate3d for GPU
 * Selected:   [  ■    ]     Domain border, 15% background tint, 100% opacity
 * Focus:      [┌──■──┐]     Ring-2 focus indicator (FOCUS_COLOR_HEX)
 *             [└─────┘]
 * ```
 *
 * ## Touch Target (WCAG 2.2 SC 2.5.8)
 *
 * Minimum 44x44px touch target achieved via:
 * - `min-w-[44px] min-h-[44px]` on button element
 * - `p-2` padding around 24x24px icon
 *
 * ## Animation Properties (GPU-accelerated)
 *
 * All animations use transform and opacity only for 60fps performance.
 * GPU acceleration via translate3d(0,0,0) in transform chain.
 *
 * | Property         | Duration | Easing                            | Layer  |
 * |------------------|----------|-----------------------------------|--------|
 * | transform: scale | 200ms    | cubic-bezier(0.25, 1.65, 0.65, 1) | GPU    |
 * | border-color     | 200ms    | cubic-bezier(0.4, 0, 0.2, 1)      | Paint  |
 * | background-color | 200ms    | cubic-bezier(0.4, 0, 0.2, 1)      | Paint  |
 * | color (icon)     | 200ms    | cubic-bezier(0.4, 0, 0.2, 1)      | Paint  |
 * | opacity          | 200ms    | cubic-bezier(0.4, 0, 0.2, 1)      | GPU    |
 *
 * ## Reduced Motion
 *
 * When `prefers-reduced-motion: reduce`:
 * - All transitions set to `none` (instant state changes)
 * - Checked via useAccessibility() hook for JS
 * - CSS `.stack-item` class has `@media (prefers-reduced-motion: reduce)` fallback
 *
 * ## Interaction
 *
 * - **Click**: Toggles filter via router.replace() (no history entry)
 * - **Enter/Space**: Same as click (keyboard activation)
 * - **Tab**: Roving tabindex within visualization
 * - **Hover**: Shows tooltip below button (hover-hover media query)
 *
 * @see stack-cloud-content.tsx for full visualization documentation
 */
export const StackItem = forwardRef<HTMLButtonElement, StackItemProps>(
  function StackItem(
    {
      stack,
      selected,
      highlighted,
      isDirectlyHovered,
      tabIndex,
      onMouseEnter,
      onMouseLeave,
      onFocus,
    },
    ref,
  ) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [_isPending, startTransition] = useTransition();

    const a11y = useAccessibility();
    const currentFilter = getSearchFilter(searchParams);

    const IconComponent = Icon[stack.iconKey as keyof typeof Icon];
    const domainColor = DOMAIN_COLORS_HEX[stack.domain];
    const iconColor = getIconHexColor(stack.iconKey);

    // Handle click to toggle URL filter params
    const handleClick = () => {
      const queryString = toggleFilterParam(currentFilter, stack.name);
      startTransition(() => {
        router.replace(`${pathname}${queryString}`, { scroll: false });
      });
    };

    // Handle keyboard interaction
    const handleKeyDown = (event: React.KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handleClick();
      }
    };

    // Determine visual state
    const isActive = selected || highlighted;
    const showIconColor = isDirectlyHovered || selected;

    // Build class names based on state
    // Note: transform animations handled by CSS .stack-item class for GPU acceleration
    const buttonClasses = [
      "stack-item",
      "magnetic-base",
      "magnetic-rounded-lg",
      "group",
      "relative",
      "flex",
      "items-center",
      "justify-center",
      "min-w-[44px]",
      "min-h-[44px]",
      "p-2",
      "rounded-lg",
      "border-2",
      "outline-none",
      "focus-visible:ring-2",
      "focus-visible:ring-offset-2",
      // Add highlighted class for CSS to target
      isActive && "stack-item-highlighted",
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <li className="list-none">
        <button
          ref={ref}
          type="button"
          className={buttonClasses}
          style={{
            // Focus ring uses FOCUS_COLOR_HEX for WCAG 3:1 contrast ratio
            // @ts-expect-error - CSS custom property for focus ring color
            "--tw-ring-color": FOCUS_COLOR_HEX,
            // Border and background use domain colors (can't be in CSS without custom properties)
            borderColor: isActive ? domainColor : "transparent",
            backgroundColor: selected ? `${domainColor}15` : "transparent",
          }}
          tabIndex={tabIndex}
          aria-label={`${stack.name} technology, ${stack.domain} category`}
          aria-pressed={selected}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          onFocus={onFocus}
        >
          {/* Icon */}
          {IconComponent && (
            <div
              className="w-6 h-6"
              style={{
                color: showIconColor ? iconColor : domainColor,
                opacity: isActive ? 1 : 0.7,
                transition: a11y.prefersReducedMotion
                  ? "none"
                  : "color 200ms ease-out, opacity 200ms ease-out",
              }}
            >
              <IconComponent width={24} height={24} />
            </div>
          )}

          {/* Tooltip with stack name - uses hover-hover via group-hover-hover */}
          <span
            className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 text-xs font-medium bg-gray-900 text-white rounded whitespace-nowrap opacity-0 group-hover-hover:opacity-100 group-focus-visible:opacity-100 pointer-events-none z-50"
            style={{
              transition: a11y.prefersReducedMotion
                ? "none"
                : "opacity 150ms ease-out",
            }}
          >
            {stack.name}
          </span>
        </button>
      </li>
    );
  },
);
