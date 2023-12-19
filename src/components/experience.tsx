"use client";

import React from "react";
import { differenceInMonths, formatDuration, parseISO, format } from "date-fns";
import { useSearchParams } from "next/navigation";

import { HighlightedText } from "~/components/highlighted";
import { Icon } from "~/components/icon";
import { IconList, type ListItem } from "./icon-list";
import { Ring } from "~/components/ring";
import { SearchInput, SearchSummary } from "./search";
import { StackRow } from "~/components/stack-row";

type StackItem = {
  name: string;
  icon: string;
  url: string;
};

export type Project = {
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
    industry: "Finance & Developer tools",
    location: "Boston/Remote",
    dateFrom: "2022-02-01",
    dateTo: "2023-09-30",
    description:
      "In my role at Departure Labs, I spearheaded the development of several innovative blockchain products on Dfinity's Internet Computer before pivoting to a WebAssembly-enabled cloud platform. My key contributions included architecting the CLI and setting up the release and publishing flow using Rust. Next to this I lead the front-end development team with a combination of JavaScript, TypeScript, Vue, and React. I played a pivotal role in product design, ensuring scalability and robustness, and facilitated the transition of the platform from concept to market-ready product.",
    stack: [
      { name: "Rust", icon: "BrandRust", url: "/?search=Rust#projects" },
      {
        name: "JavaScript",
        icon: "BrandJavascript",
        url: "/?search=JavaScript#projects",
      },
      {
        name: "TypeScript",
        icon: "BrandTypescript",
        url: "/?search=TypeScript#projects",
      },
      { name: "Vue", icon: "BrandVue", url: "/?search=Vue#projects" },
      { name: "React", icon: "BrandReact", url: "/?search=React#projects" },
      { name: "Next.js", icon: "BrandVercel", url: "/?search=Next#projects" },
      {
        name: "Tailwind",
        icon: "BrandTailwind",
        url: "/?search=Tailwind#projects",
      },
      { name: "Vite", icon: "BrandVite", url: "/?search=Vite#projects" },
      { name: "Vitest", icon: "BrandVite", url: "/?search=Vitest#projects" },
      { name: "HTML", icon: "BrandHtml5", url: "/?search=HTML#projects" },
    ],
    icon: "Rocket",
  },
  {
    id: "PROJECT_1",
    company: "ING",
    role: "Senior Front-end Developer",
    teamSize: 200,
    industry: "Finance",
    location: "Amsterdam",
    dateFrom: "2021-06-01",
    dateTo: "2022-01-31",
    description:
      "At ING's Touchpoint department, I was instrumental in developing and maintaining a multi-component, plug-and-play platform, used across various ING branches worldwide. My focus was on enhancing user authentication processes and building utility libraries to streamline user experiences. I employed advanced JavaScript, JSDoc, Lit, CSS, and HTML to deliver high-quality, scalable, and secure front-end solutions. My work contributed to standardizing the user experience across ING's global network. Furthermore I was responsible for the creation of a bootstrapping tool to spin up new projects that adhere to the ING infrastructure.",
    stack: [
      {
        name: "JavaScript",
        icon: "BrandJavascript",
        url: "/?search=JavaScript#projects",
      },
      { name: "Lit", icon: "Components", url: "/?search=Lit#projects" },
      { name: "JSDoc", icon: "FileTypeDoc", url: "/?search=JSDoc#projects" },
      { name: "Mocha", icon: "TestPipe", url: "/?search=Mocha#projects" },
      { name: "CSS", icon: "BrandCss3", url: "/?search=CSS#projects" },
      { name: "HTML", icon: "BrandHtml5", url: "/?search=HTML#projects" },
    ],
    icon: "BuildingBank",
  },
  {
    id: "PROJECT_2",
    company: "M&I",
    role: "Senior Front-end Developer",
    teamSize: 4,
    industry: "Media & Publishing",
    location: "Hilversum",
    dateFrom: "2020-06-01",
    dateTo: "2021-05-31",
    description:
      "At M&I my main task was to maintain and enhance a complex newsroom management application, heavily utilized by major media outlets in the Benelux region. My role involved modernizing the application using React, Redux, and a suite of JavaScript technologies, improving performance, and user interface. I implemented automated testing with Jest and Puppeteer, ensuring high reliability and user satisfaction. Next to that I developed a media editor where video and audio files could be edited and published to the newsroom. In addition to that I was resonsible for the implementation of a new design. I leveraged Tailwind to iterate more quickly and efficiently implement new features such as dark mode.",
    stack: [
      { name: "React", icon: "BrandReact", url: "/?search=React#projects" },
      { name: "Redux", icon: "BrandRedux", url: "/?search=Redux#projects" },
      {
        name: "JavaScript",
        icon: "BrandJavascript",
        url: "/?search=JavaScript#projects",
      },
      {
        name: "Webpack",
        icon: "BrandJavascript",
        url: "/?search=Webpack#projects",
      },
      { name: "Jest", icon: "BrandJavascript", url: "/?search=Jest#projects" },
      {
        name: "Puppeteer",
        icon: "BrandJavascript",
        url: "/?search=Puppeteer#projects",
      },
      {
        name: "Tailwind",
        icon: "BrandTailwind",
        url: "/?search=Tailwind#projects",
      },
      { name: "CSS", icon: "BrandCss3", url: "/?search=CSS#projects" },
      { name: "HTML", icon: "BrandHtml5", url: "/?search=HTML#projects" },
    ],
    icon: "News",
  },
  {
    id: "PROJECT_3",
    company: "Sendcloud",
    role: "Senior Front-end Developer",
    teamSize: 40,
    industry: "Logistics",
    location: "Eindhoven",
    dateFrom: "2019-02-01",
    dateTo: "2020-06-01",
    description:
      "At one of the fastest-growing scale-ups in the Netherlands, I was responsible for replacing legacy parts of the application with reimplementations in Vue. In addition to building out our design system, I redeveloped the subscription page and co-created the returns portal: a high-traffic, consumer-facing web application. If you ever ordered a package online in any European country, chances are you have received an email that links to that work.",
    stack: [
      { name: "Vue", icon: "BrandVue", url: "/?search=Vue#projects" },
      { name: "Preact", icon: "BrandReact", url: "/?search=Preact#projects" },
      {
        name: "Webpack",
        icon: "BrandJavascript",
        url: "/?search=Webpack#projects",
      },
      { name: "Jest", icon: "BrandJavascript", url: "/?search=Jest#projects" },
      {
        name: "JavaScript",
        icon: "BrandJavascript",
        url: "/?search=JavaScript#projects",
      },
      { name: "CSS", icon: "BrandCss3", url: "/?search=CSS#projects" },
      { name: "HTML", icon: "BrandHtml5", url: "/?search=HTML#projects" },
    ],
    icon: "Package",
  },
  {
    id: "PROJECT_4",
    company: "Iperion",
    role: "Front-end Developer",
    teamSize: 5,
    industry: "Life Sciences",
    location: "Vlijmen",
    dateFrom: "2016-06-01",
    dateTo: "2019-01-31",
    description:
      "At Iperion, my role was centered around designing and developing the GxP Cloud, a greenfield application for the life sciences industry. I utilized React, Redux, Redux-saga, and Material UI among other technologies to create a user-friendly, scalable, and compliant application. My work involved deep collaboration with cross-functional teams to understand and implement industry-specific requirements, ensuring that the application met stringent regulatory standards while offering an intuitive user experience.",
    stack: [
      { name: "React", icon: "BrandReact", url: "/?search=React#projects" },
      { name: "Redux", icon: "BrandRedux", url: "/?search=Redux#projects" },
      {
        name: "Redux-saga",
        icon: "BrandRedux",
        url: "/?search=Redux#projects",
      },
      {
        name: "FlowType",
        icon: "BrandJavascript",
        url: "/?search=FlowType#projects",
      },
      { name: "Jest", icon: "BrandJavascript", url: "/?search=Jest#projects" },
      {
        name: "Webpack",
        icon: "BrandJavascript",
        url: "/?search=Webpack#projects",
      },
      {
        name: "Material UI",
        icon: "BrandGoogle",
        url: "/?search=Material#projects",
      },
      {
        name: "JavaScript",
        icon: "BrandJavascript",
        url: "/?search=JavaScript#projects",
      },
      { name: "SCSS", icon: "BrandSass", url: "/?search=SCSS#projects" },
      { name: "HTML", icon: "BrandHtml5", url: "/?search=HTML#projects" },
    ],
    icon: "HealthRecognition",
  },
  {
    id: "PROJECT_5",
    company: "Amadeus",
    role: "Front-end Developer",
    teamSize: 30,
    industry: "Hospitality",
    location: "Breda",
    dateFrom: "2015-03-01",
    dateTo: "2019-01-31",
    description:
      "At Amadeus, I contributed to the development of ELS, a single-page application designed for the hospitality industry. My role primarily involved utilizing Knockout.js, JavaScript, CSS, and HTML to enhance the application's user interface and performance. This work included addressing various technical challenges and ensuring that the application met the needs of its users in the hospitality sector.",
    stack: [
      {
        name: "Knockout.js",
        icon: "BrandJavascript",
        url: "/?search=Knockout#projects",
      },
      {
        name: "JavaScript",
        icon: "BrandJavascript",
        url: "/?search=JavaScript#projects",
      },
      { name: "CSS", icon: "BrandCss3", url: "/?search=CSS#projects" },
      { name: "HTML", icon: "BrandHtml5", url: "/?search=HTML#projects" },
    ],
    icon: "HotelService",
  },
  {
    id: "PROJECT_6",
    company: "Dinto",
    role: "Front-end Developer",
    teamSize: 6,
    industry: "Logistics",
    location: "Breda",
    dateFrom: "2013-10-01",
    dateTo: "2014-10-31",
    description:
      "During my time at Dinto, I was involved in creating interactive blueprints for warehouse layouts using SVG, SQL, and JavaScript. This task required a focus on detail and accuracy to ensure the blueprints were both functional and user-friendly. My role contributed to improving the way warehouses could be organized and managed, offering a visual and practical tool for operational planning.",
    stack: [
      {
        name: "JavaScript",
        icon: "BrandJavascript",
        url: "/?search=JavaScript#projects",
      },
      { name: "CSS", icon: "BrandCss3", url: "/?search=CSS#projects" },
      { name: "HTML", icon: "BrandHtml5", url: "/?search=HTML#projects" },
      { name: "SVG", icon: "Svg", url: "/?search=SVG#projects" },
      { name: "SQL", icon: "Sql", url: "/?search=SQL#projects" },
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
    description:
      "My tenure at Finview was an opportunity to develop my skills in a range of technologies, including Visual Basic.NET, SQL Server, PHP, JavaScript, CSS, and HTML. I worked on building websites and a CRM system for financial advisors, focusing on creating solutions that were both reliable and user-friendly. This experience was valuable in honing my abilities in full-stack development and understanding client needs in the financial sector.",
    stack: [
      {
        name: "Visual Basic.NET",
        icon: "BrandVisualStudio",
        url: "/?search=Visual#projects",
      },
      { name: "SQL Server", icon: "Sql", url: "/?search=SQL#projects" },
      { name: "PHP", icon: "BrandPhp", url: "/?search=PHP#projects" },
      {
        name: "JavaScript",
        icon: "BrandJavascript",
        url: "/?search=JavaScript#projects",
      },
      { name: "CSS", icon: "BrandCss3", url: "/?search=CSS#projects" },
      { name: "HTML", icon: "BrandHtml5", url: "/?search=HTML#projects" },
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
              <dl className="mt-0 grid grid-flow-row grid-cols-[6rem_1fr] gap-1 pt-4 print:mt-8 print:grid-cols-[20rem_1fr] print:items-stretch md:grid-cols-[12rem_1fr]">
                <dt className="mt-0 flex justify-end gap-2 print:m-0 print:justify-end md:m-0">
                  <span className="text-slate-500/50">
                    <Icon.User aria-hidden="true" focusable="false" />
                  </span>
                  <span className="font-normal text-slate-500">Role</span>
                </dt>
                <dd className="m-0 pl-4 md:pl-7">
                  <HighlightedText>{project.role}</HighlightedText>
                </dd>

                <dt className="mt-0 flex justify-end gap-2 print:m-0 print:justify-end md:m-0">
                  <span className=" text-slate-500/50">
                    <Icon.UsersGroup aria-hidden="true" focusable="false" />
                  </span>
                  <span className="font-normal text-slate-500">Team</span>
                </dt>
                <dd className="m-0 pl-4 md:pl-7">
                  ~
                  <span className="mr-2">
                    <HighlightedText>
                      {project.teamSize.toString()}
                    </HighlightedText>
                  </span>
                  developers
                </dd>
                <dt className="mt-0 flex justify-end gap-2 print:m-0 print:justify-end md:m-0">
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
                <dt className="mt-0 flex justify-end gap-2 print:m-0 print:justify-end md:m-0">
                  <span className="text-slate-500/50">
                    <Icon.MapPin aria-hidden="true" focusable="false" />
                  </span>
                  <span className="font-normal text-slate-500">Location</span>
                </dt>
                <dd className="m-0 pl-4 md:pl-7">
                  <HighlightedText>{project.location}</HighlightedText>
                </dd>
                <StackRow items={project.stack} />
              </dl>
              <p className="md:pl-10">
                <HighlightedText>{project.description}</HighlightedText>
              </p>
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

const Projects = () => {
  const [filtered, setFiltered] = React.useState(PROJECTS);
  const searchParams = useSearchParams();
  const query = decodeURI(searchParams.get("search") ?? "").trim();

  React.useEffect(() => {
    const filteredProjects = filterProjects(PROJECTS, query);

    setFiltered(filteredProjects);
  }, [query]);

  return (
    <>
      <h2 id="projects">Projects</h2>
      <div className="flow-root space-y-4">
        <SearchInput />

        {query ? <SearchSummary query={query} items={filtered} /> : null}

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
      <h2 id="conferences">Conferences</h2>
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
