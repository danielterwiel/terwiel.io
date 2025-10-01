"use client";

import clsx from "clsx";

import type React from "react";
import { useEffect, useRef, useState } from "react";

interface RingProps {
  borderColor?: string;
  children: React.ReactNode;
}

export const Ring: React.FC<RingProps> = ({ children }) => {
  const ringRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        setIsVisible(entry.isIntersecting);
      });
    });

    const currentRef = ringRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  const className = clsx(
    [
      "bg-white",
      "border-4",
      "border-slate-300",
      "rounded-full",
      "h-full",
      "grid",
      "place-items-center",
    ],
    {
      "motion-safe:animation-ring": isVisible,
      "opacity-0": !isVisible,
      "print:opacity-100": !isVisible,
    },
  );

  return (
    <div ref={ringRef} className={className}>
      {children}
    </div>
  );
};
