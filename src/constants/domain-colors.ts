import type { Domain } from "~/data/projects";

/**
 * Domain color mapping - single source of truth
 * These colors harmonize with Klein Blue and provide visual distinction
 * Used in both Tailwind config and runtime color lookups
 */
export const DOMAIN_COLORS = {
  DevOps: "#5ba4ad", // Soft teal - operational, systematic
  "Back-end": "#8d7dae", // Soft lavender - deep, foundational
  "Front-end": "#c98978", // Soft coral - warm, visible
  Design: "#c77894", // Soft rose - creative, aesthetic
} as const satisfies Record<Domain, string>;

/**
 * Get the hex color for a domain
 * Used for styling stack nodes based on their technical domain
 */
export function getDomainColor(domain: Domain): string {
  return DOMAIN_COLORS[domain];
}
