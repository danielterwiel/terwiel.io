import type { Project } from "~/data/projects";
import { mergeDateRanges } from "./merge-date-ranges";

export type TotalExperience = {
  totalMonths: number;
  years: number;
  months: number;
};

/**
 * Calculate total experience across all projects
 * Merges overlapping date ranges to avoid double-counting months
 */
export function calculateTotalExperience(projects: Project[]): TotalExperience {
  const ranges = projects.map((project) => ({
    from: project.dateFrom,
    to: project.dateTo,
  }));

  return mergeDateRanges(ranges);
}
