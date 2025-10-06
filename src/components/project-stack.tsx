"use client";

import { clsx } from "clsx";

import type { StackItem } from "~/types";

import { Badge } from "~/components/badge";

type ProjectStackProps = {
  items: StackItem[];
  className?: string;
};

export const ProjectStack = ({ items, className }: ProjectStackProps) => {
  return (
    <div className={clsx("flex flex-wrap items-center gap-2", className)}>
      {items.map((item, index) => (
        <Badge
          key={`${item.name}-${index}`}
          icon={item.icon}
          name={item.name}
        />
      ))}
    </div>
  );
};
