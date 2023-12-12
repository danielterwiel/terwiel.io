"use client";

import React from "react";
import Link from "next/link";
import { clsx } from "clsx";

import { Icon } from "~/components/icon";

export type ListItem = {
  name: string;
  icon: string;
  url?: string;
};

const ICON_GROUP_HOVER = {
  Assembly: "sm:group-hover:text-[#624FE8]",
  BrandCss3: "sm:group-hover:text-[#1572B6]",
  BrandGithub: "sm:group-hover:text-[#181717]",
  BrandGoogle: "sm:group-hover:text-[#4285F4]",
  BrandGraphql: "sm:group-hover:text-[#E10098]",
  BrandHtml5: "sm:group-hover:text-[#E34F26]",
  BrandJavascript: "sm:group-hover:text-[#F7DF1E]",
  BrandLinkedin: "sm:group-hover:text-[#0A66C2]",
  BrandPhp: "sm:group-hover:text-[#777BB4]",
  BrandReact: "sm:group-hover:text-[#61DAFB]",
  BrandRedux: "sm:group-hover:text-[#764ABC]",
  BrandRust: "sm:group-hover:text-[#DE4A00]",
  BrandSass: "sm:group-hover:text-[#CC6699]",
  BrandTailwind: "sm:group-hover:text-[#06B6D4]",
  BrandTypescript: "sm:group-hover:text-[#3178C6]",
  BrandVercel: "sm:group-hover:text-[#000000]",
  BrandVite: "sm:group-hover:text-[#646CFF]",
  BrandVue: "sm:group-hover:text-[#4FC08D]",
  Components: "sm:group-hover:text-[#384EF6]",
  Sql: "sm:group-hover:text-[#F29111]",
  Svg: "sm:group-hover:text-[#FFB13B]",
};

const ICON_COLORS = {
  Assembly: "text-[#624FE8]",
  BrandCss3: "text-[#1572B6]",
  BrandGithub: "text-[#181717]",
  BrandGoogle: "text-[#4285F4]",
  BrandGraphql: "text-[#E10098]",
  BrandHtml5: "text-[#E34F26]",
  BrandJavascript: "text-[#F7DF1E]",
  BrandLinkedin: "text-[#0A66C2]",
  BrandPhp: "text-[#777BB4]",
  BrandReact: "text-[#61DAFB]",
  BrandRedux: "text-[#764ABC]",
  BrandRust: "text-[#DE4A00]",
  BrandSass: "text-[#CC6699]",
  BrandTailwind: "text-[#06B6D4]",
  BrandTypescript: "text-[#3178C6]",
  BrandVercel: "text-[#000000]",
  BrandVite: "text-[#646CFF]",
  BrandVue: "text-[#4FC08D]",
  Components: "text-[#384EF6]",
  Sql: "text-[#F29111]",
  Svg: "text-[#FFB13B]",
};

const LINK_CLASSES = {
  Performance: "hover:decoration-[#5A52DE]",
  BrandReact: "hover:decoration-[#61DAFB]",
  BrandVue: "hover:decoration-[#4FC08D]",
};

const LIST_ITEM_SLIDE_ANIMATION = [
  "motion-safe:animate-[animation-slide-down_0.1s_ease-in-out]",
  "motion-safe:animate-[animation-slide-down_0.2s_ease-in-out]",
  "motion-safe:animate-[animation-slide-down_0.3s_ease-in-out]",
  "motion-safe:animate-[animation-slide-down_0.4s_ease-in-out]",
  "motion-safe:animate-[animation-slide-down_0.5s_ease-in-out]",
  "motion-safe:animate-[animation-slide-down_0.6s_ease-in-out]",
  "motion-safe:animate-[animation-slide-down_0.7s_ease-in-out]",
  "motion-safe:animate-[animation-slide-down_0.8s_ease-in-out]",
  "motion-safe:animate-[animation-slide-down_0.9s_ease-in-out]",
  "motion-safe:animate-[animation-slide-down_1.0s_ease-in-out]",
];

const ListItem = ({ index, item }: { index: number; item: ListItem }) => {
  const [isLoaded, setIsLoaded] = React.useState(false);
  React.useEffect(() => {
    const timer = window.setTimeout(
      () => {
        setIsLoaded(true);
      },
      50 + index * 75,
    );

    return () => {
      window.clearTimeout(timer);
    };
  });

  const IconItem = Icon[item.icon as keyof typeof Icon];
  const hoverColor =
    ICON_GROUP_HOVER[item.icon as keyof typeof ICON_GROUP_HOVER];
  const hoverClass = hoverColor ? hoverColor : "group-hover:text-slate-400";
  const color = ICON_COLORS[item.icon as keyof typeof ICON_COLORS];
  const colorClass = isLoaded ? "text-slate-400/50" : color;
  const iconClass = clsx([
    colorClass,
    hoverClass,
    "transition-colors",
    "duration-200",
    "print:text-slate-400/50",
    "focus:text-slate-400/50",
  ]);

  const linkUnderline = LINK_CLASSES[item.icon as keyof typeof LINK_CLASSES];
  const linkClass = clsx([
    linkUnderline,
    "text-slate-800/70",
    "hover:text-slate-800",
  ]);

  const listClass = clsx(
    LIST_ITEM_SLIDE_ANIMATION[index as keyof typeof LIST_ITEM_SLIDE_ANIMATION],
    "print:mt-1",
    "print:animate-none",
    "pl-0",
  );

  return (
    <li key={item.name} className={listClass}>
      <div className="group flex items-center gap-2">
        <IconItem
          className={iconClass}
          aria-hidden="true"
          width={24}
          height={24}
          focusable="false"
        />
        {item.url ? (
          <Link className={linkClass} href={item.url}>
            {item.name}
          </Link>
        ) : (
          <span dangerouslySetInnerHTML={{ __html: item.name }}></span>
        )}
      </div>
    </li>
  );
};

export const IconList = ({ items }: { items: ListItem[] }) => {
  return (
    <ul className="ml-0 mt-0 list-none pl-0" role="list">
      {items.map((item, index) => (
        <ListItem key={item.name} index={index} item={item} />
      ))}
    </ul>
  );
};

const LanguageListItem = ({
  index,
  item,
}: {
  index: number;
  item: LanguageListItem;
}) => {
  const [isLoaded, setIsLoaded] = React.useState(false);
  React.useEffect(() => {
    const timer = window.setTimeout(
      () => {
        setIsLoaded(true);
      },
      50 + index * 75,
    );

    return () => {
      window.clearTimeout(timer);
    };
  });

  const hoverColor =
    ICON_GROUP_HOVER[item.icon as keyof typeof ICON_GROUP_HOVER];
  const hoverClass = hoverColor
    ? hoverColor
    : "sm:group-hover:text-slate-400 sm:group-hover:saturate-100";
  const colorClass = isLoaded ? "saturate-0 text-slate-400/30" : "saturate-100";
  const iconClass = clsx([
    colorClass,
    hoverClass,
    "select-none",
    "transition-colors",
    "duration-200",
    "print:text-slate-400/50",
    "focus:text-slate-400/50",
  ]);

  const listClass = clsx(
    LIST_ITEM_SLIDE_ANIMATION[index as keyof typeof LIST_ITEM_SLIDE_ANIMATION],
    "print:mt-1",
    "print:animate-none",
    "pl-0",
  );

  return (
    <li key={item.name} className={listClass}>
      <div className="group flex items-center gap-2">
        <span className={iconClass} aria-hidden="true">
          {item.icon}
        </span>
        <span dangerouslySetInnerHTML={{ __html: item.name }}></span>
        <span className="text-sm text-slate-800/70">({item.level})</span>
      </div>
    </li>
  );
};

export type LanguageListItem = ListItem & {
  level: string;
};

export const LanguageIconList = ({ items }: { items: LanguageListItem[] }) => {
  return (
    <ul className="ml-0 mt-0 list-none pl-0" role="list">
      {items.map((item, index) => (
        <LanguageListItem key={item.name} index={index} item={item} />
      ))}
    </ul>
  );
};
