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
