"use client";

import { clsx } from "clsx";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import type { BadgeProps } from "~/types";

import { Icon } from "~/components/icon";
import {
  getIconHexColor,
  getMagneticClasses,
  validateIconName,
} from "~/utils/icon-colors";
import { getSearchFilter, toggleFilterParam } from "~/utils/search-params";
import { isExactParamMatchAny } from "~/utils/search-params-match";

export const Badge = ({
  icon,
  name,
  isAnimating = false,
  isMatched = false,
  tabIndex,
  badgeRef,
}: BadgeProps & {
  isAnimating?: boolean;
  isMatched?: boolean;
  tabIndex?: number;
  badgeRef?: (el: HTMLAnchorElement | null) => void;
}) => {
  const searchParams = useSearchParams();
  const currentFilter = getSearchFilter(searchParams);
  const validatedIcon = validateIconName(icon);
  const IconComponent = Icon[icon as keyof typeof Icon];

  // Check if this badge's name matches the current URLSearchParams (filter or query)
  const isSelected = isExactParamMatchAny(searchParams, name);

  const colored =
    isAnimating || isMatched || isSelected || validatedIcon !== undefined;
  const hexColor = colored ? getIconHexColor(icon) : "#94A3B8";

  // Convert hex to RGB for dynamic coloring
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result?.[1] && result[2] && result[3]
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 148, g: 163, b: 184 }; // slate-400 fallback
  };

  const rgb = hexToRgb(hexColor);
  const rgbString = `${rgb.r}, ${rgb.g}, ${rgb.b}`;

  // Generate href using toggleFilterParam to clear filter if badge is already selected
  const queryString = toggleFilterParam(currentFilter, name);
  const href = `/${queryString}`;

  const magneticClasses = getMagneticClasses(undefined, {
    component: "button",
    shape: "rounded-lg",
    className: clsx(
      "inline-flex items-center gap-2 transition-all duration-500 ease-out",
      "select-none cursor-pointer px-3 py-2 min-h-11",
    ),
  });

  const iconClasses = clsx(
    "flex-shrink-0 w-6 h-6 text-slate-400 transition-colors duration-500 ease-out",
    (isAnimating || isSelected || isMatched) &&
      colored &&
      "[color:var(--badge-color)]",
    colored &&
      !isSelected &&
      !isMatched &&
      "group-hover:[color:var(--badge-color)] group-focus-visible:[color:var(--badge-color)]",
  );

  const textClasses = clsx(
    "text-sm font-medium text-slate-700 whitespace-nowrap",
    "transition-all duration-500 ease-out",
    !isSelected &&
      !isMatched &&
      "group-hover:underline group-hover:[text-decoration-color:var(--badge-color)] group-focus-visible:underline group-focus-visible:[text-decoration-color:var(--badge-color)]",
    !colored &&
      "group-hover:[text-decoration-color:#94A3B8] group-focus-visible:[text-decoration-color:#94A3B8]",
  );

  // Set CSS custom properties for dynamic theming only when badge is colored
  const style: React.CSSProperties & Record<string, string> = colored
    ? {
        "--badge-color": hexColor,
        "--badge-rgb": rgbString,
      }
    : {};

  if (!IconComponent) {
    return null;
  }

  return (
    <Link
      ref={badgeRef}
      href={href}
      scroll={false}
      tabIndex={tabIndex}
      className={clsx(
        magneticClasses,
        "group border-2 transition-all duration-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-klein",
        (isAnimating || isSelected || isMatched) && colored
          ? "[border-color:rgba(var(--badge-rgb),0.3)]"
          : "border-slate-400/20",
        !isSelected &&
          !isMatched &&
          "hover:border-slate-400/40 focus-visible:border-slate-400/40",
        colored &&
          !isSelected &&
          !isMatched &&
          "hover:[border-color:rgba(var(--badge-rgb),0.6)] focus-visible:[border-color:rgba(var(--badge-rgb),0.6)]",
      )}
      style={style}
      aria-label={`Filter by ${name}`}
    >
      <IconComponent
        className={iconClasses}
        aria-hidden="true"
        width={24}
        height={24}
        focusable="false"
      />
      <span className={textClasses}>{name}</span>
    </Link>
  );
};
