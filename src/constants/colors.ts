import type { Domain } from "~/data/projects";

/**
 * Klein Blue color constant - single source of truth
 * International Klein Blue (#002FA7)
 * Used in both Tailwind config and runtime styling (especially for SVG)
 */
export const KLEIN_BLUE = "#002FA7" as const;

export const DOMAIN_COLORS = {
  DevOps: "#5ba4ad", // Soft teal - operational, systematic
  "Back-end": "#c77894", // Soft rose - deep, foundational
  "Front-end": "#f6a97b", // Pastel tangerine - warm, visible
  Design: "#8d7dae", // Lavender-purple - creative, aesthetic
} as const satisfies Record<Domain, string>;
