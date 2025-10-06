import type { Project } from "~/data/projects";
import { matchesParent } from "~/utils/get-stack-parent";

/**
 * Count the number of projects that use a specific stack or parent
 * If stackName is a parent, includes all projects using any child stack
 */
export function countProjectsByStack(
  projects: Project[],
  stackName: string,
): number {
  return projects.filter((project) =>
    project.stack.some((item) => matchesParent(item, stackName)),
  ).length;
}
