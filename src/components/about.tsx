import { Icon } from "~/components/icon";
import {
  IconList,
  LanguageIconList,
  type LanguageListItem,
  type ListItem,
} from "~/components/icon-list";

const stack: ListItem[] = [
  { name: "HTML", icon: "BrandHtml5", url: "/?search=HTML#projects" },
  { name: "CSS", icon: "BrandCss3", url: "/?search=CSS#projects" },
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
  { name: "React", icon: "BrandReact", url: "/?search=React#projects" },
  { name: "Vue", icon: "BrandVue", url: "/?search=Vue#projects" },
  { name: "Lit", icon: "Components", url: "/?search=Lit#projects" },
  { name: "Rust", icon: "BrandRust", url: "/?search=Rust#projects" },
];

const Stack = () => {
  return (
    <div>
      <h2 id="stack" className="flex items-center gap-4">
        <Icon.Stack aria-hidden="true" focusable="false" />
        <span>Stack</span>
      </h2>
      <div className="pl-2">
        <IconList items={stack} />
      </div>
    </div>
  );
};

const focus: ListItem[] = [
  { name: "Communication", icon: "MessageCircleCode" },
  { name: "Architecture", icon: "Geometry" },
  { name: "Performance", icon: "BrandSpeedtest" },
  { name: "Accessibility", icon: "Accessible" },
  { name: "Simplicity", icon: "Bulb" },
];

const Focus = () => {
  return (
    <div>
      <h2 id="focus" className="flex items-center gap-4">
        <Icon.Focus aria-hidden="true" focusable="false" />
        <span>Focus</span>
      </h2>
      <div className="pl-2">
        <IconList items={focus} colored={false} />
      </div>
    </div>
  );
};

const languages: LanguageListItem[] = [
  { name: "Dutch", icon: "🇳🇱", level: "native" },
  { name: "English", icon: "🇺🇸", level: "fluent" },
  { name: "French", icon: "🇫🇷", level: "mediocre" },
  { name: "German", icon: "🇩🇪", level: "mediocre" },
];

const Languages = () => {
  return (
    <div>
      <h2 id="languages" className="flex items-center gap-4">
        <Icon.Language aria-hidden="true" focusable="false" />
        <span>Languages</span>
      </h2>
      <div className="pl-2">
        <LanguageIconList items={languages} />
      </div>
    </div>
  );
};

export default function About() {
  return (
    <aside className="grid px-4 sm:grid-flow-col">
      <Stack />
      <Focus />
      <Languages />
    </aside>
  );
}
