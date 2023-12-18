"use client";

import React from "react";
import * as Form from "@radix-ui/react-form";
import { differenceInMonths, formatDuration, parseISO } from "date-fns";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

import { type Project } from "./experience";
import { Icon } from "./icon";

function debounce<T extends (query: string) => unknown>(
  func: T,
  wait: number,
): (...funcArgs: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(query: string) {
    const later = () => {
      timeout = null;
      func(query);
    };

    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(later, wait);
  };
}

export function SearchInput() {
  const searchParams = useSearchParams();
  const initialQuery = decodeURI(searchParams.get("search") ?? "").trim();
  const router = useRouter();
  const pathname = usePathname();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [query, setQuery] = React.useState(initialQuery);

  React.useEffect(() => {
    if (!inputRef.current) {
      return;
    }

    if (document.activeElement !== inputRef.current) {
      setQuery(initialQuery);
    }
  }, [initialQuery]);

  function setSearchParams(query: string) {
    const encodedValue = encodeURI(query);
    const url = encodedValue ? `${pathname}?search=${encodedValue}` : pathname;
    router.replace(url, {
      scroll: false,
    });
  }

  const debouncedSetSearchParams = debounce(setSearchParams, 250);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event?.target?.value;
    setQuery(value);
    debouncedSetSearchParams(value);
  };

  const clear = () => {
    setQuery("");
    setSearchParams("");
    inputRef.current?.focus();
  };

  return (
    <Form.Root
      className="h-20 print:hidden"
      onSubmit={(e) => e.preventDefault()}
    >
      <Form.Field name="query">
        <div>
          <Form.Label>Search query</Form.Label>
          <Form.Message match="typeMismatch">
            Please provide a your search query
          </Form.Message>
        </div>
        <div className="group relative">
          <Form.Control asChild>
            <input
              ref={inputRef}
              type="input"
              placeholder="e.g. Sendcloud, 2022, Rust"
              value={query}
              onChange={handleInputChange}
              className="absolute w-full rounded-md border border-slate-500/50 py-2 pl-9 hover:border-klein focus:ring-klein focus:ring-offset-2"
            />
          </Form.Control>
          <Icon.Search
            className="absolute left-2 top-2.5 text-slate-400/50"
            aria-hidden="true"
            focusable="false"
          />

          {query ? (
            <button
              type="reset"
              onClick={clear}
              className="absolute right-3 top-3 hidden rounded-sm text-slate-400/50 outline-offset-4 hover:text-klein/80 focus:text-klein focus:outline-2 group-focus-within:block"
            >
              <Icon.X aria-hidden="true" focusable="false" />
              <span className="sr-only">Clear search input</span>
            </button>
          ) : (
            <></>
          )}
        </div>
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
    <div className="rounded-md border-2 border-klein/50 px-3 py-6 text-center text-klein print:hidden">
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
