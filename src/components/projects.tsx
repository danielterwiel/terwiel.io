"use client";

import { useSearchParams } from "next/navigation";

import type React from "react";
import { Suspense, useEffect, useId, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";

import type { Domain } from "~/types";

import { Project } from "~/components/project";
import { ProjectsEmptyState } from "~/components/projects-empty-state";
import { ProjectsSkeleton } from "~/components/projects-skeleton";
import { PROJECTS } from "~/data/projects";
import { useScrollDelegation } from "~/hooks/use-scroll-delegation";
import { filterCache } from "~/utils/filter-cache";
import { filterProjects } from "~/utils/filter-projects";
import { diffProjectStates } from "~/utils/project-state-diff";
import {
  getSearchDomain,
  getSearchFilter,
  getSearchQuery,
} from "~/utils/search-params";
import { buildSelectionIndex } from "~/utils/stack-cloud/selection-index";

const ProjectsContent = () => {
  const searchParams = useSearchParams();
  const query = getSearchQuery(searchParams);
  const filter = getSearchFilter(searchParams);

  // Use filter parameter if set (from StackCloud), otherwise fall back to query (from SearchInput)
  const activeSearchTerm = filter || query;

  // Extract domain filter (if search term matches a domain name exactly)
  const domain = getSearchDomain(activeSearchTerm, PROJECTS) as Domain | null;

  // Build selection index once for fast filtering
  const selectionIndex = useMemo(() => {
    return buildSelectionIndex(PROJECTS);
  }, []);

  // Memoize filtered projects computation with cache
  // Checks BOTH query (from SearchInput) and filter (from StackCloud) parameters
  const filtered = useMemo(() => {
    const cached = filterCache.get(activeSearchTerm, domain ?? undefined);
    if (cached) {
      return cached;
    }

    const result = filterProjects(
      PROJECTS,
      activeSearchTerm,
      domain ?? undefined,
      selectionIndex,
    );
    filterCache.set(activeSearchTerm, domain ?? undefined, result);
    return result;
  }, [activeSearchTerm, domain, selectionIndex]);

  // Track previous filtered list to calculate project states for transitions
  const prevFilteredRef = useRef<typeof filtered>([]);
  const projectStateMapRef = useRef(
    new Map<string, "exit" | "enter" | "stay">(),
  );
  const [renderingProjects, setRenderingProjects] = useState<typeof filtered>(
    [],
  );
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [showSkeleton, setShowSkeleton] = useState(true);
  // Track ongoing view transition to prevent concurrent transitions
  const ongoingTransitionRef = useRef<ViewTransition | null>(null);

  // Show skeleton for minimum time to prevent flash
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSkeleton(false);
    }, 400); // Minimum skeleton display time
    return () => clearTimeout(timer);
  }, []);

  // Update project states when filtered list changes
  useEffect(() => {
    // Mark initial load as complete on first render
    if (isInitialLoad) {
      setIsInitialLoad(false);
    }
    // Calculate the new state map to handle projects that stay (for scale animation)
    const newStateMap = diffProjectStates(prevFilteredRef.current, filtered);

    // Check if filtered list actually changed OR if we have any "stay" projects (for scale animation)
    const hasListChanged =
      prevFilteredRef.current.length !== filtered.length ||
      prevFilteredRef.current.some((p, i) => p.id !== filtered[i]?.id);
    const hasStayProjects = Array.from(newStateMap.values()).some(
      (state) => state === "stay",
    );

    if (hasListChanged || hasStayProjects) {
      // Detect Safari on macOS - it has rendering bugs with view transitions and sticky headers
      // The transition layer clips/hides sticky elements and breaks backdrop-filter effects
      // iOS Safari works fine with view transitions, so we only disable for macOS
      const ua = navigator.userAgent;
      const isSafariMac =
        /Safari/i.test(ua) &&
        /Macintosh/i.test(ua) &&
        !/Chrome|Chromium|Edg/i.test(ua);

      // Use native View Transition API with proper abort handling
      // DISABLED FOR SAFARI MAC: Safari on macOS has critical bugs with view transitions causing:
      // 1. Sticky header disappears completely during transition
      // 2. Backdrop-filter effect becomes invisible
      // 3. Header gets clipped by the view transition layer
      // ENABLED FOR SAFARI iOS: iOS Safari handles view transitions correctly
      // Workaround: Disable view transitions on Safari macOS, use instant updates instead
      if ("startViewTransition" in document && !isSafariMac) {
        const vtAPI = document as Document & {
          startViewTransition: (callback: () => void) => ViewTransition;
        };

        // Abort any ongoing transition to prevent conflicts
        if (ongoingTransitionRef.current) {
          // Suppress the error from skipTransition by catching it
          ongoingTransitionRef.current.finished.catch(() => {
            // Silently handle the skip error - this is expected
          });
          // Only call skipTransition if the transition is still pending
          try {
            ongoingTransitionRef.current.skipTransition();
          } catch {
            // Silently handle any errors from skipTransition
          }
        }

        // Start the new transition
        const transition = vtAPI.startViewTransition(() => {
          // Inside the transition callback, update state synchronously
          flushSync(() => {
            // Update the project state map
            projectStateMapRef.current = newStateMap;
            // Update rendering to show only filtered projects
            setRenderingProjects(filtered);
            // Mark that we've processed this update
            prevFilteredRef.current = filtered;
          });
        });

        // Track this transition
        ongoingTransitionRef.current = transition;

        // Clear the reference when transition finishes
        transition.finished
          .then(() => {
            if (ongoingTransitionRef.current === transition) {
              ongoingTransitionRef.current = null;
            }
          })
          .catch(() => {
            // Handle abortion or other errors
            if (ongoingTransitionRef.current === transition) {
              ongoingTransitionRef.current = null;
            }
          });
      } else {
        // Fallback for Safari macOS and browsers without View Transitions
        // Use instant DOM updates without animation
        // Note: iOS Safari falls through here only if View Transitions API is not supported
        projectStateMapRef.current = newStateMap;
        setRenderingProjects(filtered);
        prevFilteredRef.current = filtered;
      }
    }
  }, [filtered, isInitialLoad]);

  const projectsId = useId();
  const listRef = useRef<HTMLOListElement>(null);
  const emptyStateRef = useRef<HTMLDivElement>(null);

  // Show skeleton during initial load or while minimum display time hasn't elapsed
  if (showSkeleton || (isInitialLoad && renderingProjects.length === 0)) {
    return <ProjectsSkeleton />;
  }

  return (
    // biome-ignore lint/correctness/useUniqueElementIds: Projects section is rendered only once
    <article className="prose max-w-none" id="projects">
      <h2 id={projectsId} className="mb-6 text-2xl font-bold md:text-center">
        Projects
      </h2>
      <div className="flow-root space-y-4 overflow-visible">
        {renderingProjects.length === 0 && activeSearchTerm ? (
          <div
            ref={emptyStateRef}
            className="empty-state-container visible vt-empty-state"
          >
            <ProjectsEmptyState query={activeSearchTerm} />
          </div>
        ) : (
          <ol
            className="ml-0 list-none pl-0"
            ref={listRef}
            style={
              { viewTransitionName: "projects-list" } as React.CSSProperties
            }
          >
            {renderingProjects.map((project, idx) => (
              <Project
                key={project.id}
                project={project}
                projectIdx={idx}
                totalLength={renderingProjects.length}
                isVisible={filtered.some((p) => p.id === project.id)}
                projectState={
                  projectStateMapRef.current.get(project.id) ?? "stay"
                }
              />
            ))}
          </ol>
        )}
      </div>
    </article>
  );
};

export const Projects = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  useScrollDelegation(containerRef as React.RefObject<HTMLElement>);

  return (
    <div
      ref={containerRef}
      className="md:overflow-y-auto projects-scrollable"
      style={
        {
          // Safari fix: without explicit height, use max-height to constrain scrolling
          WebkitOverflowScrolling: "touch",
        } as React.CSSProperties
      }
    >
      <Suspense fallback={<ProjectsSkeleton />}>
        <ProjectsContent />
      </Suspense>
    </div>
  );
};
