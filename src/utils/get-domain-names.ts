import type { Domain, Project } from "~/types";

let cachedDomains: Domain[] | null = null;

/**
 * Get all valid domain names from projects data
 * Dynamically extracts unique domains from all projects (memoized)
 */
export function getDomainNames(projects: Project[]): Domain[] {
  if (cachedDomains) return cachedDomains;

  const domains = new Set<Domain>();

  for (const project of projects) {
    for (const stackItem of project.stack) {
      domains.add(stackItem.domain);
    }
  }

  cachedDomains = Array.from(domains);
  return cachedDomains;
}

/**
 * Check if a string matches a domain name (case-insensitive, word start match)
 * Returns the matched domain if found, null otherwise
 */
export function matchesDomainName(
  query: string,
  projects: Project[],
): Domain | null {
  if (!query) {
    return null;
  }

  const normalizedQuery = query.toLowerCase().trim();
  const domains = getDomainNames(projects);

  for (const domain of domains) {
    if (domain.toLowerCase() === normalizedQuery) {
      return domain;
    }
  }

  return null;
}
