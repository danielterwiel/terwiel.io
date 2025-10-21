"use client";

import clsx from "clsx";

import type React from "react";
import { useEffect, useRef } from "react";

interface RingProps {
  borderColor?: string;
  children: React.ReactNode;
}

/**
 * Ring component with optimized IntersectionObserver usage
 * Batches visibility updates to prevent cascading reflows
 * Uses requestAnimationFrame to stagger class additions
 */
export const Ring: React.FC<RingProps> = ({ children }) => {
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isStillMounted = true;
    let rafId: number;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!isStillMounted) return;

          // Cancel any pending animation frame
          cancelAnimationFrame(rafId);

          if (entry.isIntersecting) {
            // Batch class changes using requestAnimationFrame to prevent cascading reflows
            // Multiple observers can fire in quick succession - RAF batches them
            rafId = requestAnimationFrame(() => {
              if (isStillMounted && entry.target instanceof HTMLElement) {
                entry.target.classList.add("ring-is-visible");
              }
            });
          } else {
            // Remove animation class when out of view
            if (entry.target instanceof HTMLElement) {
              entry.target.classList.remove("ring-is-visible");
            }
          }
        });
      },
      { threshold: 0.1 },
    );

    const currentRef = ringRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      isStillMounted = false;
      cancelAnimationFrame(rafId);
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  const className = clsx(
    "bg-white",
    "border-4",
    "border-slate-300",
    "rounded-full",
    "h-full",
    "grid",
    "place-items-center",
    "opacity-0",
    "print:opacity-100",
    "ring-element",
  );

  return (
    <div ref={ringRef} className={className}>
      {children}
    </div>
  );
};
