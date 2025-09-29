import clsx from "clsx";
import { z } from "zod";

import { ICON_COLORS } from "../data/icon-colors";

type IconName = keyof typeof ICON_COLORS;

// Create a Zod enum from the ICON_COLORS keys for runtime validation
const iconColorKeys = Object.keys(ICON_COLORS) as [IconName, ...IconName[]];
export const IconNameSchema = z.enum(iconColorKeys);

// Type guard function for runtime validation
export function isValidIconName(icon: string): icon is IconName {
  return IconNameSchema.safeParse(icon).success;
}

// Safe function that validates input and returns undefined for invalid icons
export function validateIconName(icon: string): IconName | undefined {
  const result = IconNameSchema.safeParse(icon);
  return result.success ? result.data : undefined;
}

/**
 * Get the Tailwind CSS color class for an icon
 * Returns a fallback class for invalid icon names
 */
export function getIconColorClass(iconName: string): string {
  const validatedIcon = validateIconName(iconName);
  if (!validatedIcon) return "text-slate-400"; // fallback color

  const colorKey = iconNameToColorKey(validatedIcon);
  return `text-${colorKey}`;
}

/**
 * Get the Tailwind CSS hover color class for an icon
 * Returns undefined for invalid icon names
 */
export function getIconHoverColorClass(iconName: string): string | undefined {
  const validatedIcon = validateIconName(iconName);
  if (!validatedIcon) return undefined;

  const colorKey = iconNameToColorKey(validatedIcon);
  return `sm:group-hover:text-${colorKey}`;
}

/**
 * Get the Tailwind CSS decoration color class for links
 * Returns a fallback class for invalid icon names
 */
export function getIconDecorationColorClass(iconName: string): string {
  const validatedIcon = validateIconName(iconName);
  if (!validatedIcon) return "hover:decoration-slate-400"; // fallback color

  const colorKey = iconNameToColorKey(validatedIcon);
  return `hover:decoration-${colorKey}`;
}

/**
 * Get the hex color value for an icon
 * Returns a fallback color for invalid icon names
 */
export function getIconHexColor(iconName: string): string {
  const validatedIcon = validateIconName(iconName);
  if (!validatedIcon) return "#94A3B8"; // slate-400 equivalent

  return ICON_COLORS[validatedIcon];
}

/**
 * Get magnetic effect classes for an icon or color theme
 * Returns a string of classes for magnetic base styling with proper clsx composition
 */
export function getMagneticClasses(
  _iconName?: string,
  options: {
    variant?: "base" | "hover" | "active" | "selected";
    shape?: "rounded-lg" | "rounded-full";
    component?: "node" | "input" | "card" | "button";
    className?: string;
    isHovered?: boolean;
    isFocused?: boolean;
    hasQuery?: boolean;
    withRing?: boolean;
  } = {}
): string {
  const {
    variant,
    shape,
    component = "node", // Default to node for backward compatibility
    className,
    isHovered = false,
    isFocused = false,
    hasQuery = false,
    withRing,
  } = options;

  // Determine variant automatically if state props are provided
  let finalVariant = variant;
  if (
    !variant &&
    (isHovered !== undefined ||
      isFocused !== undefined ||
      hasQuery !== undefined)
  ) {
    if (isFocused || hasQuery) {
      finalVariant = "selected";
    } else if (isHovered) {
      finalVariant = "hover";
    } else {
      finalVariant = "base";
    }
  } else if (!variant) {
    finalVariant = "base";
  }

  // Determine shape based on component type if not explicitly provided
  let finalShape = shape;
  if (!shape && component) {
    finalShape = component === "node" ? "rounded-full" : "rounded-lg";
  }

  // Determine whether to include ring based on component type if not explicitly provided
  let finalWithRing = withRing;
  if (withRing === undefined) {
    // Nodes get rings by default for the iconic look, inputs don't to avoid border conflicts
    finalWithRing =
      component === "node" || component === "card" || component === "button";
  }

  return clsx(
    "magnetic-base",
    {
      // Component type classes
      "magnetic-node": component === "node",
      "magnetic-input": component === "input",
      "magnetic-card": component === "card",
      "magnetic-button": component === "button",

      // State variant classes
      "magnetic-hover": finalVariant === "hover",
      "magnetic-active": finalVariant === "active",
      "magnetic-selected": finalVariant === "selected",

      // Shape classes
      "magnetic-rounded-lg": finalShape === "rounded-lg",
      "magnetic-rounded-full": finalShape === "rounded-full",

      // Ring effect addon
      "magnetic-with-ring": finalWithRing,
    },
    className
  );
}

/**
 * Get magnetic effect classes with custom color
 * Returns CSS variables for dynamic color theming
 */
export function getMagneticClassesWithColor(
  iconName: string,
  options: {
    variant?: "base" | "hover" | "active" | "selected";
    shape?: "rounded-lg" | "rounded-full";
    className?: string;
  } = {}
): { classes: string; style: React.CSSProperties } {
  const classes = getMagneticClasses(iconName, options);
  const hexColor = getIconHexColor(iconName);

  // Convert hex to RGB for alpha transparency
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result?.[1] && result[2] && result[3]
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 0, g: 47, b: 167 }; // fallback to klein blue
  };

  const rgb = hexToRgb(hexColor);

  const style: React.CSSProperties = {
    "--magnetic-color": `${rgb.r}, ${rgb.g}, ${rgb.b}`,
    background: `linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.03))`,
  } as React.CSSProperties;

  return { classes, style };
}

/**
 * Generate Tailwind color object from ICON_COLORS
 * Used by tailwind.config.ts to create icon-* color classes
 */
export function generateTailwindIconColors(): Record<string, string> {
  const colors: Record<string, string> = {};

  Object.entries(ICON_COLORS).forEach(([iconName, hexValue]) => {
    const colorKey = iconNameToColorKey(iconName as IconName);
    // Remove the "icon-" prefix for the Tailwind color key
    const tailwindKey = colorKey.replace(/^icon-/, "");
    colors[`icon-${tailwindKey}`] = hexValue;
  });

  return colors;
}

/**
 * Generate safelist classes for Tailwind
 * Used by tailwind.config.ts to ensure dynamic classes aren't purged
 */
export function generateIconSafelist(): string[] {
  const classes: string[] = [];

  Object.keys(ICON_COLORS).forEach((iconName) => {
    const colorKey = iconNameToColorKey(iconName as IconName);

    // Add base text classes
    classes.push(`text-${colorKey}`);

    // Add hover variants
    classes.push(`sm:group-hover:text-${colorKey}`);

    // Add decoration variants
    classes.push(`hover:decoration-${colorKey}`);

    // Add magnetic effect variants
    classes.push(`magnetic-${colorKey.replace("icon-", "")}`);
    classes.push(`magnetic-border-${colorKey.replace("icon-", "")}`);
  });

  return classes;
}

/**
 * Convert icon name to Tailwind color key
 * e.g., "BrandReact" -> "icon-react", "Assembly" -> "icon-assembly"
 */
function iconNameToColorKey(iconName: IconName): string {
  const name = iconName
    .replace(/^Brand/, "")
    .replace(/^FileType/, "FileType")
    .replace(/^Test/, "Test");

  // Convert camelCase to kebab-case and add icon- prefix
  const kebabCase = name.replace(/([A-Z])/g, (_match, letter, index) =>
    index === 0 ? letter.toLowerCase() : `-${letter.toLowerCase()}`
  );

  // Handle special cases
  if (iconName.startsWith("FileType")) {
    return `icon-file-type-${kebabCase.replace("file-type-", "")}`;
  }
  if (iconName.startsWith("Test")) {
    return `icon-test-${kebabCase.replace("test-", "")}`;
  }

  return `icon-${kebabCase}`;
}
