import { differenceInMonths, parseISO } from "date-fns";

import type { Domain, DomainExperience, Project } from "~/types";

/**
 * Calculate project duration in months
 * Handles "Present" as current date and adds 1 to include the current month
 */
function calculateProjectDuration(dateFrom: string, dateTo: string): number {
  const isPresent = dateTo === "Present";
  const from = parseISO(dateFrom);
  const to = parseISO(isPresent ? new Date().toISOString() : dateTo);
  return differenceInMonths(to, from) + 1;
}

/**
 * Calculate total experience months per domain across all projects
 *
 * Algorithm:
 * 1. For each project, calculate its duration in months
 * 2. For each domain, count the number of stack items in that domain
 * 3. Weight domain experience by: months * stackItemCount
 *    This amplifies domains with more specialized tools/technologies
 * 4. Calculate percentages for pie chart rendering
 *
 * @param projects - All projects to analyze
 * @returns Array of domain experiences with percentages
 */
export function calculateDomainExperiences(
  projects: Project[],
): DomainExperience[] {
  const domainMonths = new Map<Domain, number>();

  // Aggregate weighted months per domain
  for (const project of projects) {
    const months = calculateProjectDuration(project.dateFrom, project.dateTo);

    // Count stack items per domain in this project
    const stackItemsByDomain = new Map<Domain, number>();
    for (const stackItem of project.stack) {
      const count = stackItemsByDomain.get(stackItem.domain) ?? 0;
      stackItemsByDomain.set(stackItem.domain, count + 1);
    }

    // Add weighted experience to each domain
    // Weight = project months * (1 + stackCount * 0.5)
    // This gives 50% less increment per stack item compared to full multiplication
    for (const [domain, stackCount] of stackItemsByDomain) {
      const weightedMonths = months * (1 + stackCount * 0.5);
      const current = domainMonths.get(domain) ?? 0;
      domainMonths.set(domain, current + weightedMonths);
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
