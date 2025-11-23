"use client";

import { clsx } from "clsx";
import { useSearchParams } from "next/navigation";

import { Suspense, useEffect, useRef, useState } from "react";

import type { StackItem } from "~/types";

import { Badge } from "~/components/badge";
import { useRovingTabindex } from "~/hooks/use-roving-tabindex";
import { getSearchFilter, getSearchQuery } from "~/utils/search-params";
import { isExactParamMatchAny } from "~/utils/search-params-match";

type ProjectStackProps = {
  items: StackItem[];
  className?: string;
};

/**
 * ProjectStack with deferred wave animation
 * Uses useTransition to deprioritize animation logic, allowing urgent UI updates
 * to complete first, then triggers wave animation as a non-blocking update
 */
const ProjectStackContent = ({ items, className }: ProjectStackProps) => {
  const stackRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const filter = getSearchFilter(searchParams);
  const query = getSearchQuery(searchParams);
  const [animatingIndices, setAnimatingIndices] = useState<Set<number>>(
    new Set(),
  );
  const [hasAnimated, setHasAnimated] = useState(false);
  const timeoutIdsRef = useRef<NodeJS.Timeout[]>([]);

  // Memoize badge matching results to avoid recalculating on every render
  // Uses filter and query as keys to invalidate cache when either changes
  const badgeMatchCache = useRef(new Map<string, boolean>());

  // Check if a badge matches the current filter or query parameter
  const isBadgeMatched = (item: StackItem): boolean => {
    // Check cache first
    const cacheKey = `${item.name}|${item.domain}|${item.parent ?? ""}`;
    const cached = badgeMatchCache.current.get(cacheKey);
    if (cached !== undefined) {
      return cached;
    }

    // Calculate and cache - check if name, domain, or parent exactly matches query or filter
    const matches =
      isExactParamMatchAny(searchParams, item.name) ||
      isExactParamMatchAny(searchParams, item.domain) ||
      (item.parent ? isExactParamMatchAny(searchParams, item.parent) : false);

    badgeMatchCache.current.set(cacheKey, matches);
    return matches;
  };

  // Clear cache when filter or query changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: filter and query dependencies are needed to clear cache
  useEffect(() => {
    badgeMatchCache.current.clear();
  }, [filter, query]);

  // Roving tabindex for keyboard navigation
  // Convert StackItems to format expected by hook (add id property)
  const itemsWithId = items.map((item, index) => ({
    ...item,
    id: `${item.name}-${index}`,
  }));

  const rovingTabindex = useRovingTabindex(itemsWithId, {
    initialIndex: 0,
    loop: true,
    direction: "horizontal",
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            // Clear any previous timeouts
            timeoutIdsRef.current.forEach(clearTimeout);
            timeoutIdsRef.current = [];

            // Trigger wave animation - each badge lights up briefly then fades back
            // Don't wrap in startTransition - it's not needed and adds overhead
            items.forEach((_, index) => {
              // Light up after delay
              const lightUpTimeout = setTimeout(() => {
                setAnimatingIndices((prev) => new Set(prev).add(index));
              }, index * 80); // 80ms delay between each badge lighting up

              // Fade back to neutral after brief display
              const fadeOutTimeout = setTimeout(
                () => {
                  setAnimatingIndices((prev) => {
                    const next = new Set(prev);
                    next.delete(index);
                    return next;
                  });
                },
                index * 80 + 400,
              ); // Show color for 400ms before fading

              timeoutIdsRef.current.push(lightUpTimeout, fadeOutTimeout);
            });

            setHasAnimated(true);
          }
        });
      },
      {
        threshold: 0.1,
        // Add root margin to start animation slightly before entering viewport
        rootMargin: "50px 0px",
      },
    );

    const currentRef = stackRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [items, hasAnimated]);

  // Separate effect to clean up timeouts only on unmount
  useEffect(() => {
    return () => {
      timeoutIdsRef.current.forEach(clearTimeout);
    };
  }, []);

  return (
    // biome-ignore lint/a11y/useSemanticElements: Using role="group" for WAI-ARIA roving tabindex pattern
    <div
      ref={stackRef}
      className={clsx("flex flex-wrap items-center gap-2", className)}
      role="group"
      aria-label="Technology badges - use arrow keys to navigate, Enter to filter"
      onKeyDown={rovingTabindex.handleKeyDown}
      onFocus={rovingTabindex.handleContainerFocus}
      onBlur={rovingTabindex.handleContainerBlur}
    >
      {items.map((item, index) => {
        const itemId = `${item.name}-${index}`;
        const tabIndex = rovingTabindex.getTabIndex(itemId);

        return (
          <Badge
            key={itemId}
            icon={item.icon}
            name={item.name}
            isAnimating={animatingIndices.has(index)}
            isMatched={isBadgeMatched(item)}
            tabIndex={tabIndex}
            badgeRef={(el) => rovingTabindex.registerItemRef(itemId, el)}
          />
        );
      })}
    </div>
  );
};

export const ProjectStack = (props: ProjectStackProps) => {
  return (
    <Suspense
      fallback={
        <div
          className={clsx("flex flex-wrap items-center gap-2", props.className)}
        />
      }
    >
      <ProjectStackContent {...props} />
    </Suspense>
  );
};
