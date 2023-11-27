"use client";

import Link from "next/link";
import { clsx } from "clsx";

import { Icon } from "~/components/icon";

const brandColors = {
  Assembly: "group-hover:text-[#624FE8]",
  BrandCss3: "group-hover:text-[#1572B6]",
  BrandGithub: "group-hover:text-[#181717]",
  BrandGoogle: "group-hover:text-[#4285F4]",
  BrandGraphql: "group-hover:text-[#E10098]",
  BrandHtml5: "group-hover:text-[#E34F26]",
  BrandJavascript: "group-hover:text-[#F7DF1E]",
  BrandLinkedin: "group-hover:text-[#0A66C2]",
  BrandPhp: "group-hover:text-[#777BB4]",
  BrandReact: "group-hover:text-[#61DAFB]",
  BrandRedux: "group-hover:text-[#764ABC]",
  BrandRust: "group-hover:text-[#DE4A00]",
  BrandSass: "group-hover:text-[#CC6699]",
  BrandTailwind: "group-hover:text-[#06B6D4]",
  BrandTypescript: "group-hover:text-[#3178C6]",
  BrandVercel: "group-hover:text-[#000000]",
  BrandVite: "group-hover:text-[#646CFF]",
  BrandVue: "group-hover:text-[#4FC08D]",
  Components: "group-hover:text-[#384EF6]", // used for Lit HTML logo
};

export type ListItem = {
  name: string;
  icon: string;
  url?: string;
};

export const IconList = ({ items }: { items: ListItem[] }) => {
  const icons = items.filter(
    (obj, index, self) => index === self.findIndex((t) => t.icon === obj.icon),
  );

  return (
    <ul className="-ml-5 list-none" role="list">
      {icons.map((item) => {
        const IconItem = Icon[item.icon as keyof typeof Icon];
        const color = brandColors[item.icon as keyof typeof brandColors];
        const colorClass = color ? color : "group-hover:text-slate-400";
        const iconClass = clsx([
          colorClass,
          "text-slate-400/50",
          "transition-colors",
          "duration-200",
        ]);
        return (
          <li key={item.name}>
            <div className="group flex items-center gap-2">
              <IconItem
                className={iconClass}
                aria-hidden="true"
                width={24}
                height={24}
              />
              {item.url ? <Link href={item.url}>{item.name}</Link> : item.name}
            </div>
          </li>
        );
      })}
    </ul>
  );
};
