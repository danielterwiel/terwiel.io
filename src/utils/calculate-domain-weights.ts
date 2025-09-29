import { differenceInDays, parseISO } from "date-fns";

import type { Domain, Project } from "~/data/projects";

export type DomainWeight = {
  domain: Domain;
  weight: number;
  percentage: number;
};

/**
 * Calculate the weighted distribution of domains across all projects
 *
 * The calculation considers:
 * - Duration of each project (in days)
 * - Number of stack items in each project
 * - Domain of each stack item
 *
 * Formula: Each stack item contributes (project_duration / total_stack_items) to its domain
 * This ensures longer projects and more focused stacks have proportionally higher weight
 *
 * @param projects - Array of projects to analyze
 * @returns Array of domain weights with percentages
 */
export function calculateDomainWeights(projects: Project[]): DomainWeight[] {
  const domainWeights = new Map<Domain, number>();

  // Initialize all domains to 0
  const allDomains: Domain[] = ["DevOps", "Back-end", "Front-end", "Design"];
  for (const domain of allDomains) {
    domainWeights.set(domain, 0);
  }

  let totalWeight = 0;

  for (const project of projects) {
    // Calculate project duration in days
    const startDate = parseISO(project.dateFrom);
    const endDate =
      project.dateTo === "present" ? new Date() : parseISO(project.dateTo);
    const durationDays = Math.max(1, differenceInDays(endDate, startDate));

    // Calculate weight per stack item for this project
    const stackCount = project.stack.length;
    const weightPerItem = stackCount > 0 ? durationDays / stackCount : 0;

    // Distribute weight to each domain based on stack composition
    for (const stackItem of project.stack) {
      const currentWeight = domainWeights.get(stackItem.domain) || 0;
      domainWeights.set(stackItem.domain, currentWeight + weightPerItem);
      totalWeight += weightPerItem;
    }
  }

  // Convert to percentage and create result array
  const result: DomainWeight[] = allDomains.map((domain) => {
    const weight = domainWeights.get(domain) || 0;
    const percentage = totalWeight > 0 ? (weight / totalWeight) * 100 : 0;

    return {
      domain,
      weight,
      percentage,
    };
  });

  // Sort by weight descending
  return result.sort((a, b) => b.weight - a.weight);
}
