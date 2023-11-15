import {
  IconBrandRust,
  IconBrandHtml5,
  IconBrandVue,
  IconBrandReact,
  IconBrandCss3,
  IconBrandJavascript,
  IconBrandTypescript,
  IconMessageCircleCode,
  IconGeometry,
  IconBrandSpeedtest,
  IconAccessible,
  IconStack,
  IconFocus,
  IconBulb,
} from "@tabler/icons-react";

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
            <item.icon className="h-5 w-5" aria-hidden="true" />
            {item.name}
          </div>
        </li>
      ))}
    </ul>
  );
};

const stack: ListItem[] = [
  { name: "HTML", icon: IconBrandHtml5 },
  { name: "CSS", icon: IconBrandCss3 },
  { name: "JavaScript", icon: IconBrandJavascript },
  { name: "TypeScript", icon: IconBrandTypescript },
  { name: "React", icon: IconBrandReact },
  { name: "Vue", icon: IconBrandVue },
  { name: "Rust", icon: IconBrandRust },
];

const Stack = () => {
  return (
    <div>
      <h2 className="flex gap-4">
        <IconStack className="h-7 w-7" aria-hidden="true" />
        Stack
      </h2>
      <IconList items={stack} />
    </div>
  );
};

const focus: ListItem[] = [
  { name: "Communication", icon: IconMessageCircleCode },
  { name: "Architecture", icon: IconGeometry },
  { name: "Performance", icon: IconBrandSpeedtest },
  { name: "Accessibility", icon: IconAccessible },
  { name: "Simplicity", icon: IconBulb },
];

const Focus = () => {
  return (
    <div>
      <h2 className="flex gap-4">
        <IconFocus className="h-7 w-7" aria-hidden="true" />
        Focus
      </h2>
      <IconList items={focus} />
    </div>
  );
};

export default function About() {
  return (
    <aside className="flex flex-col gap-24 px-4 sm:flex-row">
      <Stack />
      <Focus />
    </aside>
  );
}
