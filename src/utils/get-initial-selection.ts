import type { ReadonlyURLSearchParams } from "next/navigation";

import type { Domain, Project, Stack } from "~/types";

import { matchesDomainName } from "~/utils/get-domain-names";
import { getSearchQuery } from "~/utils/search-params";
import { isStackSelected } from "~/utils/stack-selection";

/**
 * Get the initially selected domain from URL search params
 * Used to initialize state on first render (SSR/hydration compatible)
 */
export function getInitialSelectedDomain(
  searchParams: ReadonlyURLSearchParams | null,
  projects: Project[],
): Domain | null {
  if (!searchParams) return null;

  const searchQuery = getSearchQuery(searchParams);
  if (!searchQuery) return null;

  return matchesDomainName(searchQuery, projects);
}

/**
 * Get the initially selected stack from URL search params
 * Used to initialize state on first render (SSR/hydration compatible)
 * Returns null if a domain is selected instead
 */
export function getInitialSelectedStack(
  searchParams: ReadonlyURLSearchParams | null,
  stacks: Stack[],
  projects: Project[],
): Stack | null {
  if (!searchParams) return null;

  const searchQuery = getSearchQuery(searchParams);
  if (!searchQuery) return null;

  // If a domain is selected, don't select a stack
  const matchedDomain = matchesDomainName(searchQuery, projects);
  if (matchedDomain) return null;

  // Find the selected stack
  return stacks.find((s) => isStackSelected(s, searchParams, projects)) ?? null;
}
