import { Icon } from "~/components/icon";
import { IconList } from "~/components/icon-list";

type ListItem = {
  name: string;
  icon: string;
};

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
      <h2 className="flex gap-4">
        <Icon.Stack aria-hidden="true" className="my-0 h-7 w-7" />
        Stack
      </h2>
      <IconList items={stack} />
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
      <h2 className="flex gap-4">
        <Icon.Focus aria-hidden="true" className="my-0 h-7 w-7" />
        Focus
      </h2>
      <IconList items={focus} />
    </div>
  );
};

export default function About() {
  return (
    <aside className="flex flex-col px-4 sm:flex-row sm:gap-24">
      <Stack />
      <Focus />
    </aside>
  );
}
