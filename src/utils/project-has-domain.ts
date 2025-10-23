import type { Domain, Project } from "~/types";

/**
 * Check if a project uses a specific domain in its tech stack
 * Reusable logic extracted for filtering operations
 */
export function projectHasDomain(project: Project, domain: Domain): boolean {
  return project.stack.some((item) => item.domain === domain);
}
