import type { StackItem } from "~/types";

/**
 * Get the effective name for a stack item (parent if exists, otherwise the stack name)
 * Used to group child stacks under their parent
 */
export function getStackParent(stack: StackItem): string;
export function getStackParent(stackName: string, parent?: string): string;
export function getStackParent(
  stackOrName: StackItem | string,
  parent?: string,
): string {
  if (typeof stackOrName === "string") {
    return parent ?? stackOrName;
  }
  return stackOrName.parent ?? stackOrName.name;
}

/**
 * Check if a stack item or name matches a given parent name
 */
export function matchesParent(
  stackOrName: StackItem | string,
  parentName: string,
  stackParent?: string,
): boolean {
  const effectiveParent =
    typeof stackOrName === "string"
      ? getStackParent(stackOrName, stackParent)
      : getStackParent(stackOrName);

  const effectiveName =
    typeof stackOrName === "string" ? stackOrName : stackOrName.name;

  return (
    effectiveParent.toLowerCase() === parentName.toLowerCase() ||
    effectiveName.toLowerCase() === parentName.toLowerCase()
  );
}
