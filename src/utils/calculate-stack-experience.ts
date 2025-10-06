import type { Project, StackExperience } from "~/types";

import { matchesParent } from "~/utils/get-stack-parent";
import { mergeDateRanges } from "./merge-date-ranges";

/**
 * Calculate total experience for a specific stack or parent
 * If stackName is a parent, includes all child stacks in the calculation
 * Merges overlapping date ranges to avoid double-counting months
 */
export function calculateStackExperience(
  projects: Project[],
  stackName: string,
): StackExperience {
  // Filter projects that use this stack or any of its children
  const ranges = projects
    .filter((project) =>
      project.stack.some((item) => matchesParent(item, stackName)),
    )
    .map((project) => ({
      from: project.dateFrom,
      to: project.dateTo,
    }));

  return mergeDateRanges(ranges);
}
