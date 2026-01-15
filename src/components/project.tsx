"use client";

import { format, parseISO } from "date-fns";

import { memo, useMemo } from "react";

import type { Project as ProjectType } from "~/types";

import { HighlightedText } from "~/components/highlighted";
import { Icon } from "~/components/icon";
import { ProjectStack } from "~/components/project-stack";
import { Ring } from "~/components/ring";
import { calculateProjectDuration } from "~/utils/calculate-experience";

/**
 * Project Component - Individual project card for the portfolio
 *
 * ## Performance Optimization (PERF-004)
 *
 * This component is wrapped in `React.memo` to prevent unnecessary re-renders when:
 * - Parent re-renders but project data hasn't changed
 * - Other projects in the list update their state
 *
 * Expensive calculations are memoized:
 * - `duration` calculation via `useMemo`
 * - `IconProject` lookup via `useMemo`
 * - Date parsing and formatting via `useMemo`
 *
 * ## Accessibility (WCAG 2.2 A11Y-005 - Screen Reader Optimization)
 *
 * - Uses semantic HTML: `<article>` with `aria-labelledby` linking to heading
 * - Proper heading hierarchy: `<h3>` within the projects `<article>` container
 * - `<header>` element wraps the company/project heading
 * - `<time>` elements with `datetime` attributes for machine-readable dates
 * - `<dl>`, `<dt>`, `<dd>` for structured definition lists (role, team, etc.)
 * - All icons use `aria-hidden="true"` and `focusable="false"` (decorative)
 * - External links include `target="_blank"` with `rel="noopener noreferrer"`
 * - External link icon hidden from screen readers (decorative indicator)
 *
 * ## Screen Reader Experience
 *
 * A screen reader will announce:
 * 1. "Article: [Company Name]" (via aria-labelledby)
 * 2. "[Duration]" and "[Date range]"
 * 3. Definition list: "Role: [role], Team: [size] developers, Industry: [industry], Location: [location]"
 * 4. Description paragraph
 * 5. Stack badges (each as "Filter by [technology]" button)
 */
export const Project = memo(function Project({
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
}) {
  // Memoize duration calculation - expensive and only depends on project dates (PERF-004)
  const { duration } = useMemo(
    () => calculateProjectDuration(project.dateFrom, project.dateTo),
    [project.dateFrom, project.dateTo],
  );

  // Memoize icon lookup - prevents lookup on every render (PERF-004)
  const IconProject = useMemo(
    () => Icon[project.icon as keyof typeof Icon] ?? Icon.QuestionMark,
    [project.icon],
  );

  // Build class names based on project state for CSS animations (PROJ-002)
  const stateClass =
    projectState === "enter"
      ? "project-enter"
      : projectState === "exit"
        ? "project-exit"
        : projectState === "stay"
          ? "project-stay"
          : "";

  const className =
    `relative break-inside-avoid-page pb-8 print:pt-8 project-item ${isVisible ? "project-visible" : ""} ${stateClass}`.trim();

  // Memoize date parsing and formatting - expensive parseISO/format calls (PERF-004)
  const { dateFromParsed, dateFromISO, dateToParsed, dateToISO } =
    useMemo(() => {
      const fromParsed = parseISO(project.dateFrom);
      const fromISO = format(fromParsed, "yyyy-MM");
      const toParsed =
        project.dateTo && project.dateTo !== "Present"
          ? parseISO(project.dateTo)
          : null;
      const toISO = toParsed ? format(toParsed, "yyyy-MM") : null;
      return {
        dateFromParsed: fromParsed,
        dateFromISO: fromISO,
        dateToParsed: toParsed,
        dateToISO: toISO,
      };
    }, [project.dateFrom, project.dateTo]);

  return (
    <li
      className={className}
      data-project-id={project.id}
      style={
        {
          "--item-index": String(projectIdx),
          "--total-items": String(totalLength),
        } as React.CSSProperties
      }
      {...attrs}
    >
      <article aria-labelledby={`project-${project.id}-heading`}>
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
            <header>
              <h3
                id={`project-${project.id}-heading`}
                className="mt-2.5 pl-6 text-lg"
              >
                <span className="flex items-center gap-1">
                  {project.url ? (
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-1 hover-hover:text-inherit focus-link"
                    >
                      <HighlightedText>{project.company}</HighlightedText>
                      <Icon.ExternalLink
                        aria-hidden="true"
                        focusable="false"
                        className="h-6 w-6 opacity-0 transition-opacity duration-200 group-hover-hover:opacity-100 group-focus-visible:opacity-100 group-active:opacity-100 text-slate-500"
                      />
                    </a>
                  ) : (
                    <HighlightedText>{project.company}</HighlightedText>
                  )}
                </span>
              </h3>
            </header>
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
                <div>
                  <time dateTime={dateFromISO}>
                    {format(dateFromParsed, "MMM yyyy")}
                  </time>
                  {" - "}
                  {dateToParsed && dateToISO ? (
                    <time dateTime={dateToISO}>
                      {format(dateToParsed, "MMM yyyy")}
                    </time>
                  ) : (
                    <span>Present</span>
                  )}
                </div>
              </div>
              {project.sideProject && (
                <span className="inline-block px-2 py-0.5 text-xs font-medium text-slate-500 bg-slate-50 rounded border border-slate-200 print:hidden">
                  Side project
                </span>
              )}
            </div>
          </div>
        </div>
      </article>
    </li>
  );
});
