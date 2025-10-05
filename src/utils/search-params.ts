import type { ReadonlyURLSearchParams } from "next/navigation";

export const getSearchQuery = (
  searchParams: ReadonlyURLSearchParams | null,
): string => {
  return decodeURI(searchParams?.get("search") ?? "").trim();
};

/**
 * Toggles the search parameter in the URL.
 * If the new value matches the current search query, clears the search parameter.
 * Otherwise, sets the search parameter to the new value.
 *
 * @param currentSearchQuery - The current search query from getSearchQuery()
 * @param newValue - The new value to set (stack name or domain name)
 * @returns The query string with "?" prefix, or empty string if clearing
 */
export const toggleSearchParam = (
  currentSearchQuery: string,
  newValue: string,
): string => {
  // If clicking the same value, clear the search param
  if (currentSearchQuery === newValue) {
    return "";
  }

  const searchParams = new URLSearchParams();
  searchParams.set("search", newValue);
  return `?${searchParams.toString()}`;
};
