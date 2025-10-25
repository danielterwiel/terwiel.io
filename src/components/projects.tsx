"use client";

import { useSearchParams } from "next/navigation";

import type React from "react";
import {
  Suspense,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type { Domain, Project as ProjectType } from "~/types";

type TransitionStep = {
  item: string;
  project: ProjectType;
  action: "stay" | "slide-out" | "slide-in" | "fade";
  oldIndex?: number;
  newIndex?: number;
  direction?: "top" | "bottom";
};

import { Project } from "~/components/project";
import { ProjectsEmptyState } from "~/components/projects-empty-state";
import { PROJECTS } from "~/data/projects";
import { useScrollDelegation } from "~/hooks/use-scroll-delegation";
import { filterCache } from "~/utils/filter-cache";
import { filterProjects } from "~/utils/filter-projects";
import { planTransition } from "~/utils/lcs-transition";
import { getSearchDomain, getSearchQuery } from "~/utils/search-params";
import { buildSelectionIndex } from "~/utils/stack-cloud/selection-index";

const ProjectsContent = () => {
  const searchParams = useSearchParams();
  const query = getSearchQuery(searchParams);

  // Extract domain filter from query (if query matches a domain name exactly)
  const domain = getSearchDomain(query, PROJECTS) as Domain | null;

  // Build selection index once for fast filtering
  const selectionIndex = useMemo(() => {
    return buildSelectionIndex(PROJECTS);
  }, []);

  // Track previous filtered results for LCS diffing
  const prevFilteredRef = useRef<ProjectType[]>([]);

  // Memoize filtered projects computation with cache
  const filtered = useMemo(() => {
    const cached = filterCache.get(query, domain ?? undefined);
    if (cached) {
      return cached;
    }

    const result = filterProjects(
      PROJECTS,
      query,
      domain ?? undefined,
      selectionIndex,
    );
    filterCache.set(query, domain ?? undefined, result);
    return result;
  }, [query, domain, selectionIndex]);

  const projectsId = useId();
  const listRef = useRef<HTMLOListElement>(null);
  const [displayedProjects, setDisplayedProjects] = useState<ProjectType[]>([]);
  const isTransitioningRef = useRef(false);
  const positionsBeforeRef = useRef<
    Map<string, { rect: DOMRect; isStaying: boolean }>
  >(new Map());

  // Initial load
  useEffect(() => {
    if (prevFilteredRef.current.length === 0 && filtered.length > 0) {
      setDisplayedProjects(filtered);
      prevFilteredRef.current = filtered;

      // Trigger slide-in animation after render
      setTimeout(() => {
        const items = listRef.current?.querySelectorAll("li");
        items?.forEach((item) => {
          (item as HTMLElement).classList.add("project-visible");
        });
      }, 100);
    }
  }, [filtered]);

  // Store transition plan for use in useLayoutEffect
  const transitionPlanRef = useRef<{
    oldPlan: TransitionStep[];
    newPlan: TransitionStep[];
    stayingItems: Set<string>;
    removedFromTop: TransitionStep[];
    removedFromBottom: TransitionStep[];
    exitDuration: number;
  } | null>(null);

  // PHASE 1 & 2: Prepare and animate out removed items
  useEffect(() => {
    // Skip initial render
    if (prevFilteredRef.current.length === 0) return;

    // Skip if no actual change
    if (
      prevFilteredRef.current.length === filtered.length &&
      prevFilteredRef.current.every((p, i) => p.id === filtered[i]?.id)
    ) {
      return;
    }

    // Skip if already transitioning
    if (isTransitioningRef.current) return;

    void prepareTransition();

    async function prepareTransition() {
      isTransitioningRef.current = true;

      const { oldPlan, newPlan, stayingItems } = planTransition(
        prevFilteredRef.current,
        filtered,
      );

      // PHASE 1: Record positions BEFORE any changes
      const currentElements = Array.from(
        listRef.current?.querySelectorAll("li") ?? [],
      ) as HTMLElement[];

      positionsBeforeRef.current.clear();
      oldPlan.forEach((plan, index) => {
        const element = currentElements[index];
        if (element) {
          positionsBeforeRef.current.set(plan.item, {
            rect: element.getBoundingClientRect(),
            isStaying: plan.action === "stay",
          });
        }
      });

      // PHASE 2: Animate OUT only items being REMOVED
      const removedFromTop = oldPlan.filter(
        (p) => p.action === "slide-out" && p.direction === "top",
      );
      const removedFromBottom = oldPlan.filter(
        (p) => p.action === "slide-out" && p.direction === "bottom",
      );

      oldPlan.forEach((plan, index) => {
        const element = currentElements[index];
        if (!element) return;

        if (plan.action === "slide-out") {
          const directionalGroup =
            plan.direction === "top" ? removedFromTop : removedFromBottom;
          const groupIndex = directionalGroup.findIndex(
            (p) => p.item === plan.item,
          );

          element.style.setProperty("--item-index", String(groupIndex));
          element.style.setProperty(
            "--total-items",
            String(directionalGroup.length),
          );
          element.style.transitionDelay = `${index * 0.05}s`;

          element.classList.add(
            plan.direction === "top"
              ? "project-from-top"
              : "project-from-bottom",
          );
          element.classList.remove("project-visible");
          element.classList.add("project-slide-out");
        } else if (plan.action === "fade") {
          element.classList.add("project-fade-out");
        }
      });

      const exitDuration =
        removedFromTop.length > 0 || removedFromBottom.length > 0
          ? 600 +
            Math.max(removedFromTop.length, removedFromBottom.length) * 100
          : 0;

      // Store transition plan for Phase 4 (FLIP animation)
      transitionPlanRef.current = {
        oldPlan,
        newPlan,
        stayingItems,
        removedFromTop,
        removedFromBottom,
        exitDuration,
      };

      if (exitDuration > 0) {
        await new Promise((resolve) => setTimeout(resolve, exitDuration));
      }

      // PHASE 3: Update to new filtered list
      // This triggers a React render, and useLayoutEffect will fire to do FLIP before paint
      setDisplayedProjects(filtered);
    }
  }, [filtered]);

  // PHASE 4: FLIP animation using useLayoutEffect (runs BEFORE browser paint)
  // biome-ignore lint/correctness/useExhaustiveDependencies: displayedProjects is derived from filtered
  useLayoutEffect(() => {
    const plan = transitionPlanRef.current;
    if (!listRef.current) return;

    // If no transition plan, just make all items visible (fallback for normal renders)
    if (!plan) {
      Array.from(listRef.current.querySelectorAll("li")).forEach((item) => {
        const el = item as HTMLElement;
        if (!el.classList.contains("project-visible")) {
          el.classList.add("project-visible");
        }
      });
      return;
    }

    const { newPlan, stayingItems, removedFromTop, removedFromBottom } = plan;

    const newElements = Array.from(
      listRef.current.querySelectorAll("li"),
    ) as HTMLElement[];

    // CRITICAL: Prevent staying items from being visible before FLIP transforms are applied
    // This must happen in useLayoutEffect (BEFORE browser paint) to prevent flicker
    positionsBeforeRef.current.forEach((data, itemId) => {
      if (!data.isStaying) return;

      const newElement = newElements.find(
        (el) => el.dataset.projectId === itemId,
      );

      if (newElement) {
        newElement.classList.remove("project-visible");
      }
    });

    // Force layout to apply the off-screen transforms
    void listRef.current.offsetHeight;

    // Second pass: FLIP animation for staying items
    positionsBeforeRef.current.forEach((data, itemId) => {
      if (!data.isStaying) return;

      const newElement = newElements.find(
        (el) => el.dataset.projectId === itemId,
      );

      if (newElement) {
        const lastRect = newElement.getBoundingClientRect();
        const deltaX = data.rect.left - lastRect.left;
        const deltaY = data.rect.top - lastRect.top;

        if (Math.abs(deltaX) > 0.5 || Math.abs(deltaY) > 0.5) {
          // Invert: Apply transform to move item back to old position
          newElement.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
          newElement.style.transition = "none";

          void newElement.offsetHeight;

          // Play: Animate to new position
          newElement.style.transition =
            "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)";
          newElement.style.transform = "translate(0, 0)";
        } else {
          newElement.classList.add("project-bump");
        }

        // Now make it visible - it will be at old position due to transform
        newElement.classList.add("project-visible");
      }
    });

    // Slide in new items
    const newFromTop = newPlan.filter((p) => p.direction === "top");
    const newFromBottom = newPlan.filter((p) => p.direction === "bottom");

    newElements.forEach((item) => {
      const projectId = item.dataset.projectId;

      if (projectId && !stayingItems.has(projectId)) {
        const newPlanItem = newPlan.find((p) => p.item === projectId);
        if (newPlanItem) {
          const directionalGroup =
            newPlanItem.direction === "top" ? newFromTop : newFromBottom;
          const groupIndex = directionalGroup.findIndex(
            (p) => p.item === projectId,
          );

          item.style.setProperty("--item-index", String(groupIndex));
          item.style.setProperty(
            "--total-items",
            String(directionalGroup.length),
          );
        }

        item.classList.add("project-visible");
      } else if (projectId && stayingItems.has(projectId)) {
        item.classList.add("project-visible");
      }
    });

    // Schedule cleanup after animations complete
    const maxAnimationDuration = Math.max(
      600,
      600 + Math.max(removedFromTop.length, removedFromBottom.length) * 100,
    );

    const cleanupTimer = setTimeout(() => {
      Array.from(listRef.current?.querySelectorAll("li") ?? []).forEach(
        (element) => {
          const el = element as HTMLElement;
          el.style.transform = "";
          el.style.transition = "";
          el.classList.remove("project-bump");
          el.style.removeProperty("--item-index");
          el.style.removeProperty("--total-items");
        },
      );

      prevFilteredRef.current = filtered;
      isTransitioningRef.current = false;
      transitionPlanRef.current = null;
    }, maxAnimationDuration);

    return () => clearTimeout(cleanupTimer);
  }, [displayedProjects, filtered]);

  // Determine project state for rendering (minimal - most logic is in transition handler)
  const projectStates = useMemo(() => {
    const { newPlan, stayingItems } = planTransition(
      prevFilteredRef.current,
      displayedProjects,
    );

    const states = new Map<string, { action: string; direction?: string }>();

    displayedProjects.forEach((project) => {
      // For staying items, don't apply any directional classes during render
      // The FLIP animation in Phase 4 will handle them without initial animation classes
      if (stayingItems.has(project.id)) {
        states.set(project.id, { action: "stay" });
      } else {
        const newPlanItem = newPlan.find((p) => p.item === project.id);
        if (newPlanItem) {
          states.set(project.id, {
            action: newPlanItem.action,
            direction: newPlanItem.direction,
          });
        } else {
          states.set(project.id, { action: "stay" });
        }
      }
    });

    return states;
  }, [displayedProjects]);

  return (
    <article className="prose max-w-none">
      <h2 id={projectsId} className="mb-6 text-2xl font-bold md:text-center">
        Projects
      </h2>
      <div className="flow-root space-y-4 overflow-visible">
        {displayedProjects.length === 0 && query ? (
          <ProjectsEmptyState query={query} />
        ) : (
          <ol className="ml-0 list-none pl-0" ref={listRef}>
            {displayedProjects.map((project, idx) => {
              const state = projectStates.get(project.id);
              const action = state?.action ?? "slide-in";
              const direction = state?.direction ?? "top";

              return (
                <Project
                  key={project.id}
                  project={project}
                  projectIdx={idx}
                  totalLength={displayedProjects.length}
                  projectAction={action}
                  projectDirection={direction}
                />
              );
            })}
          </ol>
        )}
      </div>
    </article>
  );
};

export const Projects = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  useScrollDelegation(containerRef as React.RefObject<HTMLElement>);

  return (
    <div
      ref={containerRef}
      className="md:h-full md:overflow-y-auto projects-scrollable"
    >
      <Suspense fallback={<div>Loading projects...</div>}>
        <ProjectsContent />
      </Suspense>
    </div>
  );
};
