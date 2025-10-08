import type { Domain } from "~/types";

/**
 * Klein Blue color constant - single source of truth
 * International Klein Blue
 * OKLCH format provides better perceptual uniformity and color manipulation
 * Used in both Tailwind config and runtime styling (especially for SVG)
 */

// OKLCH color definitions (Lightness, Chroma, Hue)
export const KLEIN_BLUE_OKLCH = {
  l: 0.3785,
  c: 0.1954,
  h: 263.23,
} as const;

export const PRIMARY_COLOR_OKLCH = {
  l: 0.2077,
  c: 0.0398,
  h: 265.75,
} as const;

type Oklch = { l: number; c: number; h: number };

export const DOMAIN_COLORS_OKLCH = {
  DevOps: { l: 0.8026, c: 0.0431, h: 275.02 },
  "Back-end": { l: 0.8854, c: 0.0778, h: 115.06 },
  "Front-end": { l: 0.9153, c: 0.0994, h: 97.38 },
  Design: { l: 0.852, c: 0.0727, h: 34.46 },
} as const satisfies Record<Domain, Oklch>;

// Helper function to convert OKLCH object to CSS oklch() string
export const toOklchString = (color: { l: number; c: number; h: number }) => {
  return `oklch(${(color.l * 100).toFixed(2)}% ${color.c.toFixed(4)} ${color.h.toFixed(2)})`;
};

// CSS-ready OKLCH strings for Tailwind and inline styles
export const KLEIN_BLUE = toOklchString(KLEIN_BLUE_OKLCH);
export const PRIMARY_COLOR = toOklchString(PRIMARY_COLOR_OKLCH);

export const DOMAIN_COLORS = {
  DevOps: toOklchString(DOMAIN_COLORS_OKLCH.DevOps),
  "Back-end": toOklchString(DOMAIN_COLORS_OKLCH["Back-end"]),
  "Front-end": toOklchString(DOMAIN_COLORS_OKLCH["Front-end"]),
  Design: toOklchString(DOMAIN_COLORS_OKLCH.Design),
} as const satisfies Record<Domain, string>;
