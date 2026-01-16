import { differenceInMonths, parseISO } from "date-fns";

import type { Project } from "~/types";

import { getStackParent } from "~/utils/get-stack-parent";

type StackExperience = {
  name: string;
  totalMonths: number;
  firstUsed: Date;
  lastUsed: Date;
};

/**
 * Calculate total experience duration for each stack across all projects
 * Groups child stacks with their parent (e.g., "Tanstack Query" + "Tanstack Router" -> "Tanstack")
 * Deduplicates within each project to avoid double-counting when both parent and child exist
 */
function calculateStackExperiences(
  projects: Project[],
): Map<string, StackExperience> {
  const experienceMap = new Map<string, StackExperience>();

  for (const project of projects) {
    const isPresent = project.dateTo === "present";
    const from = parseISO(project.dateFrom);
    const to = parseISO(isPresent ? new Date().toISOString() : project.dateTo);
    const months = differenceInMonths(to, from) + 1;

    // Deduplicate stacks within this project by effective name (parent or self)
    const uniqueStacksInProject = new Set<string>();
    for (const stackItem of project.stack) {
      uniqueStacksInProject.add(getStackParent(stackItem));
    }

    // Add experience for each unique stack in this project
    for (const effectiveName of uniqueStacksInProject) {
      const existing = experienceMap.get(effectiveName);
      if (existing) {
        existing.totalMonths += months;
        existing.firstUsed =
          existing.firstUsed < from ? existing.firstUsed : from;
        existing.lastUsed = existing.lastUsed > to ? existing.lastUsed : to;
      } else {
        experienceMap.set(effectiveName, {
          name: effectiveName,
          totalMonths: months,
          firstUsed: from,
          lastUsed: to,
        });
      }
    }
  }

  return experienceMap;
}

/**
 * Calculate recency multiplier: -0.25 (very old) to +0.25 (very recent)
 * Maps the last usage date to a position in the overall timeline
 */
function calculateRecencyMultiplier(
  lastUsed: Date,
  oldestDate: Date,
  newestDate: Date,
): number {
  const totalRange = newestDate.getTime() - oldestDate.getTime();
  if (totalRange === 0) return 0;

  const position = (lastUsed.getTime() - oldestDate.getTime()) / totalRange;
  return -0.25 + position * 0.5; // Maps 0→-0.25, 1→+0.25
}

/**
 * Calculate median from sorted array
 */
function median(sortedValues: number[]): number {
  if (sortedValues.length === 0) return 0;
  const mid = Math.floor(sortedValues.length / 2);
  if (sortedValues.length % 2 === 0) {
    return ((sortedValues[mid - 1] ?? 0) + (sortedValues[mid] ?? 0)) / 2;
  }
  return sortedValues[mid] ?? 0;
}

/**
 * Calculate size factors for each stack based on experience duration and recency
 *
 * Algorithm:
 * 1. Calculate total experience months per stack across all projects
 * 2. Use median experience as baseline (factor = 1.0)
 * 3. Apply recency multiplier: -25% (old) to +25% (recent)
 * 4. Constrain factors between 75% and 250% of baseline
 * 5. Normalize to maintain constant total surface area
 *
 * @param projects - All projects to analyze
 * @returns Map of stack name to size factor (1.0 = baseline)
 */
export function calculateStackSizeFactors(
  projects: Project[],
): Map<string, number> {
  const experiences = calculateStackExperiences(projects);
  const stacks = Array.from(experiences.values());

  // Edge case: no stacks
  if (stacks.length === 0) return new Map();

  // Find date range for recency calculation
  const oldestDate = new Date(
    Math.min(...stacks.map((s) => s.firstUsed.getTime())),
  );
  const newestDate = new Date(
    Math.max(...stacks.map((s) => s.lastUsed.getTime())),
  );

  // Calculate median experience months (baseline, toSorted for immutability)
  const monthsArray = stacks
    .map((s) => s.totalMonths)
    .toSorted((a, b) => a - b);
  const medianMonths = median(monthsArray);

  // Avoid division by zero
  const baselineMonths = medianMonths > 0 ? medianMonths : 1;

  // Calculate raw factors before normalization
  const rawFactors = new Map<string, number>();

  for (const stack of stacks) {
    // Base factor: ratio of this stack's experience to median
    let factor = stack.totalMonths / baselineMonths;

    // Apply recency multiplier
    const recencyMult = calculateRecencyMultiplier(
      stack.lastUsed,
      oldestDate,
      newestDate,
    );
    factor *= 1 + recencyMult;

    // Constrain to 75%-250% of baseline
    factor = Math.max(0.75, Math.min(2.5, factor));

    rawFactors.set(stack.name, factor);
  }

  // Normalize to maintain constant total surface area
  // Surface area ∝ r², so total area ∝ Σ(factor²)
  // We want the total area to equal what it would be if all factors were 1.0
  const baselineArea = stacks.length; // n circles with factor=1
  const actualArea = Array.from(rawFactors.values()).reduce(
    (sum, f) => sum + f * f,
    0,
  );

  const normalizationFactor = Math.sqrt(baselineArea / actualArea);

  // Apply normalization and re-constrain
  const normalizedFactors = new Map<string, number>();
  for (const [name, factor] of rawFactors) {
    const normalized = factor * normalizationFactor;
    // Re-apply constraints after normalization (may slightly change total area)
    const constrained = Math.max(0.75, Math.min(2.5, normalized));
    normalizedFactors.set(name, constrained);
  }

  return normalizedFactors;
}
