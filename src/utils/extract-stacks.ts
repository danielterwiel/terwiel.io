/**
 * Stack Extraction Utilities
 *
 * Provides functions for extracting and normalizing technology stacks
 * from project data. Handles parent-child relationships for stack grouping.
 *
 * @see STACK in src/data/stack.ts for the stack registry
 * @see getStackParent for parent-child resolution logic
 */

import type { Project, Stack, StackName } from "~/types";

import { STACK } from "~/data/stack";
import { getStackParent } from "~/utils/get-stack-parent";
import { getIconHexColor } from "~/utils/icon-colors";

/**
 * Normalize stack name to a URL-friendly slug
 *
 * Converts stack names to lowercase, removes dots, and replaces spaces with hyphens.
 * Used for generating stable IDs for stacks.
 *
 * @param name - The stack name to normalize
 * @returns URL-friendly slug version of the name
 *
 * @example
 * ```ts
 * normalizeStackName("React");           // "react"
 * normalizeStackName("Next.js");         // "nextjs"
 * normalizeStackName("Visual Basic.NET"); // "visual-basic-net"
 * ```
 */
function normalizeStackName(name: string): string {
  return name.toLowerCase().replace(/\./g, "").replace(/\s+/g, "-").trim();
}

/**
 * Extract unique stacks from all projects
 *
 * Collects all technology stacks from projects and deduplicates them.
 * Child stacks are merged into their parent (e.g., "Tanstack Query",
 * "Tanstack Router" become a single "Tanstack" entry).
 *
 * ## Parent-Child Merging
 *
 * When a stack item has a `parent` property, it's grouped under that parent.
 * The parent's icon and domain are used from the STACK registry if available.
 *
 * ## Sorting
 *
 * Results are sorted alphabetically by name for consistent UI ordering.
 *
 * @param projects - Array of projects to extract stacks from
 * @returns Deduplicated and sorted array of Stack objects
 *
 * @example
 * ```ts
 * const stacks = extractUniqueStacks(projects);
 * // Returns: [{ id: "react", name: "React", ... }, ...]
 * ```
 */
export function extractUniqueStacks(projects: Project[]): Stack[] {
  const stackMap = new Map<string, Stack>();
  const parentChildrenMap = new Map<string, Set<string>>();

  // First pass: collect all stacks and track parent-child relationships
  for (const project of projects) {
    for (const stackItem of project.stack) {
      const effectiveName = getStackParent(stackItem);

      // Track children for parent stacks
      if (stackItem.parent) {
        if (!parentChildrenMap.has(stackItem.parent)) {
          parentChildrenMap.set(stackItem.parent, new Set());
        }
        parentChildrenMap.get(stackItem.parent)?.add(stackItem.name);
      }

      // Skip if already processed (use effective name for deduplication)
      if (stackMap.has(effectiveName)) {
        continue;
      }

      // For child stacks, create entry using parent's name
      if (stackItem.parent) {
        // Use the parent's definition from STACK data if available, otherwise fall back to child's properties
        const parentStackDef = STACK[stackItem.parent as StackName];
        const iconKey = parentStackDef ? parentStackDef.icon : stackItem.icon;
        const domain = parentStackDef
          ? parentStackDef.domain
          : stackItem.domain;

        const stack: Stack = {
          id: normalizeStackName(stackItem.parent),
          name: stackItem.parent as StackName,
          iconKey,
          color: getIconHexColor(iconKey),
          domain,
        };
        stackMap.set(effectiveName, stack);
      } else {
        // Regular stack without parent
        const stack: Stack = {
          id: normalizeStackName(stackItem.name),
          name: stackItem.name as StackName,
          iconKey: stackItem.icon,
          color: getIconHexColor(stackItem.icon),
          domain: stackItem.domain,
        };
        stackMap.set(effectiveName, stack);
      }
    }
  }

  const stacks = Array.from(stackMap.values());

  // Sort alphabetically by name
  return stacks.sort((a, b) => a.name.localeCompare(b.name));
}
