import Link from "next/link";
import { differenceInMonths, formatDuration, parseISO, format } from "date-fns";

import { Ring } from "~/components/ring";
import { Stack } from "~/components/stack";
import Image from "next/image";

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

type ListItem = {
  name: string;
  icon: string;
  url?: string;
};

const IconList = ({ items }: { items: ListItem[] }) => {
  return (
    <ul className="-ml-5 list-none" role="list">
      {items.map((item) => (
        <li key={item.name}>
          <div className="flex items-center gap-2">
            <Image
              src={`/images/icons/${item.icon}.svg`}
              className="mb-0 mt-0 opacity-30"
              width={24}
              height={24}
              alt=""
              aria-hidden="true"
            />
            {item.url ? <Link href={item.url}>{item.name}</Link> : item.name}
          </div>
        </li>
      ))}
    </ul>
  );
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
      { name: "Rust", icon: "brand-rust" },
      { name: "WebAssembly", icon: "assembly" },
      { name: "JavaScript", icon: "brand-javascript" },
      { name: "TypeScript", icon: "brand-typescript" },
      { name: "Vue", icon: "brand-vue" },
      { name: "React", icon: "brand-react" },
      { name: "Next.js", icon: "brand-vercel" },
      { name: "Tailwind", icon: "brand-tailwind" },
      { name: "Vite", icon: "brand-vite" },
    ],
    icon: "rocket",
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
      { name: "JavaScript", icon: "brand-javascript" },
      { name: "Lit", icon: "components" },
      { name: "CSS", icon: "brand-css3" },
      { name: "HTML", icon: "brand-html5" },
    ],
    icon: "building-bank",
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
      { name: "React", icon: "brand-react" },
      { name: "Redux", icon: "brand-redux" },
      { name: "TypeScript", icon: "brand-typescript" },
      { name: "Webpack", icon: "brand-javascript" },
      { name: "Jest", icon: "brand-javascript" },
      { name: "Puppeteer", icon: "brand-javascript" },
      { name: "Tailwind", icon: "brand-tailwind" },
      { name: "CSS", icon: "brand-css3" },
      { name: "HTML", icon: "brand-html5" },
    ],
    icon: "news",
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
      { name: "Vue", icon: "brand-vue" },
      { name: "Preact", icon: "brand-react" },
      { name: "GraphQL", icon: "brand-graphql" },
      { name: "Webpack", icon: "brand-javascript" },
      { name: "Jest", icon: "brand-javascript" },
      { name: "JavaScript", icon: "brand-javascript" },
      { name: "CSS", icon: "brand-css3" },
      { name: "HTML", icon: "brand-html5" },
    ],
    icon: "package",
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
      { name: "React", icon: "brand-react" },
      { name: "Redux", icon: "brand-redux" },
      { name: "Redux-saga", icon: "brand-redux" },
      { name: "FlowType", icon: "brand-javascript" },
      { name: "Jest", icon: "brand-javascript" },
      { name: "Webpack", icon: "brand-javascript" },
      { name: "Material UI", icon: "brand-google" },
      { name: "JavaScript", icon: "brand-javascript" },
      { name: "SCSS", icon: "brand-sass" },
      { name: "HTML", icon: "brand-html5" },
    ],
    icon: "health-recognition",
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
      { name: "Knockout.js", icon: "brand-javascript" },
      { name: "JavaScript", icon: "brand-javascript" },
      { name: "CSS", icon: "brand-css3" },
      { name: "HTML", icon: "brand-html5" },
    ],
    icon: "hotel-service",
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
      { name: "JavaScript", icon: "brand-javascript" },
      { name: "SCSS", icon: "brand-sass" },
      { name: "HTML", icon: "brand-html5" },
      { name: "SVG", icon: "svg" },
      { name: "SQL", icon: "sql" },
    ],
    icon: "building-warehouse",
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
      { name: "Visual Basic.NET", icon: "brand-javascript" },
      { name: "SQL Server", icon: "brand-javascript" },
      { name: "PHP", icon: "brand-php" },
      { name: "JavaScript", icon: "brand-javascript" },
      { name: "CSS", icon: "brand-css3" },
      { name: "HTML", icon: "brand-html5" },
    ],
    icon: "heart-handshake",
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
              <Image
                src={`/images/icons/${project.icon}.svg`}
                className="mb-0 mt-0"
                width={24}
                height={24}
                alt=""
                aria-hidden="true"
              />
            </Ring>
          </div>
          <div className="grid min-w-0 flex-1 grid-cols-1 justify-between space-x-4">
            <div className="order-2 col-span-1">
              <h3 className="my-0 text-lg font-semibold">{project.company}</h3>
              <dl className="grid grid-flow-row gap-1 md:grid-cols-2 md:grid-rows-2 md:py-16">
                <dt className="text-slate-400 md:m-0 md:text-right">Role</dt>
                <dd className="m-0 pl-4">{project.role}</dd>
                <dt className="m-0 text-slate-400 md:text-right">Team</dt>
                <dd className="m-0 pl-4">
                  <span className="text-slate-600/80">~</span>
                  <span className="mr-2">{project.teamSize}</span>
                  developers
                </dd>
                <dt className="m-0 text-slate-400 md:text-right">Industry</dt>
                <dd className="m-0 pl-4">{project.industry}</dd>
                <dt className="m-0 text-slate-400 md:text-right">Location</dt>
                <dd className="m-0 pl-4">{project.location}</dd>
                <dt className="m-0 text-slate-400 md:text-right">Stack</dt>
                <dd className="m-0 pl-4 pt-1">
                  <Stack items={project.stack} />
                </dd>
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
    icon: "brand-speedtest",
    url: "https://perfnow.nl/",
  },
  {
    name: "React Summit",
    icon: "brand-react",
    url: "https://reactsummit.com/",
  },
  {
    name: "VueJS Amsterdam",
    icon: "brand-vue",
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
