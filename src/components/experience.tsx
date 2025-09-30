"use client";

import { format, parseISO } from "date-fns";
import { useSearchParams } from "next/navigation";

import React, { Suspense, useId } from "react";

import { HighlightedText } from "~/components/highlighted";
import { Icon } from "~/components/icon";
import { Ring } from "~/components/ring";
import { PROJECTS, type Project } from "~/data/projects";
import { calculateProjectDuration } from "~/utils/calculate-experience";
import { ProjectStack, type StackItem } from "./project-stack";
import { SearchSummary } from "./search";

const Project = ({
  project,
  projectIdx,
  totalLength,
}: {
  project: Project;
  projectIdx: number;
  totalLength: number;
}) => {
  const isPresent = project.dateTo === "present";
  const dateFrom = parseISO(project.dateFrom);
  const dateTo = parseISO(
    isPresent ? new Date().toISOString() : project.dateTo,
  );
  const { duration } = calculateProjectDuration(
    project.dateFrom,
    project.dateTo,
  );
  const from = format(dateFrom, "MMM yy");
  const to = format(dateTo, "MMM yy");
  const fromApos = from.replace(/\d+/g, "'$&");
  const toApos = to.replace(/\d+/g, "'$&");
  const timespan = `${fromApos} - ${isPresent ? "present" : toApos}`;

  const IconProject =
    Icon[project.icon as keyof typeof Icon] ?? Icon.QuestionMark;

  return (
    <li
      key={project.id}
      className="relative break-inside-avoid-page pb-8 print:pt-8"
    >
      {projectIdx !== totalLength - 1 ? (
        <span
          className="absolute top-4 ml-[1.4rem] hidden h-full w-0.5 bg-gray-200 md:block"
          aria-hidden="true"
        />
      ) : null}
      <div className="flex space-x-3">
        <div className="relative grid w-full grid-cols-[2rem_minmax(0,1fr)] gap-2 md:gap-4">
          <div className="h-12 w-12 text-slate-600/80">
            <Ring>
              <IconProject aria-hidden="true" focusable="false" />
            </Ring>
          </div>
          <h3 className="mt-2.5 pl-6 text-lg">
            <HighlightedText>{project.company}</HighlightedText>
          </h3>
          <div className="col-span-2 grid min-w-0 flex-1 grid-cols-1 justify-between md:pl-10">
            <div className="order-2 col-span-1">
              <dl className="mt-0 grid grid-flow-row grid-cols-[6rem_1fr] gap-1 pt-4 md:grid-cols-[12rem_1fr] print:mt-8 print:grid-cols-[20rem_1fr] print:items-stretch">
                <dt className="mt-0 flex justify-end gap-2 md:m-0 print:m-0 print:justify-end">
                  <span className="text-slate-500/50">
                    <Icon.User aria-hidden="true" focusable="false" />
                  </span>
                  <span className="font-normal text-slate-500">Role</span>
                </dt>
                <dd className="m-0 pl-4 md:pl-7">
                  <HighlightedText>{project.role}</HighlightedText>
                </dd>

                <dt className="mt-0 flex justify-end gap-2 md:m-0 print:m-0 print:justify-end">
                  <span className=" text-slate-500/50">
                    <Icon.UsersGroup aria-hidden="true" focusable="false" />
                  </span>
                  <span className="font-normal text-slate-500">Team</span>
                </dt>
                <dd className="m-0 pl-4 md:pl-7">
                  {project.teamSize > 1 && "~"}
                  <span className="mr-2">
                    <HighlightedText>
                      {project.teamSize.toString()}
                    </HighlightedText>
                  </span>
                  developer{project.teamSize > 1 && "s"}
                </dd>
                <dt className="mt-0 flex justify-end gap-2 md:m-0 print:m-0 print:justify-end">
                  <span className="text-slate-500/50">
                    <Icon.BuildingFactory2
                      aria-hidden="true"
                      focusable="false"
                    />
                  </span>
                  <span className="font-normal text-slate-500">Industry</span>
                </dt>
                <dd className="m-0 pl-4 md:pl-7">
                  <HighlightedText>{project.industry}</HighlightedText>
                </dd>
                <dt className="mt-0 flex justify-end gap-2 md:m-0 print:m-0 print:justify-end">
                  <span className="text-slate-500/50">
                    <Icon.MapPin aria-hidden="true" focusable="false" />
                  </span>
                  <span className="font-normal text-slate-500">Location</span>
                </dt>
                <dd className="m-0 pl-4 md:pl-7">
                  <HighlightedText>{project.location}</HighlightedText>
                </dd>
              </dl>
              <p className="md:pl-10">
                <HighlightedText>{project.description}</HighlightedText>
              </p>
              <div className="pl-10">
                <ProjectStack items={project.stack} />
              </div>
            </div>
          </div>
          <div className="absolute right-0 order-first col-span-2 row-span-full whitespace-nowrap pt-3 text-right text-xs text-gray-600">
            <div>{duration}</div>
            <div>{timespan}</div>
          </div>
        </div>
      </div>
    </li>
  );
};

const PROJECT_KEY_DISALLOWED = ["stack"];

function filterProjects(projects: Project[], query: string) {
  return projects.filter((project) => {
    const { stack, ...rest } = project;
    const stackMatches = stack.filter((item) =>
      item.name.toLowerCase().includes(query.toLowerCase()),
    );
    const restMatches = Object.entries(rest).filter(
      ([key, value]) =>
        value.toString().toLowerCase().includes(query.toLowerCase()) &&
        !PROJECT_KEY_DISALLOWED.includes(key),
    );
    return stackMatches.length > 0 || restMatches.length > 0;
  });
}

const ProjectsContent = () => {
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

const Projects = () => {
  return (
    <Suspense fallback={<div>Loading projects...</div>}>
      <ProjectsContent />
    </Suspense>
  );
};

const conferences: StackItem[] = [
  {
    name: "Performance.now()",
    icon: "BrandSpeedtest",
    url: "https://perfnow.nl/",
  },
  {
    name: "React Summit",
    icon: "BrandReact",
    url: "https://reactsummit.com/",
  },
  {
    name: "VueJS Amsterdam",
    icon: "BrandVue",
    url: "https://vuejs.amsterdam/",
  },
];

const Conferences = () => {
  const conferencesId = useId();
  return (
    <>
      <h2 id={conferencesId}>Conferences</h2>
      <ProjectStack items={conferences} />
    </>
  );
};

export default function Experience() {
  return (
    <article className="break-inside-avoid">
      <Projects />
      <Conferences />
    </article>
  );
}
