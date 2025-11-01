import type { ReadonlyURLSearchParams } from "next/navigation";

/**
 * Check if a URLSearchParams value matches exactly (case-insensitive)
 * Used throughout the app to determine selections based on query/filter parameters
 *
 * @param searchParams - The URLSearchParams object (can be null)
 * @param paramName - The parameter name to check ("query" or "filter")
 * @param value - The value to match against
 * @returns true if the parameter matches the value exactly (case-insensitive)
 */
export const isExactParamMatch = (
  searchParams: ReadonlyURLSearchParams | null,
  paramName: "query" | "filter",
  value: string,
): boolean => {
  if (!searchParams || !value) return false;

  const paramValue = decodeURI(searchParams.get(paramName) ?? "").trim();
  const normalizedValue = value.toLowerCase().trim();

  return paramValue.toLowerCase() === normalizedValue;
};

/**
 * Check if any of multiple URLSearchParams match a value exactly (case-insensitive)
 * Useful when either query OR filter could match (filter takes precedence)
 *
 * @param searchParams - The URLSearchParams object (can be null)
 * @param value - The value to match against
 * @param paramOrder - Array of parameter names to check in order (default: ["filter", "query"])
 * @returns true if any parameter matches the value exactly
 */
export const isExactParamMatchAny = (
  searchParams: ReadonlyURLSearchParams | null,
  value: string,
  paramOrder: Array<"query" | "filter"> = ["filter", "query"],
): boolean => {
  if (!searchParams || !value) return false;

  for (const paramName of paramOrder) {
    if (isExactParamMatch(searchParams, paramName, value)) {
      return true;
    }
  }

  return false;
};
