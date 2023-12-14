import { Icon } from "~/components/icon";
import {
  IconList,
  LanguageIconList,
  type ListItem,
  type LanguageListItem,
} from "~/components/icon-list";

const stack: ListItem[] = [
  { name: "HTML", icon: "BrandHtml5" },
  { name: "CSS", icon: "BrandCss3" },
  { name: "JavaScript", icon: "BrandJavascript" },
  { name: "TypeScript", icon: "BrandTypescript" },
  { name: "React", icon: "BrandReact" },
  { name: "Vue", icon: "BrandVue" },
  { name: "Lit", icon: "Components" },
  { name: "Rust", icon: "BrandRust" },
];

const Stack = () => {
  return (
    <div>
      <h2 id="stack" className="flex items-center gap-4">
        <Icon.Stack aria-hidden="true" className="h-6 w-6" />
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
        <Icon.Focus aria-hidden="true" className="h-6 w-6" />
        <span>Focus</span>
      </h2>
      <div className="pl-2">
        <IconList items={focus} />
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
        <Icon.Language aria-hidden="true" className="h-6 w-6" />
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
