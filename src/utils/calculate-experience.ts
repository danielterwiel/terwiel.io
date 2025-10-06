import { differenceInMonths, formatDuration, parseISO } from "date-fns";

import type { ExperienceDuration } from "~/types";

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
