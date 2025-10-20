"use client";

import { differenceInMonths, formatDuration, parseISO } from "date-fns";

import { useEffect, useRef } from "react";

import type { Project } from "~/types";

import { useToasts } from "~/hooks/use-toasts";

interface SearchToastQueuedProps {
  query: string;
  items: Project[];
}

/**
 * Search toast that uses the queue system for multiple simultaneous toasts
 * Each search triggers a new toast that's added to the queue
 */
export const SearchToastQueued: React.FC<SearchToastQueuedProps> = ({
  query,
  items,
}) => {
  const { addToast } = useToasts();
  const lastQueryRef = useRef<string>("");

  useEffect(() => {
    // Only add a new toast if the query has changed and is not empty
    if (query && query !== lastQueryRef.current) {
      lastQueryRef.current = query;

      const total = items.length;
      const monthsDiff = new Set<number>();

      for (const project of items) {
        const dateFrom = parseISO(project.dateFrom);
        const dateTo =
          project.dateTo === "present"
            ? parseISO(new Date().toISOString())
            : parseISO(project.dateTo);
        const diffInMonths = differenceInMonths(dateTo, dateFrom) + 1;
        monthsDiff.add(diffInMonths);
      }

      const monthsSum = Array.from(monthsDiff).reduce(
        (acc, curr) => acc + curr,
        0,
      );
      const years = Math.floor(monthsSum / 12);
      const months = monthsSum % 12;

      const duration = formatDuration(
        { months, years },
        { delimiter: " and " },
      );

      if (total === 0) {
        addToast(
          "No results",
          `Your search for "${query}" did not return any projects.`,
          "default",
        );
      } else {
        addToast(
          "Search results",
          `Your search for "${query}" returned ${total} project${total !== 1 ? "s" : ""} with a total duration of ${duration}.`,
          "default",
        );
      }
    }
  }, [query, items, addToast]);

  // This component doesn't render anything - it only triggers toast notifications
  return null;
};
