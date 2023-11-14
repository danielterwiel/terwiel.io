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
            <item.icon className="h-5 w-5 opacity-30" aria-hidden="true" />
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
    <>
      <h2>Stack</h2>
      <IconList items={stack} />
    </>
  );
};

const focus: ListItem[] = [
  { name: "Communication", icon: IconMessageCircleCode },
  { name: "Architecture", icon: IconGeometry },
  { name: "Performance", icon: IconBrandSpeedtest },
  { name: "Accessibility", icon: IconAccessible },
];

const Focus = () => {
  return (
    <>
      <h2>Focus</h2>
      <IconList items={focus} />
    </>
  );
};

export default function About() {
  return (
    <aside>
      <Stack />
      <Focus />
    </aside>
  );
}
