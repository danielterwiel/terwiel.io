"use client";

import { useSearchParams } from "next/navigation";

import type React from "react";
import {
  Suspense,
  useId,
  useMemo,
  useRef,
  unstable_ViewTransition as ViewTransition,
} from "react";

import type { Domain } from "~/types";

import { Project } from "~/components/project";
import { ProjectsEmptyState } from "~/components/projects-empty-state";
import { PROJECTS } from "~/data/projects";
import { useScrollDelegation } from "~/hooks/use-scroll-delegation";
import { filterCache } from "~/utils/filter-cache";
import { filterProjects } from "~/utils/filter-projects";
import { getSearchDomain, getSearchQuery } from "~/utils/search-params";
import { buildSelectionIndex } from "~/utils/stack-cloud/selection-index";

const ProjectsContent = () => {
  const searchParams = useSearchParams();
  const query = getSearchQuery(searchParams);

  // Extract domain filter from query (if query matches a domain name exactly)
  const domain = getSearchDomain(query, PROJECTS) as Domain | null;

  // Build selection index once for fast filtering
  const selectionIndex = useMemo(() => {
    return buildSelectionIndex(PROJECTS);
  }, []);

  // Memoize filtered projects computation with cache - only recalculate when query or domain changes
  // Uses cache to avoid re-filtering if the same query/domain is repeated
  const filtered = useMemo(() => {
    // Check cache first
    const cached = filterCache.get(query, domain ?? undefined);
    if (cached) {
      return cached;
    }

    // Calculate and cache the result
    const result = filterProjects(
      PROJECTS,
      query,
      domain ?? undefined,
      selectionIndex,
    );
    filterCache.set(query, domain ?? undefined, result);
    return result;
  }, [query, domain, selectionIndex]);

  const projectsId = useId();

  // Create a stable key that only changes when filter changes
  // Only trigger view transitions when the filter actually changes (query or domain)
  // This prevents transitions on initial render and scroll events
  const hasFilter = query !== "" || domain !== null;
  const filterKey = hasFilter ? `${query}-${domain ?? ""}` : "no-filter";

  // Conditionally render ViewTransition only when there's an active filter
  // This avoids performance overhead on initial render and scroll
  const content = (
    <div className="flow-root space-y-4">
      {filtered.length === 0 && query ? (
        <ProjectsEmptyState query={query} />
      ) : (
        <ol className="ml-0 list-none pl-0">
          {filtered.map((project, projectIdx) => (
            <Project
              key={project.id}
              project={project}
              projectIdx={projectIdx}
              totalLength={filtered.length}
            />
          ))}
        </ol>
      )}
    </div>
  );

  return (
    <article className="prose max-w-none">
      <h2 id={projectsId} className="mb-6 text-2xl font-bold md:text-center">
        Projects
      </h2>
      {hasFilter ? (
        <ViewTransition key={filterKey} name="projects-list">
          {content}
        </ViewTransition>
      ) : (
        content
      )}
    </article>
  );
};

export const Projects = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  useScrollDelegation(containerRef as React.RefObject<HTMLElement>);

  return (
    <div ref={containerRef} className="md:h-full md:overflow-y-auto">
      <Suspense fallback={<div>Loading projects...</div>}>
        <ProjectsContent />
      </Suspense>
    </div>
  );
};
