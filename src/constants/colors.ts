import type { Domain } from "~/types";

/**
 * Klein Blue color constant - single source of truth
 * International Klein Blue (#002FA7)
 * Used in both Tailwind config and runtime styling (especially for SVG)
 */
export const KLEIN_BLUE = "#002FA7" as const;
export const PRIMARY_COLOR = "#0F172A" as const;

export const DOMAIN_COLORS = {
  DevOps: "#B6BDDB",
  "Back-end": "#D7E0A5",
  "Front-end": "#F5E496",
  Design: "#FABEAF",
} as const satisfies Record<Domain, string>;
