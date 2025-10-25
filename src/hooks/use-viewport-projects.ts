import { useEffect, useState } from "react";

/**
 * Hook to track which project IDs are currently visible in the viewport
 * Uses Intersection Observer to monitor visibility of project elements
 *
 * @param containerRef - Reference to the scrollable container element
 * @param selector - CSS selector for project elements (e.g., 'li[data-project-id]')
 * @returns Set of project IDs currently visible in the viewport
 */
export function useViewportProjects(
  containerRef: React.RefObject<HTMLElement>,
  selector: string,
): Set<string> {
  const [visibleProjects, setVisibleProjects] = useState<Set<string>>(
    new Set(),
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Track visibility state for each project
    const visibilityMap = new Map<string, boolean>();

    const updateVisibleProjects = () => {
      const visible = new Set<string>();
      for (const [id, isVisible] of visibilityMap.entries()) {
        if (isVisible) {
          visible.add(id);
        }
      }
      setVisibleProjects(visible);
    };

    // Create intersection observer with threshold 0 to detect ANY visibility
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const element = entry.target as HTMLElement;
          const projectId = element.getAttribute("data-project-id");

          if (projectId) {
            visibilityMap.set(projectId, entry.isIntersecting);
          }
        }
        updateVisibleProjects();
      },
      {
        root: container,
        threshold: 0,
      },
    );

    // Observe all project elements
    const projectElements = container.querySelectorAll(selector);
    for (const element of projectElements) {
      observer.observe(element);
    }

    // Cleanup: disconnect observer on unmount
    return () => {
      observer.disconnect();
    };
  }, [containerRef, selector]);

  return visibleProjects;
}
