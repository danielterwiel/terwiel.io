import type { Domain, DomainExperienceSimple, Project } from "~/types";

import { calculateDomainExperience } from "./calculate-domain-experience";
import { calculateStackExperience } from "./calculate-stack-experience";
import { extractUniqueStacks } from "./extract-stacks";

/**
 * Precomputed experience cache for instant lookups
 * Eliminates expensive date parsing and calculations during interactions
 *
 * Performance impact:
 * - Before: O(n) date parsing + overlap calculation per click
 * - After: O(1) Map lookup
 */

interface ExperienceCache {
  domains: Map<Domain, DomainExperienceSimple>;
  stacks: Map<string, DomainExperienceSimple>;
}

let cache: ExperienceCache | null = null;

/**
 * Build the experience cache from projects
 * Called once at app initialization
 */
export function buildExperienceCache(projects: Project[]): ExperienceCache {
  if (cache) return cache;

  const domains: Domain[] = ["DevOps", "Back-end", "Front-end", "Design", "QA"];
  const stacks = extractUniqueStacks(projects);

  const domainCache = new Map<Domain, DomainExperienceSimple>();
  const stackCache = new Map<string, DomainExperienceSimple>();

  // Precompute all domain experiences
  for (const domain of domains) {
    const experience = calculateDomainExperience(projects, domain);
    domainCache.set(domain, experience);
  }

  // Precompute all stack experiences
  for (const stack of stacks) {
    const experience = calculateStackExperience(projects, stack.name);
    stackCache.set(stack.name, experience);
  }

  cache = {
    domains: domainCache,
    stacks: stackCache,
  };

  return cache;
}

/**
 * Get cached domain experience (O(1) lookup)
 */
export function getDomainExperience(
  domain: Domain,
): DomainExperienceSimple | undefined {
  return cache?.domains.get(domain);
}

/**
 * Get cached stack experience (O(1) lookup)
 */
export function getStackExperience(
  stackName: string,
): DomainExperienceSimple | undefined {
  return cache?.stacks.get(stackName);
}

/**
 * Clear cache (useful for testing)
 */
export function clearExperienceCache(): void {
  cache = null;
}
