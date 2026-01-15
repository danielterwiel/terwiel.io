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

// Domain colors — muted but clearly separable for 1px lines
// Strategy:
// - Δh ≈ 15° steps across a blue-violet to magenta arc (270→350)
// - Staggered L: 0.68 / 0.74 / 0.80 / 0.84 / 0.88
// - Low-to-moderate chroma to stay sophisticated but distinct
export const DOMAIN_COLORS_OKLCH = {
  // Deep blue-violet (cooler anchor before Back-end)
  AI: { l: 0.72, c: 0.078, h: 270 },

  // Blue‑gray violet (darker anchor)
  "Back-end": { l: 0.68, c: 0.072, h: 290 },

  // Warm mauve (lighter than Back-end, warmer hue)
  Design: { l: 0.84, c: 0.056, h: 305 },

  // Light purple (soft, ethereal)
  DevOps: { l: 0.88, c: 0.052, h: 320 },

  // Medium purple (slightly stronger presence)
  "Front-end": { l: 0.8, c: 0.068, h: 335 },

  // Violet‑red (most reddish; good tail color in the set)
  QA: { l: 0.74, c: 0.065, h: 350 },
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
export const NEUTRAL_INK_HEX = oklchToHex(NEUTRAL_INK_OKLCH);

// Focus color
export const FOCUS_COLOR_HEX = oklchToHex(FOCUS_COLOR_OKLCH);

// Domain colors - all variations generated from OKLCH
const domainColorVariations = generateDomainColors(DOMAIN_COLORS_OKLCH);

export const DOMAIN_COLORS = domainColorVariations.colors;
export const DOMAIN_COLORS_HEX = domainColorVariations.colorsHex;
export const DOMAIN_BORDERS_SUBTLE_HEX = domainColorVariations.bordersSubtleHex;
export const DOMAIN_COLORS_HIGH_CONTRAST_HEX =
  domainColorVariations.highContrastHex;
