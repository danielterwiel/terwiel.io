"use client";

import clsx from "clsx";
import React, { useEffect, useRef, useState } from "react";

interface RingProps {
  size?: number;
  borderColor?: string;
  animationDuration?: number; // in seconds
  children: React.ReactNode;
}

export const Ring: React.FC<RingProps> = ({ size = 20, children }) => {
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

  // Dynamically generate Tailwind classes
  const classContainer = `bg-white p-2 -ml-1.5 -mt-2`;
  const classSize = `w-${size} h-${size}`;
  const classBorder = `border-4 border-slate-300 rounded-full`;
  const classAnimation = isVisible
    ? `motion-safe:animation-ring`
    : "opacity-0 print:opacity-100";

  const className = clsx([
    classContainer,
    classSize,
    classBorder,
    classAnimation,
  ]);

  return (
    <div ref={ringRef} className={className}>
      {children}
    </div>
  );
};
