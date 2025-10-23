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

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!isStillMounted) return;

          // Directly toggle class without RAF - browser will batch paint operations
          // RAF can actually delay updates and cause more jank during fast scrolling
          if (entry.isIntersecting) {
            if (iconRef.current instanceof HTMLElement) {
              iconRef.current.classList.add("ring-icon-visible");
            }
          } else {
            if (iconRef.current instanceof HTMLElement) {
              iconRef.current.classList.remove("ring-icon-visible");
            }
          }
        });
      },
      {
        threshold: 0.1,
        // Add root margin to trigger animations slightly before entering viewport
        // This ensures icons are visible when the ring enters the viewport
        rootMargin: "50px 0px",
      },
    );

    const currentRef = ringRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      isStillMounted = false;
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
