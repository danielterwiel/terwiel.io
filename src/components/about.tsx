import Image from "next/image";

type ListItem = {
  name: string;
  icon: string;
};

const IconList = ({ items }: { items: ListItem[] }) => {
  return (
    <ul className="-ml-5 list-none">
      {items.map((item) => (
        <li key={item.name}>
          <div className="flex items-center gap-2">
            <Image
              src={`/images/icons/${item.icon}.svg`}
              aria-hidden="true"
              className="my-1"
              alt=""
              width={24}
              height={24}
            />
            {item.name}
          </div>
        </li>
      ))}
    </ul>
  );
};

const stack: ListItem[] = [
  { name: "HTML", icon: "brand-html5" },
  { name: "CSS", icon: "brand-css3" },
  { name: "JavaScript", icon: "brand-javascript" },
  { name: "TypeScript", icon: "brand-typescript" },
  { name: "React", icon: "brand-react" },
  { name: "Vue", icon: "brand-vue" },
  { name: "Lit", icon: "components" },
  { name: "Rust", icon: "brand-rust" },
];

const Stack = () => {
  return (
    <div>
      <h2 className="flex gap-4">
        <Image
          src="/images/icons/stack.svg"
          aria-hidden="true"
          className="my-0 h-7 w-7"
          alt=""
          width={24}
          height={24}
        />
        Stack
      </h2>
      <IconList items={stack} />
    </div>
  );
};

const focus: ListItem[] = [
  { name: "Communication", icon: "message-circle-code" },
  { name: "Architecture", icon: "geometry" },
  { name: "Performance", icon: "brand-speedtest" },
  { name: "Accessibility", icon: "accessible" },
  { name: "Simplicity", icon: "bulb" },
];

const Focus = () => {
  return (
    <div>
      <h2 className="flex gap-4">
        {/* <IconFocus className="h-7 w-7" aria-hidden="true" /> */}
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
