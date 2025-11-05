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
        startTransition(() => {
          router.replace(url, {
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
    const encodedValue = encodeURIComponent(searchValue);
    const url = encodedValue ? `${pathname}?query=${encodedValue}` : pathname;
    startTransition(() => {
      router.replace(url, {
        scroll: false,
      });
    });
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      triggerSearchImmediately(query);
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
      startTransition(() => {
        router.replace(url, {
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
        <div>
          <Form.Label className="sr-only">Search query</Form.Label>
          <Form.Message match="typeMismatch">
            Please provide a your search query
          </Form.Message>
        </div>
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
                type="input"
                placeholder="Search - e.g. Rust, 2022, Logistics"
                value={query}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onFocus={handleFocus}
                onBlur={handleBlur}
                className="w-full border-0 bg-transparent py-3 px-10 text-slate-900 placeholder:text-slate-500 focus:outline-none"
              />
            </Form.Control>
            <Icon.Search
              className={clsx(
                "absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-300 group-hover:text-slate-600",
                isFocused || query ? "text-klein" : "text-slate-400",
              )}
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
