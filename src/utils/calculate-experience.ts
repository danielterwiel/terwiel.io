import { differenceInMonths, formatDuration, parseISO } from "date-fns";

import type { Project } from "~/data/projects";

export type ExperienceDuration = {
  totalMonths: number;
  years: number;
  months: number;
  duration: string;
};

export function calculateProjectDuration(
  dateFrom: string,
  dateTo: string,
): ExperienceDuration {
  const isPresent = dateTo === "present";
  const from = parseISO(dateFrom);
  const to = parseISO(isPresent ? new Date().toISOString() : dateTo);
  const totalMonths = differenceInMonths(to, from) + 1;
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  const duration = formatDuration({ months, years });

  return {
    totalMonths,
    years,
    months,
    duration,
  };
}

export type StackExperience = {
  name: string;
  icon: string;
  totalMonths: number;
  years: number;
  months: number;
  projects: string[];
};

export function calculateStackExperience(
  projects: Project[],
): StackExperience[] {
  const stackMap = new Map<string, StackExperience>();

  projects.forEach((project) => {
    const projectDuration = calculateProjectDuration(
      project.dateFrom,
      project.dateTo,
    );

    project.stack.forEach((stackItem) => {
      const existing = stackMap.get(stackItem.name);
      if (existing) {
        existing.totalMonths += projectDuration.totalMonths;
        existing.projects.push(project.company);
      } else {
        stackMap.set(stackItem.name, {
          name: stackItem.name,
          icon: stackItem.icon,
          totalMonths: projectDuration.totalMonths,
          years: Math.floor(projectDuration.totalMonths / 12),
          months: projectDuration.totalMonths % 12,
          projects: [project.company],
        });
      }
    });
  });

  // Recalculate years and months for accumulated experience
  for (const experience of stackMap.values()) {
    experience.years = Math.floor(experience.totalMonths / 12);
    experience.months = experience.totalMonths % 12;
  }

  return Array.from(stackMap.values()).sort(
    (a, b) => b.totalMonths - a.totalMonths,
  );
}

export type ScalingConfig = {
  minScale: number;
  maxScale: number;
  baseRadius: number;
};

export function calculateExperienceScale(
  totalMonths: number,
  allExperiences: StackExperience[],
  config: ScalingConfig = {
    minScale: 1.0,
    maxScale: 3.0, // 1-3 ratio as requested
    baseRadius: 35,
  },
): number {
  if (allExperiences.length === 0) return config.baseRadius;

  const maxExperience = Math.max(
    ...allExperiences.map((exp) => exp.totalMonths),
  );
  const minExperience = Math.min(
    ...allExperiences.map((exp) => exp.totalMonths),
  );

  // Avoid division by zero
  if (maxExperience === minExperience) return config.baseRadius;

  // Normalize experience to 0-1 range
  const normalizedExperience =
    (totalMonths - minExperience) / (maxExperience - minExperience);

  // Apply linear scaling (no discrimination against larger nodes)
  const scale =
    config.minScale +
    normalizedExperience * (config.maxScale - config.minScale);

  return Math.round(config.baseRadius * scale);
}

/**
 * Calculate a scale level (1-10) for Tailwind class generation
 * Maps experience to discrete scale levels for consistent styling
 */
export function calculateScaleLevel(
  totalMonths: number,
  allExperiences: StackExperience[],
): number {
  if (allExperiences.length === 0) return 5; // Default middle scale

  const maxExperience = Math.max(
    ...allExperiences.map((exp) => exp.totalMonths),
  );
  const minExperience = Math.min(
    ...allExperiences.map((exp) => exp.totalMonths),
  );

  // Avoid division by zero
  if (maxExperience === minExperience) return 5;

  // Normalize experience to 0-1 range
  const normalizedExperience =
    (totalMonths - minExperience) / (maxExperience - minExperience);

  // Map to scale levels 1-10 (1 = smallest, 10 = largest)
  const scaleLevel = Math.round(1 + normalizedExperience * 9);

  return Math.max(1, Math.min(10, scaleLevel));
}
