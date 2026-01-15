import type { Domain, Project } from "~/types";

import type { SelectionIndex } from "./selection-index";
import { projectHasDomain } from "./project-has-domain";

const PROJECT_KEY_DISALLOWED = ["stack"];

/**
 * Check if a string contains a full word match (case-insensitive)
 * Word boundaries are defined by: whitespace, hyphens, dots, slashes
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
