"use client";

import type { Project as ProjectType } from "~/types";

import { HighlightedText } from "~/components/highlighted";
import { Icon } from "~/components/icon";
import { ProjectStack } from "~/components/project-stack";
import { Ring } from "~/components/ring";
import { calculateProjectDuration } from "~/utils/calculate-experience";
import { formatProjectTimespan } from "~/utils/format-project-dates";

export const Project = ({
  project,
  projectIdx,
  totalLength,
  isVisible = false,
  projectState = "stay",
  ...attrs
}: {
  project: ProjectType;
  projectIdx: number;
  totalLength: number;
  isVisible?: boolean;
  projectState?: "exit" | "enter" | "stay";
  [key: string]: unknown;
}) => {
  const { duration } = calculateProjectDuration(
    project.dateFrom,
    project.dateTo,
  );
  const timespan = formatProjectTimespan(project.dateFrom, project.dateTo);

  const IconProject =
    Icon[project.icon as keyof typeof Icon] ?? Icon.QuestionMark;

  const className =
    `relative break-inside-avoid-page pb-8 print:pt-8 project-item ${isVisible ? "project-visible" : ""}`.trim();

  // Create unique transition name per project and state to satisfy View Transitions API uniqueness requirement
  // The API requires each element with view-transition-name to have a unique name
  const vtProjectName = `project-${project.id}-${projectState}`;

  return (
    <li
      className={className}
      data-project-id={project.id}
      style={
        {
          "--item-index": String(projectIdx),
          "--total-items": String(totalLength),
          "--vt-project-name": vtProjectName,
        } as React.CSSProperties
      }
      {...attrs}
    >
      {totalLength > 1 && projectIdx !== totalLength - 1 ? (
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
            <div className="flex items-center gap-1">
              {project.url ? (
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-1 hover:text-inherit"
                >
                  <HighlightedText>{project.company}</HighlightedText>
                  <Icon.ExternalLink
                    aria-hidden="true"
                    className="h-6 w-6 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100 group-active:opacity-100 text-slate-500"
                  />
                </a>
              ) : (
                <HighlightedText>{project.company}</HighlightedText>
              )}
            </div>
          </h3>
          <div className="col-span-2 grid min-w-0 flex-1 grid-cols-1 justify-between md:pl-10">
            <div className="order-2 col-span-1">
              <dl className="mt-0 md:pl-10 grid grid-flow-row grid-cols-[4rem_1fr] gap-1 pt-4 print:mt-8 print:items-stretch">
                <dt className="mt-0 flex gap-2 md:m-0 print:m-0">
                  <span className="font-normal text-slate-500">Role</span>
                </dt>
                <dd className="m-0 pl-4 md:pl-7">
                  <HighlightedText>{project.role}</HighlightedText>
                </dd>

                <dt className="mt-0 flex gap-2 md:m-0 print:m-0">
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
                <dt className="mt-0 flex gap-2 md:m-0 print:m-0">
                  <span className="font-normal text-slate-500">Industry</span>
                </dt>
                <dd className="m-0 pl-4 md:pl-7">
                  <HighlightedText>{project.industry}</HighlightedText>
                </dd>
                <dt className="mt-0 flex gap-2 md:m-0 print:m-0">
                  <span className="font-normal text-slate-500">Location</span>
                </dt>
                <dd className="m-0 pl-4 md:pl-7">
                  <HighlightedText>{project.location}</HighlightedText>
                </dd>
              </dl>
              <p className="md:pl-10 text-pretty">
                <HighlightedText>{project.description}</HighlightedText>
              </p>
              <div className="md:pl-10">
                <ProjectStack items={project.stack} />
              </div>
            </div>
          </div>
          <div className="absolute right-0 order-first col-span-2 row-span-full pt-3 text-right flex flex-col items-end gap-2">
            <div className="whitespace-nowrap text-xs text-gray-600">
              <div>{duration}</div>
              <div>{timespan}</div>
            </div>
            {project.sideProject && (
              <span className="inline-block px-2 py-0.5 text-xs font-medium text-slate-500 bg-slate-50 rounded border border-slate-200 print:hidden">
                Side project
              </span>
            )}
          </div>
        </div>
      </div>
    </li>
  );
};
