import type { Domain, DomainExperienceSimple, Project } from "~/types";

import { mergeDateRanges } from "./merge-date-ranges";

/**
 * Calculate total experience for a specific domain
 * Merges overlapping date ranges to avoid double-counting months
 */
export function calculateDomainExperience(
  projects: Project[],
  domain: Domain,
): DomainExperienceSimple {
  // Filter projects that use this domain and collect their date ranges
  const ranges = projects
    .filter((project) => project.stack.some((item) => item.domain === domain))
    .map((project) => ({
      from: project.dateFrom,
      to: project.dateTo,
    }));

  return mergeDateRanges(ranges);
}
