import type { Project } from "~/data/projects";

let cachedStackNames: string[] | null = null;

/**
 * Get all unique stack names from projects (memoized)
 */
export function getAllStackNames(projects: Project[]): string[] {
  if (cachedStackNames) return cachedStackNames;

  const stackNames = new Set<string>();

  for (const project of projects) {
    for (const stackItem of project.stack) {
      stackNames.add(stackItem.name);
    }
  }

  cachedStackNames = Array.from(stackNames);
  return cachedStackNames;
}

/**
 * Check if a search query matches any stack name (case-insensitive, word start match)
 * Returns true if the query matches the start of any stack name
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
