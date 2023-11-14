import {
  IconRocket,
  IconBuildingBank,
  IconNews,
  IconPackage,
  IconHealthRecognition,
  IconHotelService,
  IconBuildingWarehouse,
  IconHeartHandshake,
  IconBrandRust,
  IconBrandHtml5,
  IconBrandVue,
  IconBrandReact,
  IconBrandCss3,
  IconBrandJavascript,
  IconBrandTypescript,
  IconBrandVercel,
  IconBrandTailwind,
  IconBrandVite,
  IconAssembly,
  IconBrandGraphql,
  IconBrandGoogle,
  IconBrandRedux,
  IconBrandPhp,
  IconBrandSpeedtest,
} from "@tabler/icons-react";

import React from "react";

type StackItem = {
  name: string;
  icon: React.ElementType;
};

type Project = {
  company: string;
  role: string;
  teamSize: number;
  location: string;
  duration: string;
  description: string;
  stack: StackItem[];
  icon: React.ElementType;
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
    company: "Departure Labs",
    role: "Full-stack Developer & Designer",
    teamSize: 5,
    location: "Boston/Remote",
    duration: "2021 - present",
    description:
      "Departure Labs started off as a side-project. When the technical founder whom I met over Twitter told me she raised money to work on it full-time I joined her. After 5 failed blockchain products, we pivoted to creating a WebAssembly enabled Cloud platform. Created OSS: libraries, webapps, Rust tooling packages.",
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
    company: "ING",
    role: "Senior Front End Developer",
    teamSize: 200,
    location: "Amsterdam",
    duration: "2021 - 2021",
    description:
      "Touchpoint at ING is a department that develops a multiple component, plug-able platform, allowing all ING branches to integrate a unified User Experience. Worked on: authentication & utility libraries.",
    stack: [
      { name: "JavaScript", icon: IconBrandJavascript },
      { name: "JSDoc", icon: IconBrandJavascript }, // Using JavaScript icon as a placeholder
      { name: "Web Components", icon: IconBrandHtml5 }, // Assuming HTML5 icon is a fit
      { name: "Lit", icon: IconBrandHtml5 }, // Using JavaScript icon as a placeholder
    ],
    icon: IconBuildingBank,
  },
  {
    company: "M&I",
    role: "Senior Front End Developer",
    teamSize: 3,
    location: "Hilversum",
    duration: "2020 - 2021",
    description:
      "Here I maintained and updated a 4-year old Newsroom management application used by large media outlets in The Benelux. Notable achievements: created a video & audio editor, implemented a mobile-first redesign.",
    stack: [
      { name: "React", icon: IconBrandReact },
      { name: "Redux", icon: IconBrandRedux }, // Using React icon as a placeholder
      { name: "TypeScript", icon: IconBrandTypescript },
      { name: "Webpack", icon: IconBrandJavascript }, // Using JavaScript icon as a placeholder
      { name: "Jest", icon: IconBrandJavascript }, // Using JavaScript icon as a placeholder
      { name: "Puppeteer", icon: IconBrandJavascript }, // Using JavaScript icon as a placeholder
      { name: "Tailwind", icon: IconBrandTailwind },
    ],
    icon: IconNews,
  },
  {
    company: "Sendcloud",
    role: "Senior Front End Developer",
    teamSize: 40,
    location: "Eindhoven",
    duration: "2019 - 2020",
    description:
      "One of the fastest growing startups in The Netherlands. I was responsible for replacing legacy parts of the application with reïmplementations in Vue. Next to building out our design system I’ve done a reïmplementation of the subscription page and co-created the returns portal: a high-traffic consumer-facing web application.",
    stack: [
      { name: "Vue", icon: IconBrandVue },
      { name: "Preact", icon: IconBrandReact }, // Using React icon as a related placeholder
      { name: "JavaScript", icon: IconBrandJavascript },
      { name: "SCSS", icon: IconBrandCss3 }, // Assuming CSS3 icon is a fit
      { name: "HTML", icon: IconBrandHtml5 },
      { name: "GraphQL", icon: IconBrandGraphql }, // Using JavaScript icon as a placeholder
      { name: "Webpack", icon: IconBrandJavascript }, // Using JavaScript icon as a placeholder
      { name: "Jest", icon: IconBrandJavascript }, // Using JavaScript icon as a placeholder
      { name: "CI", icon: IconBrandReact }, // Using React icon as a placeholder
    ],
    icon: IconPackage,
  },
  {
    company: "IPERION",
    role: "Front End Developer",
    teamSize: 4,
    location: "Vlijmen",
    duration: "2016 - 2019",
    description:
      "At IPERION I worked on GxP Cloud. I got the chance to design and develop a greenfield application.",
    stack: [
      { name: "React", icon: IconBrandReact },
      { name: "Redux", icon: IconBrandRedux }, // Using React icon as a placeholder
      { name: "Redux-saga", icon: IconBrandRedux }, // Using React icon as a placeholder
      { name: "FlowType", icon: IconBrandJavascript }, // Using JavaScript icon as a placeholder
      { name: "Jest", icon: IconBrandJavascript }, // Using JavaScript icon as a placeholder
      { name: "Webpack", icon: IconBrandJavascript }, // Using JavaScript icon as a placeholder
      { name: "Material UI", icon: IconBrandGoogle }, // Using React icon as a placeholder
    ],
    icon: IconHealthRecognition,
  },
  {
    company: "Amadeus",
    role: "Front End Developer",
    teamSize: 30,
    location: "Breda",
    duration: "2015 - 2016",
    description:
      "At Amadeus I worked on ELS, which is an enterprise SPA built with Knockout.js for the Hospitality industry.",
    stack: [
      { name: "Knockout.js", icon: IconBrandJavascript }, // Using JavaScript icon as a placeholder
      { name: "HTML", icon: IconBrandHtml5 },
      { name: "CSS", icon: IconBrandCss3 },
      { name: "JavaScript", icon: IconBrandJavascript },
    ],
    icon: IconHotelService,
  },
  {
    company: "Dinto",
    role: "Front End Developer",
    teamSize: 6,
    location: "Breda",
    duration: "2013 - 2014",
    description:
      "Working at Dinto, I had the job to create interactive blueprints of warehouses using SVG, SQL and JavaScript.",
    stack: [
      { name: "HTML", icon: IconBrandHtml5 },
      { name: "CSS", icon: IconBrandCss3 },
      { name: "JavaScript", icon: IconBrandJavascript },
      { name: "SVG", icon: IconBrandHtml5 }, // Using HTML5 icon as a placeholder
      { name: "SQL", icon: IconBrandJavascript }, // Using JavaScript icon as a placeholder
    ],
    icon: IconBuildingWarehouse,
  },
  {
    company: "Finview",
    role: "Developer",
    teamSize: 2,
    location: "Breda",
    duration: "2007 – 2013",
    description: "Created websites and a CRM. Here I made my very first steps.",
    stack: [
      { name: "Visual Basic.NET", icon: IconBrandJavascript }, // Using JavaScript icon as a placeholder
      { name: "SQL Server", icon: IconBrandJavascript }, // Using JavaScript icon as a placeholder
      { name: "JavaScript", icon: IconBrandJavascript },
      { name: "CSS", icon: IconBrandCss3 },
      { name: "HTML", icon: IconBrandHtml5 },
      { name: "PHP", icon: IconBrandPhp }, // Using JavaScript icon as a placeholder
    ],
    icon: IconHeartHandshake,
  },
];

type ListItem = {
  name: string;
  icon: React.ElementType;
};

const IconList = ({ items }: { items: ListItem[] }) => {
  return (
    <ul className="-ml-5 list-none">
      {items.map((item) => (
        <li key={item.name}>
          <div className="flex items-center gap-2">
            <item.icon className="h-5 w-5 opacity-30" aria-hidden="true" />
            {item.name}
          </div>
        </li>
      ))}
    </ul>
  );
};

const Project = ({
  project,
  projectIdx,
  totalLength,
}: {
  project: Project;
  projectIdx: number;
  totalLength: number;
}) => {
  return (
    <div key={project.company} className="relative pb-8">
      {projectIdx !== totalLength - 1 ? (
        <span
          className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200"
          aria-hidden="true"
        />
      ) : null}{" "}
      <div className="relative flex space-x-3 ">
        <div className="relative flex gap-2 space-x-3 md:gap-4">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white ring-8 ring-slate-200">
            <project.icon className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="grid min-w-0 flex-1 grid-cols-1 justify-between space-x-4 pt-1.5">
            <div className="order-2 col-span-1">
              <h3 className="-mt-1 text-lg font-semibold">{project.company}</h3>
              <div>
                <span className="pr-1 text-slate-400">Role:</span>
                <span>{project.role}</span>
              </div>
              <div>
                <span className="pr-1 text-slate-400">Team size:</span>
                <span>~{project.teamSize} developers</span>
              </div>
              <div>
                <span className="pr-1 text-slate-400">Location:</span>
                <span>{project.location}</span>
              </div>
              <p>{project.description}</p>
              <IconList items={project.stack} />
            </div>
            <div className="overlapping-item absolute right-0 top-0 whitespace-nowrap text-right text-sm text-gray-500">
              <time dateTime={project.duration}>{project.duration}</time>
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
        <ul role="list" className="-ml-4 list-none">
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
  { name: "Performance.now()", icon: IconBrandSpeedtest },
  { name: "React Amsterdam", icon: IconBrandReact },
  { name: "Vue Amsterdam", icon: IconBrandVue },
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
