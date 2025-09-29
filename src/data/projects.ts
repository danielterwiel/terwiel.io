import { generateStackUrl } from "~/utils/generate-stack-url";

export type StackItem = {
  name: string;
  icon: string;
  url?: string;
};

export function createStackItem(
  name: string,
  icon: string,
  url?: string
): StackItem {
  return {
    name,
    icon,
    url: url ?? generateStackUrl(name),
  };
}

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

export const PROJECTS: Project[] = [
  {
    id: "PROJECT_10",
    company: "Currentflow",
    role: "Developer",
    teamSize: 1,
    industry: "Auditing",
    location: "Home",
    dateFrom: "2025-07-01",
    dateTo: "present",
    description:
      "When I discovered Effect.TS, I felt like I found my TypeScript equivalent of Rust. I decided to spend my personal time to learn it by building. Reluctant to completely throw away all the code and experience I've gained by building Permatrust, I decided to build a containerized QMS. Using Effect.TS for maintainability, Electric SQL for real-time data sync and Tanstack DB for offline-first data management.",
    stack: [
      createStackItem("Effect", "Stack"),
      createStackItem("JavaScript", "BrandJavascript"),
      createStackItem(
        "Tanstack", // TODO: should be "Tanstack Start" when displayed as an individual project stack item
        "BrandTanstack",
        "/?search=Tanstack#projects"
      ),
      createStackItem(
        "Tanstack Router",
        "BrandTanstack",
        "/?search=Tanstack#projects"
      ),
      createStackItem("TypeScript", "BrandTypescript"),
      createStackItem("React", "BrandReact"),
      createStackItem("Tailwind", "BrandTailwind"),
      createStackItem("XState", "BrandXstate"),
    ],
    icon: "ShieldLock",
  },
  {
    id: "PROJECT_9",
    company: "Permatrust",
    role: "Developer",
    teamSize: 1,
    industry: "Auditing",
    location: "Home",
    dateFrom: "2024-06-01",
    dateTo: "present",
    description:
      "In my personal time, I am developing a ransomware-resilient QMS using Rust and XState on the Internet Computer. This initiative serves to master these technologies and a terminal-centric workflow, with the goal of creating robust, secure applications for vulnerable SMBs in nowadays rapidly evolving threat landscape.",
    stack: [
      createStackItem("Rust", "BrandRust"),
      createStackItem("JavaScript", "BrandJavascript"),
      createStackItem(
        "Tanstack Router",
        "BrandTanstack",
        "/?search=Tanstack#projects"
      ),
      createStackItem(
        "Tanstack Query",
        "BrandTanstack",
        "/?search=Tanstack#projects"
      ),
      createStackItem("TypeScript", "BrandTypescript"),
      createStackItem("React", "BrandReact"),
      createStackItem("Tanstack", "Stack", "/?search=Tanstack#projects"),
      createStackItem("Tailwind", "BrandTailwind"),
      createStackItem("XState", "BrandXstate"),
    ],
    icon: "ShieldLock",
  },
  {
    id: "PROJECT_8",
    company: "90 Percent of Everything",
    role: "Front-end Developer",
    teamSize: 100,
    industry: "Logistics",
    location: "London (Remote)",
    dateFrom: "2024-02-01",
    dateTo: "present",
    description:
      "At 90 Percent of Everything, I've built and maintained multiple micro-frontend CRUD applications using TypeScript.",
    stack: [
      createStackItem("JavaScript", "BrandJavascript"),
      createStackItem("TypeScript", "BrandTypescript"),
      createStackItem("React", "BrandReact"),
      createStackItem("GraphQL", "BrandGraphql"),
    ],
    icon: "Ship",
  },
  {
    id: "PROJECT_7",
    company: "Departure Labs",
    role: "Full-stack Developer & Designer",
    teamSize: 5,
    industry: "Finance & Developer tools",
    location: "Boston (Remote)",
    dateFrom: "2022-02-01",
    dateTo: "2023-09-30",
    description:
      "In my role at Departure Labs, I spearheaded the development of several innovative blockchain products on Dfinity's Internet Computer before pivoting to a WebAssembly-enabled cloud platform. My key contributions included architecting the CLI and setting up the release and publishing flow using Rust. Next to this I lead the front-end development team with a combination of JavaScript, TypeScript, Vue, and React. I played a pivotal role in product design, ensuring scalability and robustness, and facilitated the transition of the platform from concept to market-ready product.",
    stack: [
      createStackItem("Rust", "BrandRust"),
      createStackItem("JavaScript", "BrandJavascript"),
      createStackItem("TypeScript", "BrandTypescript"),
      createStackItem("Vue", "BrandVue"),
      createStackItem("React", "BrandReact"),
      createStackItem("Next.js", "BrandVercel"),
      createStackItem("Tailwind", "BrandTailwind"),
      createStackItem("Vite", "BrandVite"),
      createStackItem("Vitest", "BrandVite"),
      createStackItem("HTML", "BrandHtml5"),
    ],
    icon: "Rocket",
  },
  {
    id: "PROJECT_6",
    company: "ING",
    role: "Senior Front-end Developer",
    teamSize: 200,
    industry: "Finance",
    location: "Amsterdam (Remote)",
    dateFrom: "2021-06-01",
    dateTo: "2022-01-31",
    description:
      "At ING's Touchpoint department, I was instrumental in developing and maintaining a multi-component, plug-and-play platform, used across various ING branches worldwide. My focus was on enhancing user authentication processes and building utility libraries to streamline user experiences. I employed advanced JavaScript, JSDoc, Lit, CSS, and HTML to deliver high-quality, scalable, and secure front-end solutions. My work contributed to standardizing the user experience across ING's global network. Furthermore I was responsible for the creation of a bootstrapping tool to spin up new projects that adhere to the ING infrastructure.",
    stack: [
      createStackItem("JavaScript", "BrandJavascript"),
      createStackItem("Lit", "Components"),
      createStackItem("JSDoc", "FileTypeDoc"),
      createStackItem("Mocha", "TestPipe"),
      createStackItem("CSS", "BrandCss3"),
      createStackItem("HTML", "BrandHtml5"),
    ],
    icon: "BuildingBank",
  },
  {
    id: "PROJECT_5",
    company: "M&I",
    role: "Senior Front-end Developer",
    teamSize: 4,
    industry: "Media & Publishing",
    location: "Hilversum (Hybrid)",
    dateFrom: "2020-06-01",
    dateTo: "2021-05-31",
    description:
      "At M&I my main task was to maintain and enhance a complex newsroom management application, heavily utilized by major media outlets in the Benelux region. My role involved modernizing the application using React, Redux, and a suite of JavaScript technologies, improving performance, and user interface. I implemented automated testing with Jest and Puppeteer, ensuring high reliability and user satisfaction. Next to that I developed a media editor where video and audio files could be edited and published to the newsroom. In addition to that I was resonsible for the implementation of a new design. I leveraged Tailwind to iterate more quickly and efficiently implement new features such as dark mode.",
    stack: [
      createStackItem("React", "BrandReact"),
      createStackItem("Redux", "BrandRedux"),
      createStackItem("JavaScript", "BrandJavascript"),
      createStackItem("Webpack", "BrandJavascript"),
      createStackItem("Jest", "BrandJavascript"),
      createStackItem("Puppeteer", "BrandJavascript"),
      createStackItem("Tailwind", "BrandTailwind"),
      createStackItem("CSS", "BrandCss3"),
      createStackItem("HTML", "BrandHtml5"),
    ],
    icon: "News",
  },
  {
    id: "PROJECT_4",
    company: "Sendcloud",
    role: "Senior Front-end Developer",
    teamSize: 40,
    industry: "Logistics",
    location: "Eindhoven/Remote",
    dateFrom: "2019-02-01",
    dateTo: "2020-06-01",
    description:
      "At one of the fastest-growing scale-ups in the Netherlands, I was responsible for replacing legacy parts of the application with reimplementations in Vue. In addition to building out our design system, I redeveloped the subscription page and co-created the returns portal: a high-traffic, consumer-facing web application. If you ever ordered a package online in any European country, chances are you have received an email that links to that work.",
    stack: [
      createStackItem("Vue", "BrandVue"),
      createStackItem("Preact", "BrandReact"),
      createStackItem("Webpack", "BrandJavascript"),
      createStackItem("Jest", "BrandJavascript"),
      createStackItem("JavaScript", "BrandJavascript"),
      createStackItem("CSS", "BrandCss3"),
      createStackItem("HTML", "BrandHtml5"),
    ],
    icon: "Package",
  },
  {
    id: "PROJECT_3",
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
      createStackItem("React", "BrandReact"),
      createStackItem("Redux", "BrandRedux"),
      createStackItem("Redux-saga", "BrandRedux"),
      createStackItem("FlowType", "BrandJavascript"),
      createStackItem("Jest", "BrandJavascript"),
      createStackItem("Webpack", "BrandJavascript"),
      createStackItem("Material UI", "BrandGoogle"),
      createStackItem("JavaScript", "BrandJavascript"),
      createStackItem("SCSS", "BrandSass"),
      createStackItem("HTML", "BrandHtml5"),
    ],
    icon: "HealthRecognition",
  },
  {
    id: "PROJECT_2",
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
      createStackItem("Knockout.js", "BrandJavascript"),
      createStackItem("JavaScript", "BrandJavascript"),
      createStackItem("CSS", "BrandCss3"),
      createStackItem("HTML", "BrandHtml5"),
    ],
    icon: "HotelService",
  },
  {
    id: "PROJECT_1",
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
      createStackItem("JavaScript", "BrandJavascript"),
      createStackItem("CSS", "BrandCss3"),
      createStackItem("HTML", "BrandHtml5"),
      createStackItem("SVG", "Svg"),
      createStackItem("SQL", "Sql"),
    ],
    icon: "BuildingWarehouse",
  },
  {
    id: "PROJECT_0",
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
      createStackItem("Visual Basic.NET", "BrandVisualStudio"),
      createStackItem("SQL Server", "Sql"),
      createStackItem("PHP", "BrandPhp"),
      createStackItem("JavaScript", "BrandJavascript"),
      createStackItem("CSS", "BrandCss3"),
      createStackItem("HTML", "BrandHtml5"),
    ],
    icon: "HeartHandshake",
  },
];
