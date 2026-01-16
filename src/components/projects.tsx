"use client";

import { useSearchParams } from "next/navigation";

import type React from "react";
import {
  Suspense,
  startTransition,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";

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

  // Show skeleton for minimum time to prevent flash
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSkeleton(false);
    }, 400); // Minimum skeleton display time
    return () => clearTimeout(timer);
  }, []);

  // Update project states when filtered list changes
  // Uses View Transitions API for smooth animations WITHOUT flushSync
  // flushSync was causing 3-6 second lag by blocking React's concurrent rendering
  // Instead, we use an async callback that waits for React to update via RAF
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
      // Update refs synchronously (they don't trigger re-render)
      projectStateMapRef.current = newStateMap;
      prevFilteredRef.current = filtered;

      // Use startTransition for non-blocking state updates
      // CSS animations in globals.css handle enter/exit animations via class changes
      // (project-from-bottom, project-slide-out, project-visible classes)
      // This approach works with React's concurrent rendering without blocking
      startTransition(() => {
        setRenderingProjects(filtered);
      });
    }
  }, [filtered, isInitialLoad]);

  const projectsId = useId();
  const listRef = useRef<HTMLOListElement>(null);
  const emptyStateRef = useRef<HTMLDivElement>(null);

  // FIX: Use Set for O(1) isVisible lookup instead of O(n) filtered.some()
  // This reduces overall complexity from O(n²) to O(n)
  // NOTE: Must be called before early return to comply with Rules of Hooks
  const filteredIdSet = useMemo(
    () => new Set(filtered.map((p) => p.id)),
    [filtered],
  );

  // Show skeleton during initial load or while minimum display time hasn't elapsed
  if (showSkeleton || (isInitialLoad && renderingProjects.length === 0)) {
    return <ProjectsSkeleton />;
  }

  return (
    // biome-ignore lint/correctness/useUniqueElementIds: Projects section is rendered only once
    <article className="prose max-w-none" id="projects-list" aria-label="Projects">
      {/* Live region for screen reader announcements when filtering changes */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {activeSearchTerm
          ? `Showing ${filtered.length} project${filtered.length !== 1 ? "s" : ""} matching "${activeSearchTerm}"`
          : `Showing all ${PROJECTS.length} projects`}
      </div>
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
                isVisible={filteredIdSet.has(project.id)}
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
