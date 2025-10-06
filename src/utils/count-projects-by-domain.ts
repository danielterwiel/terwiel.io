import type { Domain, Project } from "~/types";

/**
 * Count the number of projects that use a specific domain
 * Each project is counted only once even if it has multiple stacks in the same domain
 */
export function countProjectsByDomain(
  projects: Project[],
  domain: Domain,
): number {
  return projects.filter((project) =>
    project.stack.some((item) => item.domain === domain),
  ).length;
}
