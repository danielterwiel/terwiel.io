"use client";

import { clsx } from "clsx";

import { useEffect, useRef, useState } from "react";

import type { StackItem } from "~/types";

import { Badge } from "~/components/badge";

type ProjectStackProps = {
  items: StackItem[];
  className?: string;
};

export const ProjectStack = ({ items, className }: ProjectStackProps) => {
  const stackRef = useRef<HTMLDivElement>(null);
  const [animatingIndices, setAnimatingIndices] = useState<Set<number>>(
    new Set(),
  );
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            // Trigger wave animation - each badge lights up briefly then fades back
            items.forEach((_, index) => {
              // Light up after delay
              setTimeout(() => {
                setAnimatingIndices((prev) => new Set(prev).add(index));
              }, index * 80); // 80ms delay between each badge lighting up

              // Fade back to neutral after brief display
              setTimeout(
                () => {
                  setAnimatingIndices((prev) => {
                    const next = new Set(prev);
                    next.delete(index);
                    return next;
                  });
                },
                index * 80 + 400,
              ); // Show color for 400ms before fading
            });
            setHasAnimated(true);
          }
        });
      },
      { threshold: 0.1 },
    );

    const currentRef = stackRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [items, hasAnimated]);

  return (
    <div
      ref={stackRef}
      className={clsx("flex flex-wrap items-center gap-2", className)}
    >
      {items.map((item, index) => (
        <Badge
          key={`${item.name}-${index}`}
          icon={item.icon}
          name={item.name}
          isAnimating={animatingIndices.has(index)}
        />
      ))}
    </div>
  );
};
