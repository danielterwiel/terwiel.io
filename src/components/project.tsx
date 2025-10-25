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
  projectAction,
  projectDirection,
  ...attrs
}: {
  project: ProjectType;
  projectIdx: number;
  totalLength: number;
  projectAction?: string;
  projectDirection?: string;
  [key: string]: unknown;
}) => {
  const { duration } = calculateProjectDuration(
    project.dateFrom,
    project.dateTo,
  );
  const timespan = formatProjectTimespan(project.dateFrom, project.dateTo);

  const IconProject =
    Icon[project.icon as keyof typeof Icon] ?? Icon.QuestionMark;

  // Build class names based on action and direction
  const classNames = [
    "relative break-inside-avoid-page pb-8 print:pt-8 project-item",
  ];

  // Only apply directional classes for slide-in/slide-out actions
  // "stay" action items should NOT have directional classes to prevent flicker
  // They will be animated via FLIP (First, Last, Invert, Play) in the transition handler
  if (projectAction === "slide-in" && projectDirection) {
    classNames.push(`project-from-${projectDirection}`);
  }
  if (projectAction === "slide-out" && projectDirection) {
    classNames.push("project-slide-out", `project-from-${projectDirection}`);
  }
  if (projectAction === "fade") {
    classNames.push("project-fade-out");
  }

  return (
    <li
      className={classNames.join(" ")}
      data-project-id={project.id}
      data-project-action={projectAction}
      style={
        {
          "--item-index": String(projectIdx),
          "--total-items": String(totalLength),
          viewTransitionName: `project-${project.id}`,
        } as React.CSSProperties
      }
      {...attrs}
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
          <div className="absolute right-0 order-first col-span-2 row-span-full whitespace-nowrap pt-3 text-right text-xs text-gray-600">
            <div>{duration}</div>
            <div>{timespan}</div>
          </div>
        </div>
      </div>
    </li>
  );
};
