import type { ReadonlyURLSearchParams } from "next/navigation";

import type { Project } from "~/types";

import { matchesDomainName } from "./get-domain-names";

/**
 * Extract search query parameter from URLSearchParams
 * Used by SearchInput for text-based search functionality
 */
export const getSearchQuery = (
  searchParams: ReadonlyURLSearchParams | null,
): string => {
  return decodeURI(searchParams?.get("query") ?? "").trim();
};

/**
 * Extract filter parameter from URLSearchParams
 * Used by StackCloud interactions (clicking segments/nodes) and ProjectStack badges
 */
export const getSearchFilter = (
  searchParams: ReadonlyURLSearchParams | null,
): string => {
  return decodeURI(searchParams?.get("filter") ?? "").trim();
};

/**
 * Extract domain filter from search query if it matches a valid domain
 * This allows clicking a domain in the stack cloud to filter projects
 */
export const getSearchDomain = (
  query: string,
  projects: Project[],
): string | null => {
  // Use matchesDomainName to check if query is an exact domain match
  return matchesDomainName(query, projects);
};

/**
 * Toggles the filter parameter in the URL.
 * If the new value matches the current filter, clears the filter parameter.
 * Otherwise, sets the filter parameter to the new value.
 * Used by StackCloud interactions (root-node-chart, stack-node, project-stack).
 *
 * @param currentFilter - The current filter value from getSearchFilter()
 * @param newValue - The new value to set (stack name or domain name)
 * @returns The query string with "?" prefix, or empty string if clearing
 */
export const toggleFilterParam = (
  currentFilter: string,
  newValue: string,
): string => {
  // If clicking the same value, clear the filter param
  if (currentFilter === newValue) {
    return "";
  }

  const searchParams = new URLSearchParams();
  searchParams.set("filter", newValue);
  return `?${searchParams.toString()}`;
};
