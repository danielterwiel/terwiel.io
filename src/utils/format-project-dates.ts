import { format, parseISO } from "date-fns";

export const isProjectPresent = (dateTo: string): boolean => {
  return dateTo === "present";
};

export const parseProjectEndDate = (dateTo: string): Date => {
  const isPresent = isProjectPresent(dateTo);
  return parseISO(isPresent ? new Date().toISOString() : dateTo);
};

export const addApostropheToYear = (dateStr: string): string => {
  return dateStr.replace(/\d+/g, "'$&");
};

export const formatProjectTimespan = (
  dateFrom: string,
  dateTo: string,
): string => {
  const dateFromParsed = parseISO(dateFrom);
  const dateToParsed = parseProjectEndDate(dateTo);
  const isPresent = isProjectPresent(dateTo);

  const from = format(dateFromParsed, "MMM yy");
  const to = format(dateToParsed, "MMM yy");
  const fromApos = addApostropheToYear(from);
  const toApos = addApostropheToYear(to);

  return `${fromApos} - ${isPresent ? "present" : toApos}`;
};
