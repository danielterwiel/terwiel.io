import type { ReadonlyURLSearchParams } from "next/navigation";

import type { Domain, Project, Stack } from "~/types";

import { matchesDomainName } from "~/utils/get-domain-names";
import { getSearchFilter } from "~/utils/search-params";
import { isStackSelected } from "~/utils/stack-selection";

/**
 * Get the initially selected domain from URL filter param
 * Used to initialize state on first render (SSR/hydration compatible)
 */
export function getInitialSelectedDomain(
  searchParams: ReadonlyURLSearchParams | null,
  projects: Project[],
): Domain | null {
  if (!searchParams) return null;

  const filter = getSearchFilter(searchParams);
  if (!filter) return null;

  return matchesDomainName(filter, projects);
}

/**
 * Get the initially selected stack from URL filter param
 * Used to initialize state on first render (SSR/hydration compatible)
 * Returns null if a domain is selected instead
 */
export function getInitialSelectedStack(
  searchParams: ReadonlyURLSearchParams | null,
  stacks: Stack[],
  projects: Project[],
): Stack | null {
  if (!searchParams) return null;

  const filter = getSearchFilter(searchParams);
  if (!filter) return null;

  // If a domain is selected, don't select a stack
  const matchedDomain = matchesDomainName(filter, projects);
  if (matchedDomain) return null;

  // Find the selected stack
  return stacks.find((s) => isStackSelected(s, searchParams, projects)) ?? null;
}
