"use client";

import { differenceInMonths, formatDuration, parseISO } from "date-fns";
import * as Form from "@radix-ui/react-form";
import React from "react";

import { type Project } from "./experience";

export const SearchContext = React.createContext<
  [string, React.Dispatch<React.SetStateAction<string>> | (() => void)]
>([
  "",
  () => {
    throw new Error("SearchContext not implemented");
  },
]);

export const SearchProvider = ({ children }: { children: React.ReactNode }) => {
  const [query, setQuery] = React.useState("");

  return (
    <SearchContext.Provider value={[query, setQuery]}>
      {children}
    </SearchContext.Provider>
  );
};

export function SearchInput() {
  const [query, setQuery] = React.useContext(SearchContext);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event?.target?.value);
  };

  return (
    <Form.Root className="print:hidden" onSubmit={(e) => e.preventDefault()}>
      <Form.Field name="query">
        <div>
          <Form.Label>Search query</Form.Label>
          <Form.Message match="typeMismatch">
            Please provide a your search query
          </Form.Message>
        </div>
        <Form.Control asChild>
          <input
            type="input"
            placeholder="e.g. Sendcloud, 2022, Rust"
            value={query}
            onChange={handleInputChange}
            className="w-full rounded-md border px-4 py-2 transition-colors hover:border-klein/50 focus:outline-none focus:ring-2 focus:ring-klein/70"
          />
        </Form.Control>
      </Form.Field>
    </Form.Root>
  );
}

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
    const dateTo = parseISO(project.dateTo);
    const diffInMonths = differenceInMonths(dateTo, dateFrom) + 1;
    monthsDiff.add(diffInMonths);
  }
  const monthsSum = Array.from(monthsDiff).reduce((acc, curr) => acc + curr, 0);
  const years = Math.floor(monthsSum / 12);
  const months = monthsSum % 12;

  const duration = formatDuration({ months, years });
  return (
    <div className="m4-8 rounded-md border-2 border-klein/50 px-3 py-6 text-center text-klein print:hidden">
      {total === 0 ? (
        <span>Your search did not return any projects</span>
      ) : (
        <>
          <div>
            Your search for{" "}
            <strong>
              <mark>{query}</mark>
            </strong>{" "}
            returned <strong>{total}</strong> projects with a total duration of{" "}
            <strong>{duration}</strong>.
          </div>
        </>
      )}
    </div>
  );
};
