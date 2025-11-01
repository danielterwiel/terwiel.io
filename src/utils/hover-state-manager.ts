import type { ReadonlyURLSearchParams } from "next/navigation";

import type { Domain, Project, Stack } from "~/types";

import { matchesDomainName } from "~/utils/get-domain-names";
import { getSearchFilter } from "~/utils/search-params";
import { isStackSelected } from "~/utils/stack-selection";

/**
 * Flexible stack-like type that matches both Stack and component state types
 */
type StackLike = {
  id: string;
  name: string;
  domain: Domain;
};

/**
 * Determines if a stack hover is "active" (hovering a different stack than selected)
 * vs "passive" (hovering the same stack that's already selected)
 */
export function isActiveStackHover(
  hoveredStack: StackLike | null,
  searchParams: ReadonlyURLSearchParams | null,
  stacks: Stack[],
  projects: Project[],
): boolean {
  if (!hoveredStack) return false;

  // Find the currently selected stack from search params
  const selectedStack = stacks.find((s) =>
    isStackSelected(s, searchParams, projects),
  );

  // Active hover: hovering a stack that's not the selected one (or no selection)
  return selectedStack === undefined || hoveredStack.id !== selectedStack.id;
}

/**
 * Gets the appropriate hover stack to display based on current state
 * Used for determining what to show when mouse leaves a node
 */
export function getHoverStackOnLeave(
  searchParams: ReadonlyURLSearchParams | null,
  stacks: Stack[],
  projects: Project[],
): Stack | null {
  const filter = getSearchFilter(searchParams);

  // DEBUG
  const query = searchParams?.get("query") ?? "";
  console.log(`[getHoverStackOnLeave] filter="${filter}" query="${query}"`);

  if (!filter) return null;

  // Don't show stack if a domain is selected
  const isDomainSelected = matchesDomainName(filter, projects) !== null;
  if (isDomainSelected) return null;

  // Show the selected stack (if any)
  return stacks.find((s) => isStackSelected(s, searchParams, projects)) ?? null;
}
