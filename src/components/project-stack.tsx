"use client";

import { clsx } from "clsx";

import React from "react";

import { Badge } from "~/components/badge";

export type StackItem = {
  name: string;
  icon: string;
  url?: string;
};

type ProjectStackProps = {
  items: StackItem[];
  className?: string;
  colored?: boolean;
};

export const ProjectStack = ({
  items,
  className,
  colored = true,
}: ProjectStackProps) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  const handleItemClick = (index: number) => {
    // If clicking the same item twice, collapse all
    if (isExpanded && hoveredIndex === index) {
      setIsExpanded(false);
      setHoveredIndex(null);
    } else {
      setIsExpanded(true);
      setHoveredIndex(index);
    }
  };

  const handleItemHover = (index: number | null) => {
    if (!isExpanded) {
      setHoveredIndex(index);
    }
  };

  return (
    <div className={clsx("flex flex-wrap items-center gap-2", className)}>
      {items.map((item, index) => (
        <Badge
          key={`${item.name}-${index}`}
          icon={item.icon}
          name={item.name}
          colored={colored && hoveredIndex === index} // Only apply color on hover if colored is true
          onHoverChange={(isHovered) => {
            if (isHovered) {
              handleItemHover(index);
            } else {
              // Only clear hover if we're hovering this specific item
              if (hoveredIndex === index && !isExpanded) {
                handleItemHover(null);
              }
            }
          }}
          onClick={() => handleItemClick(index)}
        />
      ))}
    </div>
  );
};
