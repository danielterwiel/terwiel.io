import type { ReadonlyURLSearchParams } from "next/navigation";

import type { Project } from "~/types";

import { matchesDomainName } from "./get-domain-names";

export const getSearchQuery = (
  searchParams: ReadonlyURLSearchParams | null,
): string => {
  return decodeURI(searchParams?.get("query") ?? "").trim();
};

/**
 * Extract the filter type from URL params to differentiate between:
 * - 'search': user typed in search input
 * - 'domain': user clicked a domain segment
 * - 'tech': user clicked a technology/stack node
 * - 'project': user clicked a project badge
 */
export const getFilterType = (
  searchParams: ReadonlyURLSearchParams | null,
): "search" | "domain" | "tech" | "project" | null => {
  const type = searchParams?.get("filterType");
  if (
    type === "search" ||
    type === "domain" ||
    type === "tech" ||
    type === "project"
  ) {
    return type;
  }
  return null;
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
 * Toggles the query parameter in the URL.
 * If the new value matches the current search query, clears the query parameter.
 * Otherwise, sets the query parameter to the new value.
 *
 * @param currentSearchQuery - The current search query from getSearchQuery()
 * @param newValue - The new value to set (stack name or domain name)
 * @param filterType - Type of filter being applied (search, domain, tech, or project)
 * @returns The query string with "?" prefix, or empty string if clearing
 */
export const toggleSearchParam = (
  currentSearchQuery: string,
  newValue: string,
  filterType?: "search" | "domain" | "tech" | "project",
): string => {
  // If clicking the same value, clear the query param
  if (currentSearchQuery === newValue) {
    return "";
  }

  const searchParams = new URLSearchParams();
  searchParams.set("query", newValue);
  if (filterType) {
    searchParams.set("filterType", filterType);
  }
  return `?${searchParams.toString()}`;
};
