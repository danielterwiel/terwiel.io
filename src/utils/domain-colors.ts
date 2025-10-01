import type { Domain } from "~/data/projects";

/**
 * Domain color palette - harmonious colors that complement International Klein Blue (#002FA7)
 * Colors are chosen to be distinctive yet cohesive, working well with the magnetic effect
 *
 * These colors are also defined in tailwind.config.ts under theme.extend.colors.domain
 */
const DOMAIN_COLORS = {
  DevOps: {
    main: "#00acc1", // Cyan (domain.devops) - operational, systematic
    glow: "rgba(0, 172, 193, 0.15)", // Subtle glow
    glowHover: "rgba(0, 172, 193, 0.35)", // Brighter on hover
  },
  "Back-end": {
    main: "#7e57c2", // Purple (domain.backend) - deep, foundational
    glow: "rgba(126, 87, 194, 0.15)",
    glowHover: "rgba(126, 87, 194, 0.35)",
  },
  "Front-end": {
    main: "#ff7043", // Coral/Orange (domain.frontend) - vibrant, visible
    glow: "rgba(255, 112, 67, 0.15)",
    glowHover: "rgba(255, 112, 67, 0.35)",
  },
  Design: {
    main: "#ec407a", // Pink (domain.design) - creative, aesthetic
    glow: "rgba(236, 64, 122, 0.15)",
    glowHover: "rgba(236, 64, 122, 0.35)",
  },
} as const satisfies Record<
  Domain,
  { main: string; glow: string; glowHover: string }
>;

/**
 * Get the main color for a domain
 */
export function getDomainColor(domain: Domain): string {
  return DOMAIN_COLORS[domain].main;
}

/**
 * Get the glow color for a domain (normal state)
 */
export function getDomainGlow(domain: Domain): string {
  return DOMAIN_COLORS[domain].glow;
}

/**
 * Get the glow color for a domain (hover state)
 */
export function getDomainGlowHover(domain: Domain): string {
  return DOMAIN_COLORS[domain].glowHover;
}
