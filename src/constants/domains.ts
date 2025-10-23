import type { Domain } from "~/types";

/**
 * All valid domains in the portfolio
 * Single source of truth - used across the application
 * Derived from Domain type definition for type safety
 */
export const DOMAINS = [
  "DevOps",
  "Back-end",
  "Front-end",
  "Design",
  "QA",
] as const satisfies readonly Domain[];
