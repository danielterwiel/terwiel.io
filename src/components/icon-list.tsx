"use client";

import Link from "next/link";
import { clsx } from "clsx";

import { Icon } from "~/components/icon";

const iconColors = {
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
  Components: "group-hover:text-[#384EF6]",
};

const linkClasses = {
  Performance: "hover:decoration-[#5A52DE]",
  BrandReact: "hover:decoration-[#61DAFB]",
  BrandVue: "hover:decoration-[#4FC08D]",
};

export type ListItem = {
  name: string;
  icon: string;
  url?: string;
};

const listItemDuration = {
  0: "animate-[animation-slide-down_0.3s_ease-in-out]",
  1: "animate-[animation-slide-down_0.6s_ease-in-out]",
  2: "animate-[animation-slide-down_0.9s_ease-in-out]",
  3: "animate-[animation-slide-down_1.2s_ease-in-out]",
  4: "animate-[animation-slide-down_1.5s_ease-in-out]",
  5: "animate-[animation-slide-down_1.8s_ease-in-out]",
  6: "animate-[animation-slide-down_2.1s_ease-in-out]",
  7: "animate-[animation-slide-down_2.4s_ease-in-out]",
  8: "animate-[animation-slide-down_2.7s_ease-in-out]",
  9: "animate-[animation-slide-down_3.0s_ease-in-out]",
};

export const IconList = ({ items }: { items: ListItem[] }) => {
  return (
    <ul className="ml-0 mt-0 list-none pl-0" role="list">
      {items.map((item, index) => {
        const IconItem = Icon[item.icon as keyof typeof Icon];
        const color = iconColors[item.icon as keyof typeof iconColors];
        const hoverClass = color ? color : "group-hover:text-slate-400";
        const iconClass = clsx([
          "text-slate-400/50",
          "transition-colors",
          "duration-200",
          hoverClass,
        ]);
        const linkUnderline =
          linkClasses[item.icon as keyof typeof linkClasses];
        const linkClass = clsx([
          "text-slate-800/70",
          "hover:text-slate-800",
          linkUnderline,
        ]);

        const listClass =
          listItemDuration[index as keyof typeof listItemDuration];

        return (
          <li key={item.name} className={listClass}>
            <div className="group flex items-center gap-2">
              <IconItem
                className={iconClass}
                aria-hidden="true"
                width={24}
                height={24}
              />
              {item.url ? (
                <Link className={linkClass} href={item.url}>
                  {item.name}
                </Link>
              ) : (
                item.name
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
};
