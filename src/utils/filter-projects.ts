import type { Domain, Project } from "~/types";

import type { SelectionIndex } from "./stack-cloud/selection-index";
import { projectHasDomain } from "./project-has-domain";

const PROJECT_KEY_DISALLOWED = ["stack"];

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

    // Apply text search to project properties
    const { stack, ...rest } = project;
    const stackMatches = stack.filter((item) =>
      item.name.toLowerCase().includes(query.toLowerCase()),
    );
    const restMatches = Object.entries(rest).filter(
      ([key, value]) =>
        value.toString().toLowerCase().includes(query.toLowerCase()) &&
        !PROJECT_KEY_DISALLOWED.includes(key),
    );
    return stackMatches.length > 0 || restMatches.length > 0;
  });
}
