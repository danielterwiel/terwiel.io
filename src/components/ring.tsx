"use client";

import clsx from "clsx";

import type React from "react";
import { useEffect, useRef } from "react";

interface RingProps {
  borderColor?: string;
  children?: React.ReactNode;
}

/**
 * Ring component with optimized IntersectionObserver usage
 * Shows circle always, animates children (icon) in on scroll with spring effect
 */
export const Ring: React.FC<RingProps> = ({ children }) => {
  const ringRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);

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
              if (isStillMounted && iconRef.current instanceof HTMLElement) {
                iconRef.current.classList.add("ring-icon-visible");
              }
            });
          } else {
            // Remove animation class when out of view
            if (iconRef.current instanceof HTMLElement) {
              iconRef.current.classList.remove("ring-icon-visible");
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
    "print:opacity-100",
    "ring-element",
  );

  return (
    <div ref={ringRef} className={className}>
      <div ref={iconRef} className="ring-icon">
        {children}
      </div>
    </div>
  );
};
