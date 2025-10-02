import type { StackName } from "~/data/icons";
import type { Domain, Project } from "~/data/projects";
import { getIconHexColor } from "~/utils/icon-colors";

export type Stack = {
  id: string; // Normalized slug: "react", "typescript"
  name: StackName; // Display name: "React", "TypeScript"
  iconKey: string; // Icon key: "BrandReact", "BrandTypescript"
  color: string; // Hex: "#61DAFB", "#3178C6"
  domain: Domain; // "Front-end", "Back-end", "DevOps", "Design"
  parent?: string; // Optional parent (e.g., "Tanstack")
};

/**
 * Normalize stack name to a URL-friendly slug
 * Examples: "React" -> "react", "Next.js" -> "nextjs", "Visual Basic.NET" -> "visual-basic-net"
 */
function normalizeStackName(name: string): string {
  return name.toLowerCase().replace(/\./g, "").replace(/\s+/g, "-").trim();
}

/**
 * Extract unique stacks from all projects
 * Deduplicates by name and transforms to Stack schema with icon/color lookup
 * Sorts alphabetically by name for consistent ordering
 */
export function extractUniqueStacks(projects: Project[]): Stack[] {
  const stackMap = new Map<string, Stack>();

  for (const project of projects) {
    for (const stackItem of project.stack) {
      // Skip if already processed
      if (stackMap.has(stackItem.name)) {
        continue;
      }

      // Create Stack object with all required fields
      const stack: Stack = {
        id: normalizeStackName(stackItem.name),
        name: stackItem.name as StackName,
        iconKey: stackItem.icon,
        color: getIconHexColor(stackItem.icon),
        domain: stackItem.domain,
        ...(stackItem.parent ? { parent: stackItem.parent } : {}),
      };

      stackMap.set(stackItem.name, stack);
    }
  }

  // Convert to array and sort alphabetically by name
  return Array.from(stackMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name),
  );
}
