import type { Project, Stack, StackName } from "~/types";

import { getStackParent } from "~/utils/get-stack-parent";
import { getIconHexColor } from "~/utils/icon-colors";

/**
 * Normalize stack name to a URL-friendly slug
 * Examples: "React" -> "react", "Next" -> "nextjs", "Visual Basic.NET" -> "visual-basic-net"
 */
function normalizeStackName(name: string): string {
  return name.toLowerCase().replace(/\./g, "").replace(/\s+/g, "-").trim();
}

/**
 * Extract unique stacks from all projects
 * Merges child stacks with the same parent into a single node
 * For example: "Tanstack Query", "Tanstack Router", "Tanstack Start" -> "Tanstack"
 * Sorts alphabetically by name for consistent ordering
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
        // Use the first child's properties, but with parent's name
        const stack: Stack = {
          id: normalizeStackName(stackItem.parent),
          name: stackItem.parent as StackName,
          iconKey: stackItem.icon,
          color: getIconHexColor(stackItem.icon),
          domain: stackItem.domain,
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
