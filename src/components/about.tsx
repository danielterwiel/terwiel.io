import { useId } from "react";

import { Icon } from "~/components/icon";
import {
  IconList,
  LanguageIconList,
  type LanguageListItem,
  type ListItem,
} from "~/components/icon-list";
import { createStackItem } from "~/data/projects";

const stack: ListItem[] = [
  createStackItem("HTML", "BrandHtml5"),
  createStackItem("CSS", "BrandCss3"),
  createStackItem("JavaScript", "BrandJavascript"),
  createStackItem("TypeScript", "BrandTypescript"),
  createStackItem("React", "BrandReact"),
  createStackItem("Vue", "BrandVue"),
  createStackItem("Lit", "Components"),
  createStackItem("Rust", "BrandRust"),
];

const Stack = () => {
  const stackId = useId();
  return (
    <div>
      <h2 id={stackId} className="flex items-center gap-4">
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
  const focusId = useId();
  return (
    <div>
      <h2 id={focusId} className="flex items-center gap-4">
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
  { name: "Italian", icon: "🇮🇹", level: "mediocre" },
  { name: "French", icon: "🇫🇷", level: "mediocre" },
  { name: "German", icon: "🇩🇪", level: "mediocre" },
];

const Languages = () => {
  const languagesId = useId();
  return (
    <div>
      <h2 id={languagesId} className="flex items-center gap-4">
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
