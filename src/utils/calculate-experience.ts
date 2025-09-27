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
  dateTo: string
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
  projects: Project[]
): StackExperience[] {
  const stackMap = new Map<string, StackExperience>();

  projects.forEach((project) => {
    const projectDuration = calculateProjectDuration(
      project.dateFrom,
      project.dateTo
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
    (a, b) => b.totalMonths - a.totalMonths
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
    minScale: 0.7,
    maxScale: 1.1, // Further reduced to 1.1 for smaller large icons
    baseRadius: 35,
  }
): number {
  if (allExperiences.length === 0) return config.baseRadius;

  const maxExperience = Math.max(
    ...allExperiences.map((exp) => exp.totalMonths)
  );
  const minExperience = Math.min(
    ...allExperiences.map((exp) => exp.totalMonths)
  );

  // Avoid division by zero
  if (maxExperience === minExperience) return config.baseRadius;

  // Normalize experience to 0-1 range
  const normalizedExperience =
    (totalMonths - minExperience) / (maxExperience - minExperience);

  // Apply more aggressive diminishing returns using square root scaling
  // This further discriminates against larger nodes by reducing their growth rate
  const diminished = Math.sqrt(normalizedExperience);

  // Apply additional diminishing returns for very high experience
  const doubleReduced = Math.sqrt(diminished);

  // Apply smooth easing for visual appeal
  const eased = 1 - (1 - doubleReduced) ** 1.2;

  // Scale between min and max with the diminished factor
  const scale = config.minScale + eased * (config.maxScale - config.minScale);

  return Math.round(config.baseRadius * scale);
}
