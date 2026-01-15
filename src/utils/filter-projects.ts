/**
 * Project Filtering Utilities
 *
 * Provides the main filtering logic for projects based on search queries
 * and domain filters. Uses full word matching for precise results.
 *
 * @see filterCache in src/utils/filter-cache.ts for caching layer
 * @see SelectionIndex in src/utils/selection-index.ts for O(1) domain lookups
 */

import type { Domain, Project } from "~/types";

import type { SelectionIndex } from "./selection-index";
import { projectHasDomain } from "./project-has-domain";

/** Project properties that should not be searched (e.g., stack is handled separately) */
const PROJECT_KEY_DISALLOWED = ["stack"];

/**
 * Check if a string contains a full word match (case-insensitive)
 *
 * Word boundaries are defined by: start/end of string, whitespace, hyphens, dots, slashes.
 * This prevents partial matches (e.g., "React" won't match "ReactNative").
 *
 * @param text - The text to search in
 * @param query - The search query to find
 * @returns true if the query appears as a complete word in the text
 *
 * @example
 * ```ts
 * hasFullWordMatch("React, TypeScript", "React");     // true
 * hasFullWordMatch("React, TypeScript", "Type");      // false (partial)
 * hasFullWordMatch("front-end developer", "front");   // true
 * ```
 */
function hasFullWordMatch(text: string, query: string): boolean {
  const escapedQuery = query.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
  // Match the query with word boundaries: start/end of string or word separator chars
  const pattern = new RegExp(
    `(^|[\\s\\-.,/])(${escapedQuery})([\\s\\-.,/]|$)`,
    "i",
  );
  return pattern.test(text);
}

/**
 * Filter projects by search query and/or domain
 *
 * Implements the main project filtering logic with:
 * - Domain filtering (uses SelectionIndex for O(1) lookup if available)
 * - Full word text search across project properties and stack names
 * - Case-insensitive matching
 * - AND logic when combining domain + query filters
 *
 * @param projects - Array of all projects to filter
 * @param query - Search query string (empty string for no text filter)
 * @param domain - Optional domain to filter by (e.g., "Front-end")
 * @param selectionIndex - Optional SelectionIndex for fast domain lookups
 * @returns Filtered array of projects matching the criteria
 *
 * @example
 * ```ts
 * // Filter by text search
 * filterProjects(projects, "React");
 *
 * // Filter by domain
 * filterProjects(projects, "", "Front-end");
 *
 * // Combined filter (AND logic)
 * filterProjects(projects, "2024", "Front-end", selectionIndex);
 * ```
 */
export function filterProjects(
  projects: Project[],
  query: string,
  domain?: Domain,
  selectionIndex?: SelectionIndex,
) {
  return projects.filter((project) => {
    // If a domain filter is specified, use index for O(1) lookup if available
    if (domain) {
      if (selectionIndex) {
        // Fast path: use index to check if project has this domain
        const projectHasDomainFast = project.stack.some((stack) =>
          selectionIndex.isStackInDomain(stack.name, domain),
        );
        if (!projectHasDomainFast) {
          return false;
        }
      } else {
        // Fallback: use original logic
        if (!projectHasDomain(project, domain)) {
          return false;
        }
      }
    }

    // If query matches a domain name, don't apply text search (domain filter is enough)
    if (domain && query.toLowerCase() === domain.toLowerCase()) {
      return true;
    }

    // If no query, return projects that match the domain filter (if any)
    if (!query) {
      return true;
    }

    // Apply full word match text search to project properties
    const { stack, ...rest } = project;
    const stackMatches = stack.filter((item) =>
      hasFullWordMatch(item.name, query),
    );
    const restMatches = Object.entries(rest).filter(
      ([key, value]) =>
        hasFullWordMatch(value.toString(), query) &&
        !PROJECT_KEY_DISALLOWED.includes(key),
    );
    return stackMatches.length > 0 || restMatches.length > 0;
  });
}
