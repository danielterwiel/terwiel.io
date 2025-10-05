"use client";

import * as Form from "@radix-ui/react-form";
import { clsx } from "clsx";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import React from "react";

import { Icon } from "~/components/icon";
import { debounce } from "~/utils/debounce";
import { getMagneticClasses } from "~/utils/icon-colors";

export const SearchInputContent = () => {
  const searchParams = useSearchParams();
  const initialQuery = decodeURIComponent(
    searchParams.get("search") ?? "",
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

  const debouncedSetSearchParams = debounce(setSearchParams, 1000);

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
