"use client";

import { differenceInMonths, formatDuration, parseISO, format } from "date-fns";
import { IconList, type ListItem } from "./icon-list";

import React from "react";

import { Ring } from "~/components/ring";
import { Stack } from "~/components/stack";

import { Icon } from "~/components/icon";

type StackItem = {
  name: string;
  icon: string;
};

type Project = {
  id: string;
  company: string;
  role: string;
  teamSize: number;
  industry: string;
  location: string;
  dateFrom: string;
  dateTo: string;
  description: string;
  stack: StackItem[];
  icon: string;
};

const projects: Project[] = [
  {
    id: "PROJECT_0",
    company: "Departure Labs",
    role: "Full-stack Developer & Designer",
    teamSize: 5,
    industry: "Developer tools",
    location: "Boston/Remote",
    dateFrom: "2022-02-01",
    dateTo: "2023-09-30",
    description:
      "Departure Labs started as a side project. When the technical founder, whom I met over Twitter, told me she had raised money to work on it full-time, I joined her in this adventure. After five unsuccessful blockchain products, we pivoted to creating a WebAssembly-enabled cloud platform.",
    stack: [
      { name: "Rust", icon: "BrandRust" },
      { name: "WebAssembly", icon: "Assembly" },
      { name: "JavaScript", icon: "BrandJavascript" },
      { name: "TypeScript", icon: "BrandTypescript" },
      { name: "Vue", icon: "BrandVue" },
      { name: "React", icon: "BrandReact" },
      { name: "Next.js", icon: "BrandVercel" },
      { name: "Tailwind", icon: "BrandTailwind" },
      { name: "Vite", icon: "BrandVite" },
    ],
    icon: "Rocket",
  },
  {
    id: "PROJECT_1",
    company: "ING",
    role: "Senior Front End Developer",
    teamSize: 200,
    industry: "Finance",
    location: "Amsterdam",
    dateFrom: "2021-06-01",
    dateTo: "2022-01-31",
    description:
      "Touchpoint at ING is a department that develops a multi-component, plug-and-play platform, allowing all ING branches to integrate a unified user experience. I worked on authentication and utility libraries.",
    stack: [
      { name: "JavaScript", icon: "BrandJavascript" },
      { name: "Lit", icon: "Components" },
      { name: "CSS", icon: "BrandCss3" },
      { name: "HTML", icon: "BrandHtml5" },
    ],
    icon: "BuildingBank",
  },
  {
    id: "PROJECT_2",
    company: "M&I",
    role: "Senior Front End Developer",
    teamSize: 4,
    industry: "Media & Publishing",
    location: "Hilversum",
    dateFrom: "2020-06-01",
    dateTo: "2021-05-31",
    description:
      "Here, I maintained and updated a four-year-old newsroom management application used by large media outlets in the Benelux.",
    stack: [
      { name: "React", icon: "BrandReact" },
      { name: "Redux", icon: "BrandRedux" },
      { name: "TypeScript", icon: "BrandTypescript" },
      { name: "Webpack", icon: "BrandJavascript" },
      { name: "Jest", icon: "BrandJavascript" },
      { name: "Puppeteer", icon: "BrandJavascript" },
      { name: "Tailwind", icon: "BrandTailwind" },
      { name: "CSS", icon: "BrandCss3" },
      { name: "HTML", icon: "BrandHtml5" },
    ],
    icon: "News",
  },
  {
    id: "PROJECT_3",
    company: "Sendcloud",
    role: "Senior Front End Developer",
    teamSize: 40,
    industry: "Logistics",
    location: "Eindhoven",
    dateFrom: "2019-02-01",
    dateTo: "2020-06-01",
    description:
      "One of the fastest-growing scale-ups in the Netherlands. I was responsible for replacing legacy parts of the application with reimplementations in Vue. In addition to building out our design system, I redeveloped the subscription page and co-created the returns portal: a high-traffic, consumer-facing web application.",
    stack: [
      { name: "Vue", icon: "BrandVue" },
      { name: "Preact", icon: "BrandReact" },
      { name: "GraphQL", icon: "BrandGraphql" },
      { name: "Webpack", icon: "BrandJavascript" },
      { name: "Jest", icon: "BrandJavascript" },
      { name: "JavaScript", icon: "BrandJavascript" },
      { name: "CSS", icon: "BrandCss3" },
      { name: "HTML", icon: "BrandHtml5" },
    ],
    icon: "Package",
  },
  {
    id: "PROJECT_4",
    company: "Iperion",
    role: "Front End Developer",
    teamSize: 4,
    industry: "Life Sciences",
    location: "Vlijmen",
    dateFrom: "2016-06-01",
    dateTo: "2019-01-31",
    description:
      "At Iperion, I worked on GxP Cloud. I had the opportunity to design and develop a greenfield application.",
    stack: [
      { name: "React", icon: "BrandReact" },
      { name: "Redux", icon: "BrandRedux" },
      { name: "Redux-saga", icon: "BrandRedux" },
      { name: "FlowType", icon: "BrandJavascript" },
      { name: "Jest", icon: "BrandJavascript" },
      { name: "Webpack", icon: "BrandJavascript" },
      { name: "Material UI", icon: "BrandGoogle" },
      { name: "JavaScript", icon: "BrandJavascript" },
      { name: "SCSS", icon: "BrandSass" },
      { name: "HTML", icon: "BrandHtml5" },
    ],
    icon: "HealthRecognition",
  },
  {
    id: "PROJECT_5",
    company: "Amadeus",
    role: "Front End Developer",
    teamSize: 30,
    industry: "Hospitality",
    location: "Breda",
    dateFrom: "2015-03-01",
    dateTo: "2019-01-31",
    description:
      "At Amadeus, I worked on ELS, a single-page application built with Knockout.js for the hospitality industry.",
    stack: [
      { name: "Knockout.js", icon: "BrandJavascript" },
      { name: "JavaScript", icon: "BrandJavascript" },
      { name: "CSS", icon: "BrandCss3" },
      { name: "HTML", icon: "BrandHtml5" },
    ],
    icon: "HotelService",
  },
  {
    id: "PROJECT_6",
    company: "Dinto",
    role: "Front End Developer",
    teamSize: 6,
    industry: "Logistics",
    location: "Breda",
    dateFrom: "2013-10-01",
    dateTo: "2014-10-31",
    description:
      "Working at Dinto, my role was to create interactive blueprints of warehouses using SVG, SQL, and JavaScript.",
    stack: [
      { name: "JavaScript", icon: "BrandJavascript" },
      { name: "SCSS", icon: "BrandSass" },
      { name: "HTML", icon: "BrandHtml5" },
      { name: "SVG", icon: "Svg" },
      { name: "SQL", icon: "Sql" },
    ],
    icon: "BuildingWarehouse",
  },
  {
    id: "PROJECT_7",
    company: "Finview",
    role: "Developer",
    teamSize: 2,
    industry: "Finance",
    location: "Breda",
    dateFrom: "2007-01-01",
    dateTo: "2013-06-30",
    description: "I created websites and a CRM system for financial advisors.",
    stack: [
      { name: "Visual Basic.NET", icon: "BrandJavascript" },
      { name: "SQL Server", icon: "BrandJavascript" },
      { name: "PHP", icon: "BrandPhp" },
      { name: "JavaScript", icon: "BrandJavascript" },
      { name: "CSS", icon: "BrandCss3" },
      { name: "HTML", icon: "BrandHtml5" },
    ],
    icon: "HeartHandshake",
  },
];

const Project = ({
  project,
  projectIdx,
  totalLength,
}: {
  project: Project;
  projectIdx: number;
  totalLength: number;
}) => {
  const dateFrom = parseISO(project.dateFrom);
  const dateTo = parseISO(project.dateTo);
  const diffInMonths = differenceInMonths(dateTo, dateFrom) + 1;
  const years = Math.floor(diffInMonths / 12);
  const months = diffInMonths % 12;
  const duration = formatDuration({ months, years });
  const from = format(dateFrom, "MMM yy");
  const to = format(dateTo, "MMM yy");
  const fromApos = from.replace(/\d+/g, "'$&");
  const toApos = to.replace(/\d+/g, "'$&");
  const timespan = `${fromApos} - ${toApos}`;

  const IconProject = Icon[project.icon as keyof typeof Icon];

  return (
    <div key={project.id} className="relative break-after-page pb-8 print:pt-8">
      {projectIdx !== totalLength - 1 ? (
        <span
          className="absolute left-4 top-4 -ml-px hidden h-full w-0.5 bg-gray-200 sm:block"
          aria-hidden="true"
        />
      ) : null}{" "}
      <div className="relative flex space-x-3">
        <div className="relative flex gap-2 space-x-3 md:gap-4">
          <div className="hidden sm:block">
            <Ring size={8} animationDuration={8}>
              <IconProject width={24} height={24} aria-hidden="true" />
            </Ring>
          </div>
          <div className="grid min-w-0 flex-1 grid-cols-1 justify-between space-x-4">
            <div className="order-2 col-span-1">
              <h3 className="my-0 text-lg font-semibold">{project.company}</h3>
              <dl className="grid grid-flow-row gap-1 md:grid-cols-2 md:items-stretch md:py-16">
                <dt className="flex gap-2 md:m-0 md:justify-end">
                  <span className="text-slate-400/50">
                    <Icon.User width={24} height={24} aria-hidden="true" />
                  </span>
                  <span className="text-slate-400">Role</span>
                </dt>
                <dd className="m-0 pl-4">{project.role}</dd>
                <dt className="flex gap-2 md:m-0 md:justify-end">
                  <span className=" text-slate-400/50">
                    <Icon.UsersGroup
                      width={24}
                      height={24}
                      aria-hidden="true"
                    />
                  </span>
                  <span className="text-slate-400">Team</span>
                </dt>
                <dd className="m-0 pl-4">
                  ~<span className="mr-2">{project.teamSize}</span>
                  developers
                </dd>
                <dt className="flex gap-2 md:m-0 md:justify-end">
                  <span className="text-slate-400/50">
                    <Icon.BuildingFactory2
                      width={24}
                      height={24}
                      aria-hidden="true"
                    />
                  </span>
                  <span className="text-slate-400">Industry</span>
                </dt>
                <dd className="m-0 pl-4">{project.industry}</dd>
                <dt className="flex gap-2 md:m-0 md:justify-end">
                  <span className=" text-slate-400/50">
                    <Icon.MapPin width={24} height={24} aria-hidden="true" />
                  </span>
                  <span className="text-slate-400">Location</span>
                </dt>
                <dd className="m-0 pl-4">{project.location}</dd>
                <Stack items={project.stack} />
              </dl>
              <p>{project.description}</p>
            </div>
            <div className="sm:overlapping-item absolute right-0 top-1.5 whitespace-nowrap text-right text-sm text-gray-500">
              <div className="text-xs">{duration}</div>
              <div className="text-xs opacity-70">{timespan}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Projects = () => {
  return (
    <>
      <h2>Projects</h2>
      <div className="flow-root">
        <ul role="list" className="-mb-8 -ml-4 list-none">
          {projects.map((project, projectIdx) => (
            <Project
              key={project.company}
              project={project}
              projectIdx={projectIdx}
              totalLength={projects.length}
            />
          ))}
        </ul>
      </div>
    </>
  );
};

const conferences: ListItem[] = [
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
  return (
    <>
      <h2>Conferences</h2>
      <IconList items={conferences} />
    </>
  );
};

export default function Experience() {
  return (
    <article>
      <Projects />
      <Conferences />
    </article>
  );
}
