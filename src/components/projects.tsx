"use client";

import { Suspense } from "react";

import { ProjectsContent } from "~/components/projects-content";

export const Projects = () => {
  return (
    <Suspense fallback={<div>Loading projects...</div>}>
      <ProjectsContent />
    </Suspense>
  );
};
