"use client";

import type React from "react";
import { Suspense, useRef } from "react";

import { ProjectsContent } from "~/components/projects-content";
import { useScrollDelegation } from "~/hooks/use-scroll-delegation";

export const Projects = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  useScrollDelegation(containerRef as React.RefObject<HTMLElement>);

  return (
    <div ref={containerRef} className="md:h-full md:overflow-y-auto">
      <Suspense fallback={<div>Loading projects...</div>}>
        <ProjectsContent />
      </Suspense>
    </div>
  );
};
