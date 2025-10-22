import type { ReadonlyURLSearchParams } from "next/navigation";

import type { Project, Stack } from "~/types";

import { filterProjects } from "~/utils/filter-projects";
import { matchesDomainName } from "~/utils/get-domain-names";
import { matchesParent } from "~/utils/get-stack-parent";
import { matchesAnyStackName } from "~/utils/matches-stack-name";
import { getSearchQuery } from "~/utils/search-params";

/**
 * Normalize stack name to a URL-friendly slug
 * Examples: "React" -> "react", "Next" -> "nextjs"
 */
function normalizeStackName(name: string): string {
  return name.toLowerCase().replace(/\./g, "").replace(/\s+/g, "-").trim();
}

/**
 * Determine if a stack should be selected based on URL search parameters
 * A stack is selected if:
 * 1. Its name matches the search query (case-insensitive, word start)
 * 2. Its domain matches the search query (case-insensitive)
 * 3. It's used in projects that match the search query (BUT NOT if the query directly matches a stack name or domain)
 */
export function isStackSelected(
  stack: Stack,
  searchParams: ReadonlyURLSearchParams | null,
  projects: Project[],
): boolean {
  if (!searchParams) return false;

  const searchQuery = getSearchQuery(searchParams);

  if (!searchQuery) return false;

  const normalizedQuery = searchQuery.toLowerCase().trim();
  const normalizedStackName = stack.name.toLowerCase();

  // Check if the query directly matches the start of this stack's name (case-insensitive)
  if (normalizedStackName.startsWith(normalizedQuery)) {
    return true;
  }

  // Check if the query matches this stack's domain (case-insensitive)
  const matchedDomain = matchesDomainName(searchQuery, projects);
  if (matchedDomain && stack.domain === matchedDomain) {
    return true;
  }

  // Check if the query matches ANY stack name or domain name
  // If so, don't select based on filtered projects (to avoid too many selections)
  const queryMatchesStackName = matchesAnyStackName(searchQuery, projects);
  const queryMatchesDomain = matchedDomain !== null;

  if (queryMatchesStackName || queryMatchesDomain) {
    return false;
  }

  // Only if the query doesn't match any stack/domain directly,
  // check if this stack is used in filtered projects
  const filteredProjects = filterProjects(projects, searchQuery);
  const stackUsedInFilteredProjects = filteredProjects.some((project) =>
    project.stack.some((s) => {
      // Match by parent or name
      if (matchesParent(s, stack.name)) return true;
      // Also match by normalized name for backwards compatibility
      return normalizeStackName(s.name) === normalizeStackName(stack.name);
    }),
  );

  return stackUsedInFilteredProjects;
}
