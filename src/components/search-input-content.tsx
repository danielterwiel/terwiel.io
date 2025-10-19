"use client";

import * as Form from "@radix-ui/react-form";
import { clsx } from "clsx";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import React from "react";

import { Icon } from "~/components/icon";
import { debounce } from "~/utils/debounce";
import { getMagneticClasses } from "~/utils/icon-colors";

interface SearchInputContentProps {
  onCloseEmpty?: () => void;
}

export const SearchInputContent = React.forwardRef<
  HTMLInputElement,
  SearchInputContentProps
>(({ onCloseEmpty }, forwardedRef) => {
  const searchParams = useSearchParams();
  const initialQuery = decodeURIComponent(
    searchParams.get("search") ?? "",
  ).trim();
  const router = useRouter();
  const pathname = usePathname();
  const internalRef = React.useRef<HTMLInputElement>(null);
  const inputRef = (forwardedRef ||
    internalRef) as React.RefObject<HTMLInputElement>;
  const [query, setQuery] = React.useState(initialQuery);
  const [isHovered, setIsHovered] = React.useState(false);
  const [isFocused, setIsFocused] = React.useState(false);

  // Create debounced function once and persist it across renders
  const debouncedSetSearchParamsRef = React.useRef<
    (((query: string) => void) & { cancel: () => void }) | null
  >(null);

  React.useEffect(() => {
    // Initialize the debounced function only once
    if (!debouncedSetSearchParamsRef.current) {
      debouncedSetSearchParamsRef.current = debounce((query: string) => {
        const encodedValue = encodeURIComponent(query);
        const url = encodedValue
          ? `${pathname}?search=${encodedValue}`
          : pathname;
        router.replace(url, {
          scroll: false,
        });
      }, 1000);
    }
  }, [pathname, router]);

  React.useEffect(() => {
    const input =
      "current" in inputRef ? inputRef.current : (inputRef as HTMLInputElement);
    if (!input) {
      return;
    }

    if (document.activeElement !== input) {
      setQuery(initialQuery);
    }
  }, [initialQuery, inputRef]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event?.target?.value;
    setQuery(value);
    if (debouncedSetSearchParamsRef.current) {
      debouncedSetSearchParamsRef.current(value);
    }
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
    if (query === "") {
      // If query is already empty, close the search input
      onCloseEmpty?.();
    } else {
      // If query has content, clear it
      // Cancel any pending debounced update to prevent race condition
      debouncedSetSearchParamsRef.current?.cancel();
      setQuery("");
      const encodedValue = encodeURIComponent("");
      const url = encodedValue
        ? `${pathname}?search=${encodedValue}`
        : pathname;
      router.replace(url, {
        scroll: false,
      });
      const input =
        "current" in inputRef
          ? inputRef.current
          : (inputRef as HTMLInputElement);
      input?.focus();
    }
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
              ref={
                typeof inputRef === "function"
                  ? inputRef
                  : (el) => {
                      if ("current" in inputRef) {
                        (
                          inputRef as React.MutableRefObject<HTMLInputElement | null>
                        ).current = el;
                      }
                    }
              }
              type="input"
              placeholder="Search - e.g. Rust, 2022, Logistics"
              value={query}
              onChange={handleInputChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              className="w-full rounded-md border-0 bg-transparent py-3 px-10 text-slate-900 placeholder:text-slate-500 focus:outline-none"
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

          <button
            type="reset"
            onClick={clear}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-sm p-1 text-slate-400 transition-colors duration-300 outline-offset-4 hover:text-klein focus:text-klein focus:outline-2"
          >
            <Icon.X aria-hidden="true" focusable="false" />
            <span className="sr-only">
              {query ? "Clear search input" : "Close search"}
            </span>
          </button>
        </fieldset>
      </Form.Field>
    </Form.Root>
  );
});

SearchInputContent.displayName = "SearchInputContent";
