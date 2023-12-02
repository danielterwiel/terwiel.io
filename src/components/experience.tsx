"use client";

import { differenceInMonths, formatDuration, parseISO, format } from "date-fns";
import * as Form from "@radix-ui/react-form";
import React from "react";

import { Icon } from "~/components/icon";
import { IconList, type ListItem } from "./icon-list";
import { Ring } from "~/components/ring";
import { StackRow } from "~/components/stack-row";

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

const PROJECTS: Project[] = [
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
      { name: "JavaScript", icon: "BrandJavascript" },
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
      { name: "CSS", icon: "BrandCss3" },
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
      { name: "Visual Basic.NET", icon: "BrandVisualStudio" },
      { name: "SQL Server", icon: "Sql" },
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
    <li
      key={project.id}
      className="relative break-inside-avoid-page pb-8 print:pt-8"
    >
      {projectIdx !== totalLength - 1 ? (
        <span
          className="absolute top-4 ml-[1.4rem] hidden h-full w-0.5 bg-gray-200 sm:block"
          aria-hidden="true"
        />
      ) : null}
      <div className="flex space-x-3">
        <div className="relative grid w-full grid-cols-[2rem_minmax(0,1fr)] gap-2 space-x-3 md:gap-4">
          <div className="h-12 w-12 text-slate-600/80">
            <Ring>
              <IconProject width={24} height={24} aria-hidden="true" />
            </Ring>
          </div>
          <h3 className="mt-2.5 pl-2 text-lg">{project.company}</h3>
          <div className="col-span-2 grid min-w-0 flex-1 grid-cols-1 justify-between space-x-4 md:pl-10">
            <div className="order-2 col-span-1">
              <dl className="mt-0 grid grid-flow-row gap-1 pt-4 print:mt-8 print:grid-cols-[20rem_1fr] print:items-stretch md:grid-cols-[12rem_1fr]">
                <dt className="mt-0 flex gap-2 print:m-0 print:justify-end md:m-0 md:justify-end">
                  <span className="text-slate-500/50">
                    <Icon.User width={24} height={24} aria-hidden="true" />
                  </span>
                  <span className="font-normal text-slate-500">Role</span>
                </dt>
                <dd className="m-0 pl-4 md:pl-7">{project.role}</dd>
                <dt className="mt-0 flex gap-2 print:m-0 print:justify-end md:m-0 md:justify-end">
                  <span className=" text-slate-500/50">
                    <Icon.UsersGroup
                      width={24}
                      height={24}
                      aria-hidden="true"
                    />
                  </span>
                  <span className="font-normal text-slate-500">Team</span>
                </dt>
                <dd className="m-0 pl-4 md:pl-7">
                  ~<span className="mr-2">{project.teamSize}</span>
                  developers
                </dd>
                <dt className="mt-0 flex gap-2 print:m-0 print:justify-end md:m-0 md:justify-end">
                  <span className="text-slate-500/50">
                    <Icon.BuildingFactory2
                      width={24}
                      height={24}
                      aria-hidden="true"
                    />
                  </span>
                  <span className="font-normal text-slate-500">Industry</span>
                </dt>
                <dd className="m-0 pl-4 md:pl-7">{project.industry}</dd>
                <dt className="mt-0 flex gap-2 print:m-0 print:justify-end md:m-0 md:justify-end">
                  <span className="text-slate-500/50">
                    <Icon.MapPin width={24} height={24} aria-hidden="true" />
                  </span>
                  <span className="font-normal text-slate-500">Location</span>
                </dt>
                <dd className="m-0 pl-4 md:pl-7">{project.location}</dd>
                <StackRow items={project.stack} />
              </dl>
              <p>{project.description}</p>
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

const SearchSummary = ({
  searchTerm,
  items,
}: {
  searchTerm: string;
  items: Project[];
}) => {
  const total = items.length;
  const monthsDiff = new Set<number>();
  for (const project of items) {
    const dateFrom = parseISO(project.dateFrom);
    const dateTo = parseISO(project.dateTo);
    const diffInMonths = differenceInMonths(dateTo, dateFrom) + 1;
    monthsDiff.add(diffInMonths);
  }
  const monthsSum = Array.from(monthsDiff).reduce((acc, curr) => acc + curr, 0);
  const years = Math.floor(monthsSum / 12);
  const months = monthsSum % 12;

  const duration = formatDuration({ months, years });
  return (
    <div className="text-klein border-klein/50 m4-8 rounded-md border-2 px-3 py-6 text-center print:hidden">
      {total === 0 ? (
        <span>Your search did not return any projects</span>
      ) : (
        <>
          <div>
            Your search for <strong>{searchTerm}</strong> returned{" "}
            <strong>{total}</strong> projects with a total duration of{" "}
            <strong>{duration}</strong>.
          </div>
        </>
      )}
    </div>
  );
};

const PROJECT_KEY_DISALLOWED = ["stack"];

const Projects = () => {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filtered, setFiltered] = React.useState(PROJECTS);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event?.target?.value);
  };

  React.useEffect(() => {
    if (searchTerm === "") setFiltered(PROJECTS);
    const filteredProjects = PROJECTS.filter((project) => {
      const { stack, ...rest } = project;
      const stackMatches = stack.filter((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()),
      );
      const restMatches = Object.entries(rest).filter(([key, value]) => {
        if (
          value.toString().toLowerCase().includes(searchTerm.toLowerCase()) &&
          !PROJECT_KEY_DISALLOWED.includes(key)
        ) {
          return true;
        }
      });
      return stackMatches.length > 0 || restMatches.length > 0;
    });
    setFiltered(filteredProjects);
  }, [searchTerm]);

  return (
    <>
      <h2>Projects</h2>
      <div className="flow-root space-y-4">
        <Form.Root
          className="print:hidden"
          onSubmit={(e) => e.preventDefault()}
        >
          <Form.Field name="term">
            <div>
              <Form.Label>Search keyword</Form.Label>
              <Form.Message match="typeMismatch">
                Please provide a your search term
              </Form.Message>
            </div>
            <Form.Control asChild>
              <input
                type="search"
                placeholder="e.g. Sendcloud, 2022, Rust"
                value={searchTerm}
                onChange={handleInputChange}
                className="focus:border-klein w-full rounded-md border px-4 py-2 transition-colors focus:outline-none"
              />
            </Form.Control>
          </Form.Field>
        </Form.Root>

        {searchTerm ? (
          <SearchSummary searchTerm={searchTerm} items={filtered} />
        ) : null}

        <ol className="ml-0 list-none pl-0" role="list">
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
