/**
 * Experience Duration Calculation Utilities
 *
 * Provides functions for calculating project durations from date ranges.
 * Uses date-fns for date parsing and formatting.
 */

import { differenceInMonths, formatDuration, parseISO } from "date-fns";

import type { ExperienceDuration } from "~/types";

/**
 * Calculate the duration of a project from its date range
 *
 * Handles the special case of "Present" for ongoing projects by using
 * the current date. Adds 1 to include the starting month in the count.
 *
 * @param dateFrom - Start date in ISO format (e.g., "2023-01")
 * @param dateTo - End date in ISO format or "Present" for ongoing projects
 * @returns ExperienceDuration object with totalMonths, years, months, and formatted duration
 *
 * @example
 * ```ts
 * // Completed project
 * calculateProjectDuration("2023-01", "2024-06");
 * // { totalMonths: 18, years: 1, months: 6, duration: "1 year 6 months" }
 *
 * // Ongoing project
 * calculateProjectDuration("2024-01", "Present");
 * // { totalMonths: 12, years: 1, months: 0, duration: "1 year" }
 * ```
 */
export function calculateProjectDuration(
  dateFrom: string,
  dateTo: string,
): ExperienceDuration {
  const isPresent = dateTo === "Present";
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
