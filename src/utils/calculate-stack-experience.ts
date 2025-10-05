import type { Project } from "~/data/projects";
import { mergeDateRanges } from "./merge-date-ranges";

export type StackExperience = {
  totalMonths: number;
  years: number;
  months: number;
};

/**
 * Calculate total experience for a specific stack
 * Merges overlapping date ranges to avoid double-counting months
 */
export function calculateStackExperience(
  projects: Project[],
  stackName: string,
): StackExperience {
  // Filter projects that use this stack and collect their date ranges
  const ranges = projects
    .filter((project) => project.stack.some((item) => item.name === stackName))
    .map((project) => ({
      from: project.dateFrom,
      to: project.dateTo,
    }));

  return mergeDateRanges(ranges);
}
