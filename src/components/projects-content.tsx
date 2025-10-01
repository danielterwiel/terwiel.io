"use client";

import { useSearchParams } from "next/navigation";

import React, { useId } from "react";

import { Project } from "~/components/project";
import { SearchSummary } from "~/components/search-summary";
import { PROJECTS } from "~/data/projects";
import { filterProjects } from "~/utils/filter-projects";

export const ProjectsContent = () => {
  const [filtered, setFiltered] = React.useState(PROJECTS);
  const searchParams = useSearchParams();
  const query = decodeURI(searchParams.get("search") ?? "").trim();

  React.useEffect(() => {
    const filteredProjects = filterProjects(PROJECTS, query);

    setFiltered(filteredProjects);
  }, [query]);

  const projectsId = useId();

  return (
    <>
      <h2 id={projectsId}>Projects</h2>
      <div className="flow-root space-y-4">
        {query ? <SearchSummary query={query} items={filtered} /> : null}

        <ol className="ml-0 list-none pl-0">
          {filtered.map((project, projectIdx) => (
            <Project
              key={project.company}
              project={project}
              projectIdx={projectIdx}
              totalLength={PROJECTS.length}
            />
          ))}
        </ol>
      </div>
    </>
  );
};
