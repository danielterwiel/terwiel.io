import type { Project } from "~/data/projects";

/**
 * Count the number of projects that use a specific stack
 */
export function countProjectsByStack(
  projects: Project[],
  stackName: string,
): number {
  return projects.filter((project) =>
    project.stack.some((item) => item.name === stackName),
  ).length;
}
