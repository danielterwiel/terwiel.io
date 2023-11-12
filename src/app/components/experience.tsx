type Project = {
  company: string;
  role: string;
  location: string;
  duration: string;
  description: string;
  stack: string[];
};

const projects: Project[] = [
  {
    company: "Departure Labs",
    role: "All-round Developer/Designer",
    location: "Boston/Remote",
    duration: "2021 - present",
    description:
      "Departure Labs started off as a side-project. When the technical founder whom I met over Twitter told me she raised money to work on it full-time I joined her. After 5 failed blockchain products, we pivoted to creating a WebAssembly enabled Cloud platform. Created OSS: libraries, webapps, Rust tooling packages.",
    stack: [
      "Rust",
      "WebAssembly",
      "JavaScript",
      "TypeScript",
      "Vue",
      "React",
      "Next.js",
      "Tailwind",
      "Vite",
      "Vitest",
    ],
  },
  {
    company: "ING",
    role: "Senior Front End Developer",
    location: "Amsterdam",
    duration: "2021 - 2021",
    description:
      "Touchpoint at ING is a department that develops a multiple component, plug-able platform, allowing all ING branches to integrate a unified User Experience. Worked on: authentication & utility libraries.",
    stack: ["JavaScript", "JSDoc", "Web Components", "Lit"],
  },
  {
    company: "M&I",
    role: "Senior Front End Developer",
    location: "Hilversum",
    duration: "2020 - 2021",
    description:
      "Here I maintained and updated a 4-year old Newsroom management application used by large media outlets in The Benelux. Notable achievements: created a video & audio editor, implemented a mobile-first redesign.",
    stack: [
      "React",
      "Redux",
      "TypeScript",
      "Webpack",
      "Babel",
      "Jest",
      "Puppeteer",
      "Tailwind",
    ],
  },
  {
    company: "Sendcloud",
    role: "Senior Front End Developer",
    location: "Eindhoven",
    duration: "2019 - 2020",
    description:
      "One of the fastest growing startups in The Netherlands. I was responsible for replacing legacy parts of the application with reïmplementations in Vue. Next to building out our design system I’ve done a reïmplementation of the subscription page and co-created the returns portal: a high-traffic consumer-facing web application.",
    stack: [
      "Vue",
      "Preact",
      "JavaScript",
      "SCSS",
      "HTML",
      "GraphQL",
      "Webpack",
      "Jest",
      "CI",
    ],
  },
  {
    company: "IPERION",
    role: "Front End Developer",
    location: "Vlijmen",
    duration: "2016 - 2019",
    description:
      "At IPERION I worked on GxP Cloud. I got the chance to design and develop a greenfield application.",
    stack: [
      "React",
      "Redux",
      "Redux-saga",
      "FlowType",
      "Jest",
      "Webpack",
      "Material UI",
    ],
  },
  {
    company: "Amadeus",
    role: "Front End Developer",
    location: "Breda",
    duration: "2015 - 2016",
    description:
      "At Amadeus I worked on ELS, which is an enterprise SPA built with Knockout.js for the Hospitality industry.",
    stack: ["Knockout.js", "JavaScript", "HTML", "CSS"],
  },
  {
    company: "Dinto",
    role: "Front End Developer",
    location: "Breda",
    duration: "2013 - 2014",
    description:
      "Working at Dinto, I had the job to create interactive blueprints of warehouses using SVG, SQL and JavaScript.",
    stack: ["JavaScript", "CSS", "HTML", "SVG", "SQL"],
  },
  {
    company: "Finview Gouden Handdruk Adviseurs",
    role: "Developer",
    location: "Breda",
    duration: "2007 – 2013",
    description: "Created websites and a CRM. Here I made my very first steps.",
    stack: [
      "Visual Basic.NET",
      "SQL Server",
      "JavaScript",
      "CSS",
      "HTML",
      "PHP",
    ],
  },
];

const Project = ({ project }: { project: Project }) => {
  return (
    <div className="flex items-center">
      <div className="timeline-marker"></div>
      <div className="timeline-content p-4 shadow-md">
        <h3 className="text-lg font-semibold">{project.company}</h3>
        <p>
          <span className="pr-1 text-slate-400">Role:</span>
          <span>{project.role}</span>
        </p>
        <p>
          <span className="pr-1 text-slate-400">Location:</span>
          <span>{project.location}</span>
        </p>
        <p>
          <span className="pr-1 text-slate-400">Duration:</span>
          {project.duration}
        </p>
        <p>{project.description}</p>
        <ul>
          {project.stack.map((tech) => (
            <li key={tech}>{tech}</li>
          ))}
        </ul>
        {/* Other item content */}
      </div>
    </div>
  );
};

const Projects = () => {
  return (
    <>
      <h2>Projects</h2>
      <ul className="list-none">
        {projects.map((project) => (
          <li key={project.company}>
            <Project project={project} />
          </li>
        ))}
      </ul>
    </>
  );
};

const Conferences = () => {
  return (
    <>
      <h2>Conferences</h2>
      <ul>
        <li>Performance.now()</li>
        <li>React Amsterdam</li>
        <li>Vue Amsterdam</li>
      </ul>
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
