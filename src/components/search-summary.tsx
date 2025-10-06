"use client";

import { differenceInMonths, formatDuration, parseISO } from "date-fns";

import type { Project } from "~/types";

export const SearchSummary = ({
  query,
  items,
}: {
  query: string;
  items: Project[];
}) => {
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
  const monthsSum = Array.from(monthsDiff).reduce((acc, curr) => acc + curr, 0);
  const years = Math.floor(monthsSum / 12);
  const months = monthsSum % 12;

  const duration = formatDuration({ months, years }, { delimiter: " and " });

  return (
    <div className="px-6 py-6 text-center text-klein print:hidden border-klein border-2 w-full">
      {total === 0 ? (
        <span>Your search did not return any projects</span>
      ) : (
        <div>
          Your search for{" "}
          <strong>
            <mark className="bg-klein/10 px-1 rounded">{query}</mark>
          </strong>{" "}
          returned <strong>{total}</strong> projects with a total duration of{" "}
          <strong>{duration}</strong>.
        </div>
      )}
    </div>
  );
};
