"use client";

import clsx from "clsx";
import React, { useEffect, useRef, useState } from "react";

interface RingProps {
  size?: number;
  borderColor?: string;
  animationDuration?: number; // in seconds
  children: React.ReactNode;
}

export const Ring: React.FC<RingProps> = ({
  size = 20,
  animationDuration = 8,
  children,
}) => {
  const ringRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        console.log("entries", entries);
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting);
        });
      },
      {
        threshold: 0.5,
      },
    );

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
  const classContainer = `grid place-items-center bg-white`;
  const classSize = `w-${size} h-${size}`;
  const classBorder = `border-4 border-slate-300 rounded-full`;
  const classAnimation = isVisible ? `ring-animation` : "";

  const className = clsx(
    classContainer,
    classSize,
    classBorder,
    classAnimation,
  );

  return (
    <div ref={ringRef} className={className}>
      {children}
    </div>
  );
};
