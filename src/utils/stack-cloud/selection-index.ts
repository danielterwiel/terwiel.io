import type { Domain, Project } from "~/types";

import { DOMAINS } from "~/constants/domains";

/**
 * Selection index for O(1) lookups of:
 * - Which stacks belong to a domain
 * - Which projects have a domain
 * - Quick selection checks
 *
 * Built once after StackCloud loads and memoized
 */
export interface SelectionIndex {
  // Domain → Set of stack names
  domainToStacks: Map<Domain, Set<string>>;
  // Domain → Set of project IDs
  domainToProjects: Map<Domain, Set<string>>;
  // Quick lookup: is this stack in this domain?
  isStackInDomain: (stackName: string, domain: Domain) => boolean;
  // Get all stacks for a domain
  getStacksForDomain: (domain: Domain) => string[];
  // Get all projects with this domain
  getProjectsWithDomain: (domain: Domain) => string[];
}

/**
 * Build a selection index from projects
 * This is expensive (O(n)) but only done once
 * After that, all lookups are O(1)
 */
export function buildSelectionIndex(projects: Project[]): SelectionIndex {
  const domainToStacks = new Map<Domain, Set<string>>();
  const domainToProjects = new Map<Domain, Set<string>>();

  // Initialize domain maps
  for (const domain of DOMAINS) {
    domainToStacks.set(domain, new Set());
    domainToProjects.set(domain, new Set());
  }

  // Build the index
  for (const project of projects) {
    for (const stack of project.stack) {
      const domain = stack.domain;
      const stackSet = domainToStacks.get(domain);
      if (stackSet) {
        stackSet.add(stack.name);
      }
    }

    // Track which projects have each domain
    const domainSet = new Set<Domain>();
    for (const stack of project.stack) {
      domainSet.add(stack.domain);
    }
    for (const domain of domainSet) {
      const projects = domainToProjects.get(domain);
      if (projects) {
        projects.add(project.id);
      }
    }
  }

  return {
    domainToStacks,
    domainToProjects,
    isStackInDomain: (stackName: string, domain: Domain) => {
      return domainToStacks.get(domain)?.has(stackName) ?? false;
    },
    getStacksForDomain: (domain: Domain) => {
      return Array.from(domainToStacks.get(domain) ?? []);
    },
    getProjectsWithDomain: (domain: Domain) => {
      return Array.from(domainToProjects.get(domain) ?? []);
    },
  };
}

/**
 * Quick utility to check if a stack is selected based on domain selection
 */
export function isStackSelectedByDomain(
  stackName: string,
  selectedDomain: string | null,
  index: SelectionIndex,
): boolean {
  if (!selectedDomain) return false;
  return index.isStackInDomain(stackName, selectedDomain as Domain);
}
