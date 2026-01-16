import { differenceInMonths, max, min, parseISO } from "date-fns";

import type { DateRange, MergedExperience } from "~/types";

/**
 * Merges overlapping date ranges and calculates total experience
 * This prevents double-counting months when projects overlap
 */
export function mergeDateRanges(ranges: DateRange[]): MergedExperience {
  if (ranges.length === 0) {
    return { totalMonths: 0, years: 0, months: 0 };
  }

  // Parse and sort ranges by start date (toSorted for immutability)
  const parsedRanges = ranges
    .map((range) => ({
      from: parseISO(range.from),
      to: parseISO(
        range.to === "present" ? new Date().toISOString() : range.to,
      ),
    }))
    .toSorted((a, b) => a.from.getTime() - b.from.getTime());

  // Merge overlapping ranges
  const merged: Array<{ from: Date; to: Date }> = [];
  let current = parsedRanges[0];

  if (!current) {
    return { totalMonths: 0, years: 0, months: 0 };
  }

  for (let i = 1; i < parsedRanges.length; i++) {
    const next = parsedRanges[i];
    if (!next) continue;

    // If current range overlaps or touches the next range, merge them
    if (current.to >= next.from) {
      current = {
        from: min([current.from, next.from]),
        to: max([current.to, next.to]),
      };
    } else {
      // No overlap, push current and start new range
      merged.push(current);
      current = next;
    }
  }
  merged.push(current);

  // Calculate total months from merged ranges
  let totalMonths = 0;
  for (const range of merged) {
    totalMonths += differenceInMonths(range.to, range.from) + 1;
  }

  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

  return {
    totalMonths,
    years,
    months,
  };
}
