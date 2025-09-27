"use client";

import { clsx } from "clsx";
import Link from "next/link";

import React from "react";

import { Icon } from "~/components/icon";
import {
  ICON_COLORS,
  ICON_GROUP_HOVER,
  LINK_CLASSES,
} from "~/consts/icon-colors";
import { HighlightedIcon, HighlightedText } from "./highlighted";

export type ListItem = {
  name: string;
  icon: string;
  url?: string;
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
  "motion-safe:animate-[animation-slide-down_1.1s_ease-in-out]",
  "motion-safe:animate-[animation-slide-down_1.2s_ease-in-out]",
];

type ListItemProps = {
  index: number;
  item: ListItem;
  highlight?: boolean;
  colored?: boolean;
};

const ItemIcon = ({
  IconComponent,
  iconClass,
  highlight,
  itemName,
}: {
  IconComponent: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  iconClass: string;
  highlight?: boolean;
  itemName: string;
}) =>
  highlight ? (
    <HighlightedIcon meta={itemName}>
      <IconComponent
        className={iconClass}
        aria-hidden="true"
        width={24}
        height={24}
        focusable="false"
      />
    </HighlightedIcon>
  ) : (
    <IconComponent
      className={iconClass}
      aria-hidden="true"
      width={24}
      height={24}
      focusable="false"
    />
  );

const ItemText = ({ children }: { children: React.ReactNode }) => (
  <>{children}</>
);

const ListItem = ({
  index,
  item,
  highlight = false,
  colored = true,
}: ListItemProps) => {
  const [isLoaded, setIsLoaded] = React.useState(false);
  React.useEffect(() => {
    const timer = window.setTimeout(() => setIsLoaded(true), 50 + index * 75);

    return () => {
      window.clearTimeout(timer);
    };
  });

  const IconItem = Icon[item.icon as keyof typeof Icon];
  const hoverColor =
    ICON_GROUP_HOVER[item.icon as keyof typeof ICON_GROUP_HOVER];
  const hoverClass = hoverColor ? hoverColor : "group-hover:text-klein";
  const color = colored
    ? ICON_COLORS[item.icon as keyof typeof ICON_COLORS]
    : "text-slate-400";
  const colorClass = isLoaded ? "text-slate-400/50" : color;
  const iconClass = clsx([
    colorClass,
    hoverClass,
    "select-none",
    "motion-safe:transition-colors",
    "transform-gpu",
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

  let ItemNode: React.ReactNode;

  if (item.url && highlight) {
    ItemNode = (
      <Link className={linkClass} href={item.url}>
        <HighlightedText>{item.name}</HighlightedText>
      </Link>
    );
  }
  if (item.url && !highlight) {
    ItemNode = (
      <Link className={linkClass} href={item.url}>
        {item.name}
      </Link>
    );
  }
  if (!item.url && highlight) {
    ItemNode = <HighlightedText>{item.name}</HighlightedText>;
  }
  if (!item.url && !highlight) {
    ItemNode = item.name;
  }

  return (
    <li className={listClass}>
      <div className="group flex items-center gap-2">
        <ItemIcon
          IconComponent={IconItem}
          iconClass={iconClass}
          highlight={highlight}
          itemName={item.name}
        />
        <ItemText>{ItemNode}</ItemText>
      </div>
    </li>
  );
};

type IconListProps = {
  items: ListItem[];
  highlight?: boolean;
  colored?: boolean;
};

export const IconList = ({
  items,
  highlight = false,
  colored = true,
}: IconListProps) => {
  return (
    <ul className="ml-0 mt-0 list-none pl-0">
      {items.map((item, index) => (
        <ListItem
          key={`${item.name}-${index}`}
          index={index}
          item={item}
          highlight={highlight}
          colored={colored}
        />
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
    const timer = window.setTimeout(() => setIsLoaded(true), 50 + index * 75);

    return () => {
      window.clearTimeout(timer);
    };
  });

  const hoverColor =
    ICON_GROUP_HOVER[item.icon as keyof typeof ICON_GROUP_HOVER];
  const hoverClass = hoverColor
    ? hoverColor
    : "sm:group-hover:text-klein sm:group-hover:saturate-100";
  const colorClass = isLoaded ? "saturate-0 text-slate-400/30" : "saturate-100";
  const iconClass = clsx([
    colorClass,
    hoverClass,
    "select-none",
    "motion-safe:transition-colors",
    "transform-gpu",
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
    <li className={listClass}>
      <div className="group flex items-center gap-2">
        <span className={iconClass} aria-hidden="true">
          {item.icon}
        </span>
        {item.name}
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
    <ul className="ml-0 mt-0 list-none pl-0">
      {items.map((item, index) => (
        <LanguageListItem key={item.name} index={index} item={item} />
      ))}
    </ul>
  );
};
