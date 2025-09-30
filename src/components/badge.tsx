"use client";

import { clsx } from "clsx";
import Link from "next/link";

import { Icon } from "~/components/icon";
import {
  getIconHexColor,
  getMagneticClasses,
  validateIconName,
} from "~/utils/icon-colors";

export type BadgeProps = {
  icon: string;
  name: string;
};

export const Badge = ({ icon, name }: BadgeProps) => {
  const validatedIcon = validateIconName(icon);
  const IconComponent = Icon[icon as keyof typeof Icon];
  const colored = validatedIcon !== undefined;
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

  // Generate href with search parameter
  const href = `/?search=${encodeURIComponent(name)}`;

  const magneticClasses = getMagneticClasses(undefined, {
    component: "button",
    shape: "rounded-lg",
    className: clsx(
      "inline-flex items-center gap-2 transition-all duration-300 ease-out",
      "select-none cursor-pointer px-3 py-2 h-10"
    ),
  });

  const iconClasses = clsx(
    "flex-shrink-0 w-6 h-6 text-slate-400 transition-colors duration-300 ease-out",
    colored && "group-hover:[color:var(--badge-color)]"
  );

  const textClasses = clsx(
    "text-sm font-medium text-slate-700 whitespace-nowrap",
    "transition-all duration-300 ease-out",
    "group-hover:underline group-hover:[text-decoration-color:var(--badge-color)]",
    !colored && "group-hover:[text-decoration-color:#94A3B8]"
  );

  // Set CSS custom properties for dynamic theming
  const style: React.CSSProperties = {
    "--badge-color": hexColor,
    "--badge-rgb": rgbString,
  } as React.CSSProperties;

  if (!IconComponent) {
    return null;
  }

  return (
    <Link
      href={href}
      replace
      className={clsx(
        magneticClasses,
        "group border-2 transition-all duration-300",
        colored
          ? "[border-color:rgba(var(--badge-rgb),0.3)] hover:[border-color:rgba(var(--badge-rgb),0.6)]"
          : "border-slate-400/20 hover:border-slate-400/40"
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
