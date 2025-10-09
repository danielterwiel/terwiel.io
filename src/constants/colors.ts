import type { Domain } from "~/types";

import {
  generateDomainColors,
  type Oklch,
  oklchToHex,
  toOklchString,
} from "../utils/color-conversions";

/**
 * OKLCH color definitions - Single source of truth
 * OKLCH format provides better perceptual uniformity and color manipulation
 * All other color formats (hex, subtle, high-contrast) are derived from these
 */

// Primary colors
export const KLEIN_BLUE_OKLCH = {
  l: 0.3785,
  c: 0.1954,
  h: 263.23,
} as const satisfies Oklch;

export const PRIMARY_COLOR_OKLCH = {
  l: 0.2077,
  c: 0.0398,
  h: 265.75,
} as const satisfies Oklch;

// Domain colors - subtle, muted palette
// Lightness: 0.63-0.86 (ranging from moderate to very light)
// Chroma: 0.025-0.072 (low saturation for subtle, sophisticated appearance)
// Strategy: Higher lightness + lower chroma = soft, elegant colors suitable for backgrounds and borders
export const DOMAIN_COLORS_OKLCH = {
  DevOps: { l: 0.8638, c: 0.0343745408613079, h: 289.3318671204764 }, // Light purple - soft and ethereal (#D1CFE8)
  "Back-end": { l: 0.8045, c: 0.02517033354917079, h: 267.88260378865596 }, // Light blue-gray - calm and neutral (#B8BFD0)
  "Front-end": { l: 0.6323, c: 0.07158434611533575, h: 288.9480766560252 }, // Medium purple - slightly more saturated (#8883B3)
  Design: { l: 0.7408, c: 0.042065152899940124, h: 343.11533854640993 }, // Light mauve - warm and soft (#BFA1B2)
} as const satisfies Record<Domain, Oklch>;

// Neutral ink for default borders
export const NEUTRAL_INK_OKLCH = {
  l: 0.75,
  c: 0.01,
  h: 260,
} as const satisfies Oklch;

// Focus indicator color (accessible blue, 3:1 contrast)
export const FOCUS_COLOR_OKLCH = {
  l: 0.45,
  c: 0.15,
  h: 260,
} as const satisfies Oklch;

/**
 * Derived color formats (generated from OKLCH definitions above)
 */

// Primary colors - CSS strings and hex
export const KLEIN_BLUE = toOklchString(KLEIN_BLUE_OKLCH);
export const KLEIN_BLUE_HEX = oklchToHex(KLEIN_BLUE_OKLCH);

export const PRIMARY_COLOR = toOklchString(PRIMARY_COLOR_OKLCH);
export const PRIMARY_COLOR_HEX = oklchToHex(PRIMARY_COLOR_OKLCH);

// Neutral ink
export const NEUTRAL_INK = toOklchString(NEUTRAL_INK_OKLCH);
export const NEUTRAL_INK_HEX = oklchToHex(NEUTRAL_INK_OKLCH);

// Focus color
export const FOCUS_COLOR = toOklchString(FOCUS_COLOR_OKLCH);
export const FOCUS_COLOR_HEX = oklchToHex(FOCUS_COLOR_OKLCH);

// Domain colors - all variations generated from OKLCH
const domainColorVariations = generateDomainColors(DOMAIN_COLORS_OKLCH);

export const DOMAIN_COLORS = domainColorVariations.colors;
export const DOMAIN_COLORS_HEX = domainColorVariations.colorsHex;
export const DOMAIN_BORDERS_SUBTLE = domainColorVariations.bordersSubtle;
export const DOMAIN_BORDERS_SUBTLE_HEX = domainColorVariations.bordersSubtleHex;
export const DOMAIN_COLORS_HIGH_CONTRAST = domainColorVariations.highContrast;
export const DOMAIN_COLORS_HIGH_CONTRAST_HEX =
  domainColorVariations.highContrastHex;
