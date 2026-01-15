/**
 * Stack Selection Utilities
 *
 * Determines which stacks should be visually selected/highlighted
 * based on URL search parameters. Used by the stack visualization
 * to show which technologies match the current filter.
 *
 * @see getSearchFilter in src/utils/search-params.ts for URL param extraction
 */

import type { ReadonlyURLSearchParams } from "next/navigation";

import type { Project, Stack } from "~/types";

import { filterProjects } from "~/utils/filter-projects";
import { matchesDomainName } from "~/utils/get-domain-names";
import { matchesParent } from "~/utils/get-stack-parent";
import { matchesAnyStackName } from "~/utils/matches-stack-name";
import { getSearchFilter } from "~/utils/search-params";

/**
 * Normalize stack name to a URL-friendly slug
 *
 * @param name - The stack name to normalize
 * @returns Lowercase, dot-free, hyphenated slug
 */
function normalizeStackName(name: string): string {
  return name.toLowerCase().replace(/\./g, "").replace(/\s+/g, "-").trim();
}

/**
 * Determine if a stack should be visually selected based on URL filter
 *
 * Selection priority:
 * 1. **Direct name match**: Filter starts with stack name (case-insensitive)
 * 2. **Domain match**: Filter matches stack's domain
 * 3. **Indirect match**: Stack is used in filtered projects (only if filter
 *    doesn't directly match any stack name or domain)
 *
 * ## Why indirect matching is limited
 *
 * If the filter directly matches a stack name like "React", we only select
 * that stack, not all stacks used in React projects. This prevents visual
 * clutter where too many stacks would be highlighted.
 *
 * @param stack - The stack to check for selection
 * @param searchParams - URL search parameters (from useSearchParams())
 * @param projects - All projects (needed for domain/indirect matching)
 * @returns true if the stack should be visually highlighted
 *
 * @example
 * ```ts
 * // URL: /?filter=React
 * isStackSelected(reactStack, searchParams, projects); // true
 * isStackSelected(tsStack, searchParams, projects);    // false (unless indirect)
 *
 * // URL: /?filter=Front-end
 * isStackSelected(reactStack, searchParams, projects); // true (domain match)
 * ```
 */
export function isStackSelected(
  stack: Stack,
  searchParams: ReadonlyURLSearchParams | null,
  projects: Project[],
): boolean {
  if (!searchParams) return false;

  const filter = getSearchFilter(searchParams);

  if (!filter) return false;

  const normalizedFilter = filter.toLowerCase().trim();
  const normalizedStackName = stack.name.toLowerCase();

  // Check if the filter directly matches the start of this stack's name (case-insensitive)
  if (normalizedStackName.startsWith(normalizedFilter)) {
    return true;
  }

  // Check if the filter matches this stack's domain (case-insensitive)
  const matchedDomain = matchesDomainName(filter, projects);
  if (matchedDomain && stack.domain === matchedDomain) {
    return true;
  }

  // Check if the filter matches ANY stack name or domain name
  // If so, don't select based on filtered projects (to avoid too many selections)
  const filterMatchesStackName = matchesAnyStackName(filter, projects);
  const filterMatchesDomain = matchedDomain !== null;

  if (filterMatchesStackName || filterMatchesDomain) {
    return false;
  }

  // Only if the filter doesn't match any stack/domain directly,
  // check if this stack is used in filtered projects
  const filteredProjects = filterProjects(projects, filter);
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
