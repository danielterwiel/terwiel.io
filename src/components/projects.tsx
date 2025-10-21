"use client";

import { useSearchParams } from "next/navigation";

import type React from "react";
import { Suspense, useDeferredValue, useId, useMemo, useRef } from "react";

import type { Domain } from "~/types";

import { Project } from "~/components/project";
import { ProjectsEmptyState } from "~/components/projects-empty-state";
import { SearchToastQueued } from "~/components/search-toast-queued";
import { PROJECTS } from "~/data/projects";
import { useScrollDelegation } from "~/hooks/use-scroll-delegation";
import { filterProjects } from "~/utils/filter-projects";
import {
  getFilterType,
  getSearchDomain,
  getSearchQuery,
} from "~/utils/search-params";

const ProjectsContent = () => {
  const searchParams = useSearchParams();
  const query = getSearchQuery(searchParams);
  const filterType = getFilterType(searchParams);

  // Defer the query value to give priority to urgent UI updates (e.g., StackCloud animations)
  const deferredQuery = useDeferredValue(query);

  // Extract domain filter from query (if query matches a domain name exactly)
  const domain = getSearchDomain(deferredQuery, PROJECTS) as Domain | null;

  // Memoize filtered projects computation - only recalculate when deferred query or domain changes
  const filtered = useMemo(
    () => filterProjects(PROJECTS, deferredQuery, domain ?? undefined),
    [deferredQuery, domain],
  );

  const projectsId = useId();

  // Show loading state when query is ahead of deferred query (user is actively filtering)
  const isFiltering = query !== deferredQuery;

  return (
    <article className="prose max-w-none">
      <h2 id={projectsId} className="mb-6 text-2xl font-bold md:text-center">
        Work
      </h2>
      <div className="flow-root space-y-4">
        {query ? (
          <SearchToastQueued
            query={query}
            items={filtered}
            filterType={filterType}
          />
        ) : null}

        <div
          style={{
            opacity: isFiltering ? 0.6 : 1,
            transition: "opacity 150ms ease-in-out",
          }}
        >
          {filtered.length === 0 && query ? (
            <ProjectsEmptyState query={query} />
          ) : (
            <ol className="ml-0 list-none pl-0">
              {filtered.map((project, projectIdx) => (
                <Project
                  key={project.company}
                  project={project}
                  projectIdx={projectIdx}
                  totalLength={filtered.length}
                />
              ))}
            </ol>
          )}
        </div>
      </div>
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
