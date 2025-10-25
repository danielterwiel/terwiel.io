import { useEffect, useRef, useState } from "react";

/**
 * Hook to track which project IDs are currently visible in the viewport
 * Uses Intersection Observer to monitor visibility of project elements
 *
 * Important: This hook maintains visibility state across DOM updates to ensure
 * the transition timing can rely on a stable anchor item even during DOM mutations.
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

  // Keep reference to visibility map to maintain state across renders
  const visibilityMapRef = useRef<Map<string, boolean>>(new Map());
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Reuse visibility map across DOM updates to maintain anchor stability
    const visibilityMap = visibilityMapRef.current;

    const updateVisibleProjects = () => {
      const visible = new Set<string>();
      for (const [id, isVisible] of visibilityMap.entries()) {
        if (isVisible) {
          visible.add(id);
        }
      }
      setVisibleProjects(visible);
    };

    // Disconnect previous observer if it exists
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Create intersection observer with threshold 0 to detect ANY visibility
    const observer = new IntersectionObserver(
      (entries) => {
        let changed = false;
        for (const entry of entries) {
          const element = entry.target as HTMLElement;
          const projectId = element.getAttribute("data-project-id");

          if (projectId) {
            const prevValue = visibilityMap.get(projectId);
            visibilityMap.set(projectId, entry.isIntersecting);
            if (prevValue !== entry.isIntersecting) {
              changed = true;
            }
          }
        }
        // Only update state if visibility actually changed
        if (changed) {
          updateVisibleProjects();
        }
      },
      {
        root: container,
        threshold: 0,
      },
    );

    observerRef.current = observer;

    // Observe all project elements
    const projectElements = container.querySelectorAll(selector);
    for (const element of projectElements) {
      observer.observe(element);
    }

    // Cleanup: disconnect observer on unmount
    return () => {
      observer.disconnect();
      observerRef.current = null;
    };
  }, [containerRef, selector]);

  return visibleProjects;
}
