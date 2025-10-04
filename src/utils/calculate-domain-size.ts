import { differenceInMonths, parseISO } from "date-fns";

import type { Domain, Project } from "~/data/projects";

export type DomainExperience = {
  domain: Domain;
  totalMonths: number;
  percentage: number;
};

/**
 * Calculate project duration in months
 * Handles "present" as current date and adds 1 to include the current month
 */
function calculateProjectDuration(dateFrom: string, dateTo: string): number {
  const isPresent = dateTo === "present";
  const from = parseISO(dateFrom);
  const to = parseISO(isPresent ? new Date().toISOString() : dateTo);
  return differenceInMonths(to, from) + 1;
}

/**
 * Calculate total experience months per domain across all projects
 *
 * Algorithm:
 * 1. For each project, calculate its duration in months
 * 2. Identify which domains are used in the project (via stack items)
 * 3. Add the project's full duration to each domain that appears
 * 4. Calculate percentages for pie chart rendering
 *
 * @param projects - All projects to analyze
 * @returns Array of domain experiences with percentages
 */
export function calculateDomainExperiences(
  projects: Project[],
): DomainExperience[] {
  const domainMonths = new Map<Domain, number>();

  // Aggregate months per domain
  for (const project of projects) {
    const months = calculateProjectDuration(project.dateFrom, project.dateTo);
    const domainsInProject = new Set<Domain>();

    // Collect unique domains in this project
    for (const stackItem of project.stack) {
      domainsInProject.add(stackItem.domain);
    }

    // Add project duration to each domain present
    for (const domain of domainsInProject) {
      const current = domainMonths.get(domain) ?? 0;
      domainMonths.set(domain, current + months);
    }
  }

  // Calculate total and percentages
  const totalMonths = Array.from(domainMonths.values()).reduce(
    (sum, months) => sum + months,
    0,
  );

  const experiences: DomainExperience[] = Array.from(domainMonths.entries())
    .map(([domain, months]) => ({
      domain,
      totalMonths: months,
      percentage: totalMonths > 0 ? (months / totalMonths) * 100 : 0,
    }))
    .sort((a, b) => b.totalMonths - a.totalMonths); // Sort by experience (descending)

  return experiences;
}
