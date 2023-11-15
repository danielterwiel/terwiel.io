import {
  IconAssembly,
  IconBrandCss3,
  IconBrandGoogle,
  IconBrandGraphql,
  IconBrandHtml5,
  IconBrandJavascript,
  IconBrandPhp,
  IconBrandReact,
  IconBrandRedux,
  IconBrandRust,
  IconBrandSass,
  IconBrandSpeedtest,
  IconBrandTailwind,
  IconBrandTypescript,
  IconBrandVercel,
  IconBrandVite,
  IconBrandVue,
  IconBuildingBank,
  IconBuildingWarehouse,
  IconComponents,
  IconHealthRecognition,
  IconHeartHandshake,
  IconHotelService,
  IconNews,
  IconPackage,
  IconRocket,
  IconSql,
  IconStackPop,
  IconStackPush,
  IconSvg,
} from "@tabler/icons-react";
import Link from "next/link";
import { differenceInMonths, formatDuration, parseISO, format } from "date-fns";

import { Ring } from "./ring";

type StackItem = {
  name: string;
  icon: React.ElementType;
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
  icon: React.ElementType;
};

type ListItem = {
  name: string;
  icon: React.ElementType;
  url?: string;
};

const IconList = ({ items }: { items: ListItem[] }) => {
  return (
    <ul className="-ml-5 list-none" role="list">
      {items.map((item) => (
        <li key={item.name}>
          <div className="flex items-center gap-2">
            <item.icon className="h-5 w-5 opacity-30" aria-hidden="true" />
            {item.url ? <Link href={item.url}>{item.name}</Link> : item.name}
          </div>
        </li>
      ))}
    </ul>
  );
};

const IconBrandVitest = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2}
    className="h-5 w-5 opacity-30"
    viewBox="0 0 256 256"
    aria-hidden="true"
  >
    <path
      fill="currentColor"
      d="M192.115 70.808l-61.2 88.488a5.27 5.27 0 01-2.673 2.002 5.285 5.285 0 01-3.343-.005 5.25 5.25 0 01-2.66-2.01 5.214 5.214 0 01-.903-3.203l2.45-48.854-39.543-8.386a5.256 5.256 0 01-2.292-1.118 5.222 5.222 0 01-1.83-4.581 5.226 5.226 0 01.895-2.383L142.218 2.27a5.279 5.279 0 016.016-1.996 5.243 5.243 0 012.66 2.01c.643.942.96 2.066.903 3.203l-2.45 48.855 39.542 8.386a5.262 5.262 0 012.293 1.117 5.21 5.21 0 011.829 4.582 5.212 5.212 0 01-.896 2.382z"
    />
    <path
      fill="currentColor"
      d="M128.025 233.537a12.356 12.356 0 01-8.763-3.63l-57.828-57.823a12.389 12.389 0 01.023-17.5 12.394 12.394 0 0117.5-.024l49.068 49.061L234.917 96.733a12.39 12.39 0 0117.523 17.524l-115.655 115.65a12.343 12.343 0 01-8.76 3.63z"
    />
    <path
      fill="currentColor"
      d="M127.975 233.537a12.356 12.356 0 008.763-3.63l57.828-57.823a12.385 12.385 0 003.605-8.754 12.395 12.395 0 00-12.375-12.376 12.4 12.4 0 00-8.755 3.606l-49.066 49.061L21.082 96.733a12.392 12.392 0 00-17.524 17.524l115.656 115.65a12.347 12.347 0 008.76 3.63z"
    />
  </svg>
);

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
      { name: "Rust", icon: IconBrandRust },
      { name: "WebAssembly", icon: IconAssembly },
      { name: "JavaScript", icon: IconBrandJavascript },
      { name: "TypeScript", icon: IconBrandTypescript },
      { name: "Vue", icon: IconBrandVue },
      { name: "React", icon: IconBrandReact },
      { name: "Next.js", icon: IconBrandVercel },
      { name: "Tailwind", icon: IconBrandTailwind },
      { name: "Vite", icon: IconBrandVite },
      { name: "Vitest", icon: IconBrandVitest },
    ],
    icon: IconRocket,
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
      { name: "JavaScript", icon: IconBrandJavascript },
      { name: "Lit", icon: IconComponents },
      { name: "CSS", icon: IconBrandCss3 },
      { name: "HTML", icon: IconBrandHtml5 },
    ],
    icon: IconBuildingBank,
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
      { name: "React", icon: IconBrandReact },
      { name: "Redux", icon: IconBrandRedux },
      { name: "TypeScript", icon: IconBrandTypescript },
      { name: "Webpack", icon: IconBrandJavascript }, // Using JavaScript icon as a placeholder
      { name: "Jest", icon: IconBrandJavascript }, // Using JavaScript icon as a placeholder
      { name: "Puppeteer", icon: IconBrandJavascript }, // Using JavaScript icon as a placeholder
      { name: "Tailwind", icon: IconBrandTailwind },
      { name: "CSS", icon: IconBrandCss3 },
      { name: "HTML", icon: IconBrandHtml5 },
    ],
    icon: IconNews,
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
      { name: "Vue", icon: IconBrandVue },
      { name: "Preact", icon: IconBrandReact }, // Using React icon as a related placeholder
      { name: "GraphQL", icon: IconBrandGraphql }, // Using JavaScript icon as a placeholder
      { name: "Webpack", icon: IconBrandJavascript }, // Using JavaScript icon as a placeholder
      { name: "Jest", icon: IconBrandJavascript }, // Using JavaScript icon as a placeholder
      { name: "JavaScript", icon: IconBrandJavascript },
      { name: "CSS", icon: IconBrandCss3 },
      { name: "HTML", icon: IconBrandHtml5 },
    ],
    icon: IconPackage,
  },
  {
    id: "PROJECT_4",
    company: "IPERION",
    role: "Front End Developer",
    teamSize: 4,
    industry: "Life Sciences",
    location: "Vlijmen",
    dateFrom: "2016-06-01",
    dateTo: "2019-01-31",
    description:
      "At IPERION, I worked on GxP Cloud. I had the opportunity to design and develop a greenfield application.",
    stack: [
      { name: "React", icon: IconBrandReact },
      { name: "Redux", icon: IconBrandRedux },
      { name: "Redux-saga", icon: IconBrandRedux },
      { name: "FlowType", icon: IconBrandJavascript }, // Using JavaScript icon as a placeholder
      { name: "Jest", icon: IconBrandJavascript }, // Using JavaScript icon as a placeholder
      { name: "Webpack", icon: IconBrandJavascript }, // Using JavaScript icon as a placeholder
      { name: "Material UI", icon: IconBrandGoogle }, // Using React icon as a placeholder
      { name: "JavaScript", icon: IconBrandJavascript },
      { name: "SCSS", icon: IconBrandSass }, // Assuming CSS3 icon is a fit
      { name: "HTML", icon: IconBrandHtml5 },
    ],
    icon: IconHealthRecognition,
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
      "At Amadeus, I worked on ELS, an enterprise single-page application (SPA) built with Knockout.js for the hospitality industry.",
    stack: [
      { name: "Knockout.js", icon: IconBrandJavascript }, // Using JavaScript icon as a placeholder
      { name: "JavaScript", icon: IconBrandJavascript },
      { name: "SCSS", icon: IconBrandSass }, // Assuming CSS3 icon is a fit
      { name: "HTML", icon: IconBrandHtml5 },
    ],
    icon: IconHotelService,
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
      { name: "JavaScript", icon: IconBrandJavascript },
      { name: "SCSS", icon: IconBrandSass },
      { name: "HTML", icon: IconBrandHtml5 },
      { name: "SVG", icon: IconSvg },
      { name: "SQL", icon: IconSql },
    ],
    icon: IconBuildingWarehouse,
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
      { name: "Visual Basic.NET", icon: IconBrandJavascript }, // Using JavaScript icon as a placeholder
      { name: "SQL Server", icon: IconBrandJavascript }, // Using JavaScript icon as a placeholder
      { name: "PHP", icon: IconBrandPhp },
      { name: "JavaScript", icon: IconBrandJavascript },
      { name: "CSS", icon: IconBrandCss3 },
      { name: "HTML", icon: IconBrandHtml5 },
    ],
    icon: IconHeartHandshake,
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
  const fromApos = from.replace(/\d+/g, "'$&"); // prepend apostrophes
  const toApos = to.replace(/\d+/g, "'$&"); // prepend apostrophes
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
              <project.icon className="h-5 w-5 " aria-hidden="true" />
            </Ring>
          </div>
          <div className="grid min-w-0 flex-1 grid-cols-1 justify-between space-x-4 pt-1.5">
            <div className="order-2 col-span-1">
              <h3 className="-mt-1 text-lg font-semibold">{project.company}</h3>
              <dl>
                <dt className="text-slate-400">Role</dt>
                <dd className="pl-4">{project.role}</dd>
                <dt className="text-slate-400">Team size</dt>
                <dd className="pl-4">
                  <span className="text-slate-600/80">~</span>
                  {project.teamSize}
                  <span className="text-slate-600/80"> developers</span>
                </dd>
                <dt className="text-slate-400">Industry</dt>
                <dd className="pl-4">{project.industry}</dd>
                <dt className="text-slate-400">Location</dt>
                <dd className="pl-4">{project.location}</dd>
              </dl>
              <p>{project.description}</p>
              <details open className="group">
                <summary className="cursor-pointer list-none opacity-70 hover:opacity-100  [&::-webkit-details-marker]:hidden">
                  <div className="flex items-center gap-2">
                    <IconStackPush
                      aria-hidden="true"
                      className="block group-open:hidden"
                    />
                    <IconStackPop
                      aria-hidden="true"
                      className="hidden group-open:block"
                    />
                    <div>Stack</div>
                  </div>
                </summary>
                <IconList items={project.stack} />
              </details>
            </div>
            <div className="sm:overlapping-item absolute right-0 top-1.5 whitespace-nowrap pt-1.5 text-right text-sm text-gray-500">
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
        <ul role="list" className="-mb-8 -ml-4 list-none ">
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
    icon: IconBrandSpeedtest,
    url: "https://perfnow.nl/",
  },
  {
    name: "React Summit",
    icon: IconBrandReact,
    url: "https://reactsummit.com/",
  },
  {
    name: "VueJS Amsterdam",
    icon: IconBrandVue,
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
