import type { Project } from "~/data/projects";
import type { IconNode } from "../types/icon-node";
import {
  calculateExperienceScale,
  calculateScaleLevel,
  calculateStackExperience,
} from "~/utils/calculate-experience";
import { generateStackUrl } from "~/utils/generate-stack-url";

export function extractUniqueIcons(
  projects: Project[],
  width: number,
  height: number,
): IconNode[] {
  const iconMap = new Map<string, IconNode>();
  let idCounter = 0;

  // Calculate experience for all stack items
  const stackExperience = calculateStackExperience(projects);

  // Create a map for quick experience lookup by stack name
  const experienceMap = new Map(stackExperience.map((exp) => [exp.name, exp]));

  // Extract stack icons
  projects.forEach((project) => {
    project.stack.forEach((stackItem) => {
      if (!iconMap.has(stackItem.icon)) {
        // Get experience for this stack item
        const experience = experienceMap.get(stackItem.name);

        // Calculate dynamic radius and scale level based on experience
        const baseRadius = 35;
        const dynamicRadius = experience
          ? calculateExperienceScale(experience.totalMonths, stackExperience, {
              minScale: 1.0,
              maxScale: 3.0, // Updated to 1-3 ratio
              baseRadius,
            })
          : baseRadius;

        // Calculate scale level for Tailwind classes
        const scaleLevel = experience
          ? calculateScaleLevel(experience.totalMonths, stackExperience)
          : 5; // Default middle scale

        iconMap.set(stackItem.icon, {
          id: `stack-${idCounter++}`,
          name: stackItem.name,
          ...(stackItem.parent && { parent: stackItem.parent }),
          icon: stackItem.icon,
          url: stackItem.url ?? generateStackUrl(stackItem.name),
          r: dynamicRadius,
          scaleLevel,
          group: 1, // Stack icons
          domain: stackItem.domain,
        });
      }
    });
  });

  const nodes = Array.from(iconMap.values());

  // Pre-position nodes in a grid pattern to prevent initial overlapping
  const cols = Math.ceil(Math.sqrt(nodes.length));
  const spacing = Math.min(width / cols, height / cols) * 0.8;
  const startX = (width - (cols - 1) * spacing) / 2;
  const startY = (height - Math.ceil(nodes.length / cols - 1) * spacing) / 2;

  nodes.forEach((node, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    node.x = startX + col * spacing;
    node.y = startY + row * spacing;
  });

  return nodes;
}
