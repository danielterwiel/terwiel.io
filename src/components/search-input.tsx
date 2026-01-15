"use client";

import * as Form from "@radix-ui/react-form";
import { clsx } from "clsx";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import React, { startTransition } from "react";

import { Icon } from "~/components/icon";
import { debounce } from "~/utils/debounce";
import { getMagneticClasses } from "~/utils/icon-colors";

interface SearchInputProps {
  onCloseEmpty?: () => void;
}

export interface SearchInputHandle {
  focus: (options?: FocusOptions) => void;
  select: () => void;
  blur: () => void;
  click: () => void;
  triggerBounce: () => void;
}

const SearchInputContent = React.forwardRef<
  SearchInputHandle,
  SearchInputProps
>(({ onCloseEmpty }, forwardedRef) => {
  const searchParams = useSearchParams();
  const initialQuery = decodeURIComponent(
    searchParams.get("query") ?? "",
  ).trim();
  const router = useRouter();
  const pathname = usePathname();
  const internalRef = React.useRef<HTMLInputElement>(null);
  const inputRef = (forwardedRef ||
    internalRef) as React.RefObject<HTMLInputElement>;
  const [query, setQuery] = React.useState(initialQuery);
  const [isFocused, setIsFocused] = React.useState(false);
  const [isBouncing, setIsBouncing] = React.useState(false);

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
          ? `${pathname}?query=${encodedValue}`
          : pathname;
        // Wrap router navigation in startTransition to trigger view transitions
        // Use push so back button returns to previous search
        startTransition(() => {
          router.push(url, {
            scroll: false,
          });
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

  const triggerSearchImmediately = (searchValue: string) => {
    // Cancel any pending debounced search
    debouncedSetSearchParamsRef.current?.cancel();

    // Trigger search immediately without debounce
    // Use push so back button returns to previous search
    const encodedValue = encodeURIComponent(searchValue);
    const url = encodedValue ? `${pathname}?query=${encodedValue}` : pathname;
    startTransition(() => {
      router.push(url, {
        scroll: false,
      });
    });
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      triggerSearchImmediately(query);
    } else if (event.key === "Escape") {
      // Escape key clears input and blurs
      if (query) {
        // If there's a query, clear it first
        debouncedSetSearchParamsRef.current?.cancel();
        setQuery("");
        const url = pathname;
        startTransition(() => {
          router.push(url, { scroll: false });
        });
      } else {
        // If already empty, blur the input and trigger onCloseEmpty
        const input =
          "current" in inputRef
            ? inputRef.current
            : (inputRef as HTMLInputElement);
        input?.blur();
        onCloseEmpty?.();
      }
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    // Trigger bounce animation on focus
    triggerBounceAnimation();
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const triggerBounceAnimation = React.useCallback(() => {
    setIsBouncing(true);
    // Remove animation class after animation completes (0.4s)
    const timeoutId = setTimeout(() => {
      setIsBouncing(false);
    }, 400);
    return () => clearTimeout(timeoutId);
  }, []);

  // Expose focus, select, blur, click, and triggerBounce methods to parent components
  React.useImperativeHandle(forwardedRef, () => {
    const input =
      "current" in inputRef ? inputRef.current : (inputRef as HTMLInputElement);
    return {
      focus: (options?: FocusOptions) => {
        input?.focus(options);
      },
      select: () => {
        input?.select();
      },
      blur: () => {
        input?.blur();
      },
      click: () => {
        input?.click();
      },
      triggerBounce: () => {
        triggerBounceAnimation();
      },
    };
  }, [inputRef, triggerBounceAnimation]);

  const clear = () => {
    if (query === "") {
      // If query is already empty, close the search input
      onCloseEmpty?.();
    } else {
      // If query has content, clear it
      // Cancel any pending debounced update to prevent race condition
      debouncedSetSearchParamsRef.current?.cancel();
      setQuery("");
      const url = pathname;
      // Wrap router navigation in startTransition to trigger view transitions
      // Use push so back button returns to previous search
      startTransition(() => {
        router.push(url, {
          scroll: false,
        });
      });
      const input =
        "current" in inputRef
          ? inputRef.current
          : (inputRef as HTMLInputElement);
      // Use requestAnimationFrame for iOS compatibility with focus after state update
      if (input) {
        requestAnimationFrame(() => {
          input.focus();
        });
      }
    }
  };

  const magneticClasses = getMagneticClasses(undefined, {
    component: "input",
    isFocused,
    hasQuery: !!query,
    withRing: false, // Explicitly disable ring for input to avoid border conflicts
  });

  return (
    <Form.Root className="print:hidden" onSubmit={(e) => e.preventDefault()}>
      <Form.Field name="query">
        {/* Validation message container - label provided via aria-label on input */}
        <Form.Message match="typeMismatch" className="sr-only">
          Please provide a valid search query
        </Form.Message>
        <div
          className={clsx(
            "rounded-md overflow-hidden",
            magneticClasses,
            isBouncing && "animation-magnetic-bounce",
          )}
        >
          <search className="group relative flex w-full items-center rounded-md glass-input">
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
                type="search"
                inputMode="search"
                enterKeyHint="search"
                autoComplete="off"
                autoCorrect="off"
                spellCheck="false"
                placeholder="Search - e.g. Rust, 2022, Logistics"
                aria-label="Search projects by technology, year, or industry"
                value={query}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onFocus={handleFocus}
                onBlur={handleBlur}
                tabIndex={isFocused || query ? 0 : -1}
                className="min-h-[44px] w-full border-0 bg-transparent py-3 px-10 text-slate-900 placeholder:text-slate-500 focus:outline-none"
              />
            </Form.Control>
            <Icon.Search
              className={clsx(
                "absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-300 group-hover-hover:text-slate-600",
                isFocused || query ? "text-klein" : "text-slate-400",
              )}
              aria-hidden="true"
              focusable="false"
            />

            <button
              type="reset"
              onClick={clear}
              tabIndex={isFocused || query ? 0 : -1}
              aria-label={query ? "Clear search input" : "Close search"}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-sm p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 transition-colors duration-300 hover-hover:text-klein focus-visible:text-klein focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-klein focus-visible:ring-offset-2"
            >
              <Icon.X aria-hidden="true" focusable="false" />
            </button>
          </search>
        </div>
      </Form.Field>
    </Form.Root>
  );
});

SearchInputContent.displayName = "SearchInputContent";

export const SearchInput = React.forwardRef<
  SearchInputHandle,
  SearchInputProps
>(({ onCloseEmpty }, ref) => {
  return (
    <React.Suspense
      fallback={<div className="print:hidden">Loading search...</div>}
    >
      <SearchInputContent ref={ref} onCloseEmpty={onCloseEmpty} />
    </React.Suspense>
  );
});

SearchInput.displayName = "SearchInput";
