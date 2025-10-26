"use client";

import { useSearchParams } from "next/navigation";

import type React from "react";
import { Suspense, useId, useMemo, useRef } from "react";

import type { Domain } from "~/types";

import { Project } from "~/components/project";
import { ProjectsEmptyState } from "~/components/projects-empty-state";
import { PROJECTS } from "~/data/projects";
import { useScrollDelegation } from "~/hooks/use-scroll-delegation";
import { filterCache } from "~/utils/filter-cache";
import { filterProjects } from "~/utils/filter-projects";
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

  const projectsId = useId();
  const listRef = useRef<HTMLOListElement>(null);
  const emptyStateRef = useRef<HTMLDivElement>(null);

  return (
    // biome-ignore lint/correctness/useUniqueElementIds: Projects section is rendered only once
    <article className="prose max-w-none" id="projects">
      <h2
        id={projectsId}
        className="mb-6 text-2xl font-bold md:text-center md:pt-2 landscape-mobile:pt-24"
      >
        Projects
      </h2>
      <div className="flow-root space-y-4 overflow-visible">
        {filtered.length === 0 && activeSearchTerm ? (
          <div ref={emptyStateRef} className="empty-state-container visible">
            <ProjectsEmptyState query={activeSearchTerm} />
          </div>
        ) : (
          <ol className="ml-0 list-none pl-0" ref={listRef}>
            {filtered.map((project, idx) => (
              <Project
                key={project.id}
                project={project}
                projectIdx={idx}
                totalLength={filtered.length}
                isVisible={true}
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
      <Suspense fallback={<div>Loading projects...</div>}>
        <ProjectsContent />
      </Suspense>
    </div>
  );
};
