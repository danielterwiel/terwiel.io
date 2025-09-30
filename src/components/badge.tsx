"use client";

import { clsx } from "clsx";

import React from "react";

import { Icon } from "~/components/icon";
import {
  getIconHexColor,
  getMagneticClasses,
  validateIconName,
} from "~/utils/icon-colors";

export type BadgeProps = {
  icon: string;
  name: string;
  colored?: boolean;
  className?: string;
  onHoverChange?: (isHovered: boolean) => void;
  onClick?: () => void;
};

export const Badge = ({
  icon,
  name,
  colored = false,
  className,
  onHoverChange,
  onClick,
}: BadgeProps) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const validatedIcon = validateIconName(icon);
  const IconComponent = Icon[icon as keyof typeof Icon];
  const hexColor = validatedIcon && colored ? getIconHexColor(icon) : "#94A3B8";

  const handleMouseEnter = () => {
    setIsHovered(true);
    onHoverChange?.(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    onHoverChange?.(false);
  };

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

  const magneticClasses = getMagneticClasses(undefined, {
    component: "button",
    shape: "rounded-lg",
    className: clsx(
      "inline-flex items-center gap-2 transition-all duration-300 ease-out",
      "select-none cursor-pointer px-3 py-2 h-10",
      className
    ),
  });

  const iconClasses = clsx(
    "flex-shrink-0 transform-gpu transition-all duration-300 ease-out w-6 h-6"
  );

  const textClasses = clsx(
    "text-sm font-medium text-slate-700 whitespace-nowrap transition-all duration-300 ease-out"
  );

  // Dynamic border color based on icon color (only when colored)
  const borderColor = colored
    ? `rgba(${rgbString}, 0.3)`
    : "rgba(148, 163, 184, 0.2)";
  const borderColorHover = colored
    ? `rgba(${rgbString}, 0.6)`
    : "rgba(148, 163, 184, 0.4)";

  const style: React.CSSProperties = {
    border: `2px solid ${isHovered ? borderColorHover : borderColor}`,
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  };

  if (!IconComponent) {
    return null;
  }

  return (
    <button
      className={magneticClasses}
      style={style}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      type="button"
      aria-label={name}
    >
      <IconComponent
        className={iconClasses}
        style={{
          color: colored && isHovered ? hexColor : "#94A3B8",
        }}
        aria-hidden="true"
        width={24}
        height={24}
        focusable="false"
      />
      <span className={textClasses}>{name}</span>
    </button>
  );
};
