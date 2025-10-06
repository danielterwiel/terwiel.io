import type { Project } from "~/data/projects";
import { getStackParent } from "~/utils/get-stack-parent";

let cachedStackNames: string[] | null = null;

/**
 * Get all unique stack names from projects (memoized)
 * Returns effective names (parent if exists, otherwise stack name)
 */
export function getAllStackNames(projects: Project[]): string[] {
  if (cachedStackNames) return cachedStackNames;

  const stackNames = new Set<string>();

  for (const project of projects) {
    for (const stackItem of project.stack) {
      // Use parent name if it exists, otherwise use the stack name
      stackNames.add(getStackParent(stackItem));
    }
  }

  cachedStackNames = Array.from(stackNames);
  return cachedStackNames;
}

/**
 * Check if a search query matches any stack name (case-insensitive, exact match)
 * Returns true if the query matches any stack name or parent name
 */
export function matchesAnyStackName(
  query: string,
  projects: Project[],
): boolean {
  if (!query) return false;

  const normalizedQuery = query.toLowerCase().trim();
  const stackNames = getAllStackNames(projects);

  return stackNames.some((name) => name.toLowerCase() === normalizedQuery);
}
