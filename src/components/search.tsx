"use client";

import * as Form from "@radix-ui/react-form";
import { clsx } from "clsx";
import { differenceInMonths, formatDuration, parseISO } from "date-fns";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import React from "react";

import type { Project } from "~/data/projects";
import { getMagneticClasses } from "~/utils/icon-colors";
import { Icon } from "./icon";

function debounce<T extends (query: string) => unknown>(
  func: T,
  wait: number
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

const SearchInputContent = () => {
  const searchParams = useSearchParams();
  const initialQuery = decodeURIComponent(
    searchParams.get("search") ?? ""
  ).trim();
  const router = useRouter();
  const pathname = usePathname();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [query, setQuery] = React.useState(initialQuery);
  const [isHovered, setIsHovered] = React.useState(false);
  const [isFocused, setIsFocused] = React.useState(false);

  React.useEffect(() => {
    if (!inputRef.current) {
      return;
    }

    if (document.activeElement !== inputRef.current) {
      setQuery(initialQuery);
    }
  }, [initialQuery]);

  function setSearchParams(query: string) {
    const encodedValue = encodeURIComponent(query);
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

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const clear = () => {
    setQuery("");
    setSearchParams("");
    inputRef.current?.focus();
  };

  const magneticClasses = getMagneticClasses(undefined, {
    component: "input",
    isHovered,
    isFocused,
    hasQuery: !!query,
    includeAnimation: isFocused,
    withRing: false, // Explicitly disable ring for input to avoid border conflicts
  });

  return (
    <Form.Root className="print:hidden" onSubmit={(e) => e.preventDefault()}>
      <Form.Field name="query">
        <div>
          <Form.Label className="sr-only">Search query</Form.Label>
          <Form.Message match="typeMismatch">
            Please provide a your search query
          </Form.Message>
        </div>
        <fieldset
          className={clsx("group relative", magneticClasses)}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <Form.Control asChild>
            <input
              ref={inputRef}
              type="input"
              placeholder="Search - e.g. Rust, 2022, Logistics"
              value={query}
              onChange={handleInputChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              className="w-full rounded-md border-0 bg-transparent py-3 px-10 text-slate-900 placeholder:text-slate-500"
            />
          </Form.Control>
          <Icon.Search
            className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-300 ${
              isFocused || query
                ? "text-klein"
                : isHovered
                  ? "text-slate-600"
                  : "text-slate-400"
            }`}
            aria-hidden="true"
            focusable="false"
          />

          {query ? (
            <button
              type="reset"
              onClick={clear}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-sm p-1 text-slate-400 transition-colors duration-300 outline-offset-4 hover:text-klein focus:text-klein focus:outline-2"
            >
              <Icon.X aria-hidden="true" focusable="false" />
              <span className="sr-only">Clear search input</span>
            </button>
          ) : null}
        </fieldset>
      </Form.Field>
    </Form.Root>
  );
};

export function SearchInput() {
  return (
    <React.Suspense
      fallback={<div className="print:hidden">Loading search...</div>}
    >
      <SearchInputContent />
    </React.Suspense>
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
