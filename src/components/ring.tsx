"use client";

import clsx from "clsx";
import React, { useEffect, useRef, useState } from "react";

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

    if (ringRef.current) {
      observer.observe(ringRef.current);
    }

    return () => {
      if (ringRef.current) {
        observer.unobserve(ringRef.current);
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
