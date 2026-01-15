"use client";

import { useSearchParams } from "next/navigation";

import type React from "react";
import { Suspense, useEffect, useId, useMemo, useRef, useState } from "react";

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
import { buildSelectionIndex } from "~/utils/selection-index";

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

  // Track previous filtered list to calculate project states for CSS animations
  const prevFilteredRef = useRef<typeof filtered>([]);
  const projectStateMapRef = useRef(
    new Map<string, "exit" | "enter" | "stay">(),
  );
  // Store exiting projects separately so they can animate out
  const [exitingProjects, setExitingProjects] = useState<typeof filtered>([]);
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

  // Update project states when filtered list changes - using simple CSS animations
  useEffect(() => {
    // Mark initial load as complete on first render
    if (isInitialLoad) {
      setIsInitialLoad(false);
    }
    // Calculate the new state map to handle projects that stay (for scale animation)
    const newStateMap = diffProjectStates(prevFilteredRef.current, filtered);

    // Find exiting projects (were visible but now filtered out)
    const exiting = prevFilteredRef.current.filter(
      (p) => newStateMap.get(p.id) === "exit",
    );

    // Check if filtered list actually changed OR if we have any "stay" projects (for scale animation)
    const hasListChanged =
      prevFilteredRef.current.length !== filtered.length ||
      prevFilteredRef.current.some((p, i) => p.id !== filtered[i]?.id);
    const hasStayProjects = Array.from(newStateMap.values()).some(
      (state) => state === "stay",
    );

    if (hasListChanged || hasStayProjects) {
      // Simple state update - CSS handles the animations via classes
      projectStateMapRef.current = newStateMap;
      setRenderingProjects(filtered);

      // Set exiting projects to animate out (only if there are any)
      if (exiting.length > 0) {
        setExitingProjects(exiting);
        // Clear exiting projects after animation completes (200ms exit duration)
        const timer = setTimeout(() => {
          setExitingProjects([]);
        }, 200);
        // Cleanup timer on unmount or re-run
        return () => clearTimeout(timer);
      }

      prevFilteredRef.current = filtered;
    }
  }, [filtered, isInitialLoad]);

  const projectsId = useId();
  const listRef = useRef<HTMLOListElement>(null);
  const emptyStateRef = useRef<HTMLDivElement>(null);

  // State for screen reader announcements (WCAG 2.2 SC 4.1.3 - Status Messages)
  const [announcement, setAnnouncement] = useState("");

  // Announce filter results to screen readers
  useEffect(() => {
    // Skip announcement on initial load
    if (isInitialLoad) return;

    // Build announcement message
    let message: string;
    if (renderingProjects.length === 0 && activeSearchTerm) {
      message = `No projects found for "${activeSearchTerm}"`;
    } else if (activeSearchTerm) {
      message = `${renderingProjects.length} ${renderingProjects.length === 1 ? "project" : "projects"} found for "${activeSearchTerm}"`;
    } else {
      message = `Showing all ${renderingProjects.length} projects`;
    }

    setAnnouncement(message);
  }, [renderingProjects.length, activeSearchTerm, isInitialLoad]);

  // Show skeleton during initial load or while minimum display time hasn't elapsed
  if (showSkeleton || (isInitialLoad && renderingProjects.length === 0)) {
    return <ProjectsSkeleton />;
  }

  return (
    // biome-ignore lint/correctness/useUniqueElementIds: Projects section is rendered only once
    <article className="prose max-w-none" id="projects">
      {/* Screen reader announcement for filter results (WCAG 2.2 SC 4.1.3) */}
      <output aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </output>
      <h2 id={projectsId} className="mb-6 text-2xl font-bold md:text-center">
        Projects
      </h2>
      <div className="flow-root space-y-4 overflow-visible">
        {renderingProjects.length === 0 && activeSearchTerm ? (
          <div ref={emptyStateRef} className="empty-state-container visible">
            <ProjectsEmptyState query={activeSearchTerm} />
          </div>
        ) : (
          <ol className="ml-0 list-none pl-0 relative" ref={listRef}>
            {/* Render exiting projects first (position: absolute, animate out) */}
            {exitingProjects.map((project) => (
              <Project
                key={`exit-${project.id}`}
                project={project}
                projectIdx={0}
                totalLength={exitingProjects.length}
                isVisible={false}
                projectState="exit"
                aria-hidden="true"
              />
            ))}
            {/* Render current visible projects */}
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
