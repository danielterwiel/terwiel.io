import type { ReadonlyURLSearchParams } from "next/navigation";

export const getSearchQuery = (
  searchParams: ReadonlyURLSearchParams | null,
): string => {
  return decodeURI(searchParams?.get("search") ?? "").trim();
};
