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
    // Only update states if filtered list actually changed
    if (
      prevFilteredRef.current.length !== filtered.length ||
      prevFilteredRef.current.some((p, i) => p.id !== filtered[i]?.id)
    ) {
      // Use native View Transition API
      if ("startViewTransition" in document) {
        const vtAPI = document as Document & {
          startViewTransition: (callback: () => void) => ViewTransition;
        };

        // Calculate the new state map BEFORE transition
        const newStateMap = diffProjectStates(
          prevFilteredRef.current,
          filtered,
        );

        // Start the transition IMMEDIATELY
        vtAPI.startViewTransition(() => {
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
      } else {
        // Fallback for browsers without View Transitions
        const newStateMap = diffProjectStates(
          prevFilteredRef.current,
          filtered,
        );
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
                totalLength={filtered.length}
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
      className="md:h-full md:overflow-y-auto projects-scrollable"
    >
      <Suspense fallback={<ProjectsSkeleton />}>
        <ProjectsContent />
      </Suspense>
    </div>
  );
};
