"use client";

import { useSearchParams } from "next/navigation";

import { useDeferredValue, useId, useMemo } from "react";

import { Project } from "~/components/project";
import { SearchSummary } from "~/components/search-summary";
import { PROJECTS } from "~/data/projects";
import { filterProjects } from "~/utils/filter-projects";
import { getSearchQuery } from "~/utils/search-params";

export const ProjectsContent = () => {
  const searchParams = useSearchParams();
  const query = getSearchQuery(searchParams);

  // Defer the query value to give priority to urgent UI updates (e.g., StackCloud animations)
  const deferredQuery = useDeferredValue(query);

  // Memoize filtered projects computation - only recalculate when deferred query changes
  const filtered = useMemo(
    () => filterProjects(PROJECTS, deferredQuery),
    [deferredQuery],
  );

  const projectsId = useId();

  // Show loading state when query is ahead of deferred query (user is actively filtering)
  const isFiltering = query !== deferredQuery;

  return (
    <article className="prose max-w-none">
      <h2 id={projectsId} className="mb-6 text-2xl font-bold md:text-center">
        Projects
      </h2>
      <div className="flow-root space-y-4">
        {query ? <SearchSummary query={query} items={filtered} /> : null}

        <div
          style={{
            opacity: isFiltering ? 0.6 : 1,
            transition: "opacity 150ms ease-in-out",
          }}
        >
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
        </div>
      </div>
    </article>
  );
};
