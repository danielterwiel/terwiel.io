"use client";

import { differenceInMonths, formatDuration, parseISO } from "date-fns";

import { useEffect, useRef } from "react";

import type { Project } from "~/types";

import { PROJECTS } from "~/data/projects";
import { useToasts } from "~/hooks/use-toasts";
import { adjustExperience } from "~/utils/adjust-experience";
import { calculateDomainExperience } from "~/utils/calculate-domain-experience";
import { calculateStackExperience } from "~/utils/calculate-stack-experience";

interface SearchToastQueuedProps {
  query: string;
  items: Project[];
  filterType?: "search" | "domain" | "tech" | "project" | null;
}

/**
 * Search toast that uses the Base UI toast system for multiple simultaneous toasts
 * Each search triggers a new toast that's added to the queue
 */
export const SearchToastQueued: React.FC<SearchToastQueuedProps> = ({
  query,
  items,
  filterType,
}) => {
  const toast = useToasts();
  const lastQueryRef = useRef<string>("");

  useEffect(() => {
    // Only add a new toast if the query has changed and is not empty
    if (query && query !== lastQueryRef.current) {
      lastQueryRef.current = query;

      const total = items.length;

      // Calculate experience based on filter type to match RootNodeExperience
      let experience: { years: number; months: number };

      if (filterType === "domain") {
        // Use domain-specific experience calculation (accounts for overlaps)
        experience = calculateDomainExperience(PROJECTS, query);
      } else if (filterType === "tech") {
        // Use stack-specific experience calculation (accounts for overlaps)
        experience = calculateStackExperience(PROJECTS, query);
      } else {
        // For "project", "search", or null: calculate from filtered items
        // This sums up individual project durations (may not account for overlaps)
        let totalMonths = 0;
        for (const project of items) {
          const dateFrom = parseISO(project.dateFrom);
          const dateTo =
            project.dateTo === "present"
              ? parseISO(new Date().toISOString())
              : parseISO(project.dateTo);
          const diffInMonths = differenceInMonths(dateTo, dateFrom) + 1;
          totalMonths += diffInMonths;
        }
        const years = Math.floor(totalMonths / 12);
        const months = totalMonths % 12;
        experience = { years, months };
      }

      // Apply the same adjustment logic as RootNodeExperience for consistent display
      experience = adjustExperience(experience);

      const duration = formatDuration(
        { years: experience.years, months: experience.months },
        { delimiter: " and " },
      );

      // Determine the title and description based on filter type
      let title: string;
      let description: string;

      if (total === 0) {
        title = "No results";
        description = `No projects match "${query}".`;
      } else {
        // Generate context-aware title based on filter type
        switch (filterType) {
          case "domain":
            title = `Showing projects in: ${query}`;
            break;
          case "tech":
            title = `Showing work with: ${query}`;
            break;
          case "project":
            title = `Projects tagged as: ${query}`;
            break;
          default:
            title = `Results for: ${query}`;
            break;
        }

        // Generate description with experience duration
        const projectWord = total === 1 ? "project" : "projects";
        description = `${total} ${projectWord} — ${duration}`;
      }

      toast.add({
        title,
        description,
      });
    }
  }, [query, items, toast, filterType]);

  // This component doesn't render anything - it only triggers toast notifications
  return null;
};
