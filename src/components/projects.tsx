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

import { useViewportProjects } from "~/hooks/use-viewport-projects";

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
import { calculateOverlapTiming } from "~/utils/animation-timing";
import { filterCache } from "~/utils/filter-cache";
import { filterProjects } from "~/utils/filter-projects";
import { planTransition } from "~/utils/lcs-transition";
import { getSearchDomain, getSearchQuery } from "~/utils/search-params";
import { buildSelectionIndex } from "~/utils/stack-cloud/selection-index";
import { planViewportAwareTransition } from "~/utils/viewport-anchor-transition";

const ProjectsContent = ({
  containerRef,
}: {
  containerRef: React.RefObject<HTMLDivElement>;
}) => {
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

  // Track previous query/domain to detect filter changes even if results are identical
  const prevQueryRef = useRef<string>("");
  const prevDomainRef = useRef<Domain | null>(null);

  // Memoize filtered projects computation with cache
  const filtered = useMemo(() => {
    const cached = filterCache.get(query, domain ?? undefined);
    if (cached) {
      console.log(
        "%c[PROJECTS] Using cached filter result: %d items for query='%s', domain='%s'",
        "color: #4D96FF",
        cached.length,
        query,
        domain ?? "none",
      );
      return cached;
    }

    const result = filterProjects(
      PROJECTS,
      query,
      domain ?? undefined,
      selectionIndex,
    );
    console.log(
      "%c[PROJECTS] Computed filter result: %d items for query='%s', domain='%s'",
      "color: #4D96FF",
      result.length,
      query,
      domain ?? "none",
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

  // AbortController to cancel in-flight transitions when new filter applied
  const transitionAbortControllerRef = useRef<AbortController | null>(null);

  // Track which projects are currently visible in the viewport
  // This is used to determine which items should animate (visible) vs snap (off-screen)
  const visibleProjects = useViewportProjects(
    containerRef,
    "li[data-project-id]",
  );

  // Initial load
  useEffect(() => {
    if (prevFilteredRef.current.length === 0 && filtered.length > 0) {
      setDisplayedProjects(filtered);
      prevFilteredRef.current = filtered;
      prevQueryRef.current = query;
      prevDomainRef.current = domain;

      // Trigger slide-in animation after render
      setTimeout(() => {
        const items = listRef.current?.querySelectorAll("li");
        items?.forEach((item) => {
          (item as HTMLElement).classList.add("project-visible");
        });
      }, 100);
    }
  }, [filtered, query, domain]);

  // Store transition plan for use in useLayoutEffect
  const transitionPlanRef = useRef<{
    oldPlan: TransitionStep[];
    newPlan: TransitionStep[];
    stayingItems: Set<string>;
    removedFromTop: TransitionStep[];
    removedFromBottom: TransitionStep[];
    exitDuration: number;
    timing: ReturnType<typeof calculateOverlapTiming>;
    capturedVisibleProjects: Set<string>; // Capture visible projects at animation start
  } | null>(null);

  // PHASE 1 & 2: Prepare and animate out removed items
  // biome-ignore lint/correctness/useExhaustiveDependencies: visibleProjects is captured at animation start, not used as a dependency
  useEffect(() => {
    // Skip initial render
    if (prevFilteredRef.current.length === 0) return;

    // Check if query/domain changed (even if results are identical)
    const queryChanged = prevQueryRef.current !== query;
    const domainChanged = prevDomainRef.current !== domain;

    // Skip if no actual change in results AND no change in query/domain
    if (
      !queryChanged &&
      !domainChanged &&
      prevFilteredRef.current.length === filtered.length &&
      prevFilteredRef.current.every((p, i) => p.id === filtered[i]?.id)
    ) {
      return;
    }

    // CRITICAL: Cancel any in-flight transition when new filter applied
    // This prevents the old transition from blocking the new one
    if (transitionAbortControllerRef.current) {
      console.log(
        "%c[PROJECTS] Canceling previous transition",
        "color: #FF6B6B; font-weight: bold",
      );
      transitionAbortControllerRef.current.abort();
      transitionAbortControllerRef.current = null;
    }

    // Create new abort controller for this transition
    const abortController = new AbortController();
    transitionAbortControllerRef.current = abortController;

    // If we're already transitioning, forcefully abort and clean up
    if (isTransitioningRef.current) {
      console.log(
        "%c[PROJECTS] Force-cleaning previous transition state",
        "color: #FF6B6B",
      );
      isTransitioningRef.current = false;
      transitionPlanRef.current = null;

      // Clean up animation classes from previous transition
      const liElements = Array.from(
        listRef.current?.querySelectorAll("li") ?? [],
      );
      liElements.forEach((el) => {
        const htmlEl = el as HTMLElement;
        htmlEl.style.transform = "";
        htmlEl.style.transition = "";
        htmlEl.style.transitionDelay = "";
        htmlEl.classList.remove("project-bump");
        htmlEl.style.removeProperty("--item-index");
        htmlEl.style.removeProperty("--total-items");
      });
    }

    console.log(
      "%c[PROJECTS] Transition Started",
      "color: #667EEA; font-weight: bold",
    );
    console.log(
      "%cPrevious filtered ref: %d items - %O",
      "color: #FF8C42",
      prevFilteredRef.current.length,
      prevFilteredRef.current.map((p) => p.id),
    );
    console.log(
      "%cNew filtered: %d items - %O",
      "color: #2ECE71",
      filtered.length,
      filtered.map((p) => p.id),
    );
    console.log(
      "%cCurrent displayed projects: %d items",
      "color: #FF6B6B",
      displayedProjects.length,
    );

    // CRITICAL: Capture the current visible projects at the START of transition
    // This ensures the anchor point remains stable throughout the animation
    const capturedVisibleProjects = new Set(visibleProjects);

    void prepareTransition(abortController.signal);

    async function prepareTransition(signal: AbortSignal) {
      isTransitioningRef.current = true;

      // Check if abort was requested before starting
      if (signal.aborted) {
        console.log(
          "%c[PROJECTS] Transition aborted before start",
          "color: #FF6B6B",
        );
        isTransitioningRef.current = false;
        transitionPlanRef.current = null;
        // DO NOT update prevFilteredRef here - let the new transition handle it
        return;
      }

      // Get the original LCS-based transition plan for staying item detection
      const {
        oldPlan: lcsOldPlan,
        newPlan: lcsNewPlan,
        stayingItems,
      } = planTransition(prevFilteredRef.current, filtered);

      // Use viewport-aware transition planning to refine directions based on visible anchor
      // Uses the captured visibility state to ensure consistent direction assignment
      const viewportPlan = planViewportAwareTransition(
        prevFilteredRef.current,
        filtered,
        capturedVisibleProjects,
      );

      // Merge LCS staying item detection with viewport-aware direction calculation
      // This preserves the fade/slide detection while using viewport-aware directions
      const oldPlan: TransitionStep[] = lcsOldPlan.map((step) => {
        const viewportItem = viewportPlan.plan.find(
          (vp) => vp.itemId === step.item,
        );
        return {
          ...step,
          // Use viewport-aware direction if available and item is sliding
          direction:
            step.action === "slide-out" && viewportItem?.direction
              ? viewportItem.direction
              : step.direction,
        };
      });

      const newPlan: TransitionStep[] = lcsNewPlan.map((step) => {
        const viewportItem = viewportPlan.plan.find(
          (vp) => vp.itemId === step.item,
        );
        return {
          ...step,
          // Use viewport-aware direction if available and item is entering
          direction:
            step.action === "slide-in" && viewportItem?.direction
              ? viewportItem.direction
              : step.direction,
        };
      });

      console.log(
        "%c[PROJECTS] Viewport anchor: %s",
        "color: #667EEA",
        viewportPlan.anchor.anchorItemId,
      );

      // Log staying items to verify they're not being changed to slide-out
      const stayingInOldPlan = oldPlan.filter((p) => p.action === "stay");
      console.log(
        "%c[PROJECTS] Staying items in merged plan: %O",
        "color: #4D96FF",
        stayingInOldPlan.map((p) => ({
          id: p.item,
          action: p.action,
          direction: p.direction,
        })),
      );

      const slidingOutItems = oldPlan.filter((p) => p.action === "slide-out");
      console.log(
        "%c[PROJECTS] Sliding out items: %O",
        "color: #FF8C42",
        slidingOutItems.map((p) => ({
          id: p.item,
          direction: p.direction,
        })),
      );

      console.log(
        "%c[PROJECTS] Viewport-aware anchor info: %O",
        "color: #667EEA",
        {
          anchorItemId: viewportPlan.anchor.anchorItemId,
          visibleItemIds: Array.from(viewportPlan.anchor.visibleItemIds),
        },
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

      // PHASE 2: Animate OUT only items being REMOVED with overlapping timing
      const removedFromTop = oldPlan.filter(
        (p) => p.action === "slide-out" && p.direction === "top",
      );
      const removedFromBottom = oldPlan.filter(
        (p) => p.action === "slide-out" && p.direction === "bottom",
      );

      // Count visible items in each category to coordinate timing
      // Only visible items animate; off-screen items snap instantly
      // Use the captured visibility set to ensure consistent timing calculation
      const visibleRemovedItems = removedFromTop
        .concat(removedFromBottom)
        .filter((p) => capturedVisibleProjects.has(p.item));
      const visibleEnteringItems = newPlan
        .filter((p) => p.action === "slide-in")
        .filter((p) => capturedVisibleProjects.has(p.item));

      // Count items by direction for coordinated timing
      const visibleRemovedFromTop = removedFromTop.filter((p) =>
        capturedVisibleProjects.has(p.item),
      );
      const visibleRemovedFromBottom = removedFromBottom.filter((p) =>
        capturedVisibleProjects.has(p.item),
      );

      const enteringFromTop = newPlan.filter(
        (p) => p.action === "slide-in" && p.direction === "top",
      );
      const enteringFromBottom = newPlan.filter(
        (p) => p.action === "slide-in" && p.direction === "bottom",
      );

      const visibleEnteringFromTop = enteringFromTop.filter((p) =>
        capturedVisibleProjects.has(p.item),
      );
      const visibleEnteringFromBottom = enteringFromBottom.filter((p) =>
        capturedVisibleProjects.has(p.item),
      );

      // Calculate coordinated timing for smooth overlapping animations
      // Viewport-aware: only visible items get staggered delays, off-screen items snap
      // Directional: items from TOP and BOTTOM are coordinated separately to prevent overlaps
      const timing = calculateOverlapTiming({
        removedCount: removedFromTop.length + removedFromBottom.length,
        visibleRemovedCount: visibleRemovedItems.length,
        removedFromTopCount: removedFromTop.length,
        visibleRemovedFromTopCount: visibleRemovedFromTop.length,
        removedFromBottomCount: removedFromBottom.length,
        visibleRemovedFromBottomCount: visibleRemovedFromBottom.length,
        stayingCount: oldPlan.filter((p) => p.action === "stay").length,
        visibleStayingCount: oldPlan
          .filter((p) => p.action === "stay")
          .filter((p) => visibleProjects.has(p.item)).length,
        enteringCount: newPlan.filter((p) => p.action === "slide-in").length,
        visibleEnteringCount: visibleEnteringItems.length,
        enteringFromTopCount: enteringFromTop.length,
        visibleEnteringFromTopCount: visibleEnteringFromTop.length,
        enteringFromBottomCount: enteringFromBottom.length,
        visibleEnteringFromBottomCount: visibleEnteringFromBottom.length,
        staggerDelay: 50, // 50ms between each visible item
        animationDuration: 600, // 600ms per animation
      });

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

          // Viewport-aware delay: only visible items get staggered delay
          // Off-screen items snap instantly with 0s delay
          // Use captured visibility to match the anchor that was determined at start
          const isVisible = capturedVisibleProjects.has(plan.item);
          const delayMs = isVisible ? groupIndex * 50 : 0;
          element.style.transitionDelay = `${delayMs / 1000}s`;

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

      // DOM update trigger: when exits are clearly visible but before full completion
      // This allows FLIP animations to start immediately with staying items
      const exitDuration = timing.totalDuration;

      // Store transition plan for Phase 4 (FLIP animation)
      transitionPlanRef.current = {
        oldPlan,
        newPlan,
        stayingItems,
        removedFromTop,
        removedFromBottom,
        exitDuration,
        timing,
        capturedVisibleProjects, // Preserve anchor stability across animation phases
      };

      if (exitDuration > 0) {
        await new Promise((resolve) => {
          const timeoutId = setTimeout(resolve, exitDuration);
          // Allow abort signal to cancel the timeout
          signal.addEventListener("abort", () => clearTimeout(timeoutId));
        });
      }

      // Check if abort was requested before proceeding
      if (signal.aborted) {
        console.log(
          "%c[PROJECTS] Transition aborted during wait",
          "color: #FF6B6B",
        );
        isTransitioningRef.current = false;
        transitionPlanRef.current = null;
        // DO NOT update state when aborted - the new effect will handle it
        return;
      }

      // PHASE 3: Update to new filtered list
      // This triggers a React render, and useLayoutEffect will fire to do FLIP before paint
      console.log(
        "%c[PROJECTS] PHASE 3: Updating displayed projects",
        "color: #667EEA",
      );
      setDisplayedProjects(filtered);
      prevFilteredRef.current = filtered;
      prevQueryRef.current = query;
      prevDomainRef.current = domain;
    }
  }, [filtered]);

  // PHASE 4: FLIP animation using useLayoutEffect (runs BEFORE browser paint)
  useLayoutEffect(() => {
    const plan = transitionPlanRef.current;
    if (!listRef.current) return;

    console.log(
      "%c[PROJECTS] PHASE 4: FLIP animation starting",
      "color: #667EEA",
    );
    console.log(
      "%cDisplayed projects count: %d",
      "color: #667EEA",
      displayedProjects.length,
    );
    console.log(
      "%cActual DOM li elements: %d",
      "color: #667EEA",
      listRef.current.querySelectorAll("li").length,
    );

    // If no transition plan, just make all items visible (fallback for normal renders)
    if (!plan) {
      console.log(
        "%c[PROJECTS] No transition plan - making all items visible",
        "color: #667EEA",
      );
      const liElements = Array.from(listRef.current.querySelectorAll("li"));
      console.log(
        "%cDirect visibility update for %d items",
        "color: #667EEA",
        liElements.length,
      );
      liElements.forEach((item) => {
        const el = item as HTMLElement;
        if (!el.classList.contains("project-visible")) {
          el.classList.add("project-visible");
        }
      });
      return;
    }

    const {
      newPlan,
      stayingItems,
      removedFromTop,
      removedFromBottom,
      capturedVisibleProjects: capturedVisible,
    } = plan;

    const newElements = Array.from(
      listRef.current.querySelectorAll("li"),
    ) as HTMLElement[];

    console.log(
      "%c[PROJECTS] New elements found: %d, Staying items: %d",
      "color: #667EEA",
      newElements.length,
      stayingItems.size,
    );
    console.log(
      "%cStaying items IDs: %O",
      "color: #667EEA",
      Array.from(stayingItems),
    );

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
          // Clear any inline transition styles that might interfere with the bump animation
          newElement.style.removeProperty("transition");
          newElement.style.removeProperty("transform");

          // Ensure animation property is cleared
          newElement.style.animation = "none";

          // Make visible first (applying project-visible CSS rule with transform: translateY(0))
          newElement.classList.add("project-visible");

          // Force layout recalculation to ensure animation starts fresh
          void newElement.offsetHeight;

          // Now clear inline animation and add the bump animation class
          newElement.style.removeProperty("animation");
          newElement.classList.add("project-bump");
        }
      }
    });

    // Slide in new items with coordinated timing (viewport-aware, direction-specific)
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

          // Viewport-aware entry delay: only visible items get staggered timing
          // Off-screen items snap instantly (0s delay) to avoid performance issues
          // Direction-specific timing: TOP items wait for TOP exits, BOTTOM for BOTTOM exits
          // Use captured visibility from animation start for consistency
          const isVisible = capturedVisible.has(projectId);
          if (isVisible) {
            // Calculate the delay based on direction
            const isFromTop = newPlanItem.direction === "top";
            const entryStartDelay = isFromTop
              ? plan.timing.entryFromTopStartDelay
              : plan.timing.entryFromBottomStartDelay;

            const delayMs = entryStartDelay + groupIndex * 50; // 50ms stagger per item
            item.style.transitionDelay = `${delayMs / 1000}s`;
          } else {
            // For off-screen items, snap instantly with no delay
            item.style.transitionDelay = "0s";
          }
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
      // Only cleanup if this is still the active transition
      // If transitionPlanRef was cleared, it means a new transition started
      if (!transitionPlanRef.current) {
        console.log(
          "%c[PROJECTS] Cleanup skipped - new transition has started",
          "color: #FF6B6B",
        );
        isTransitioningRef.current = false;
        return;
      }

      console.log(
        "%c[PROJECTS] Cleanup phase - removing transition styles",
        "color: #667EEA",
      );
      const elements = Array.from(
        listRef.current?.querySelectorAll("li") ?? [],
      );
      console.log(
        "%cCleaning up %d elements",
        "color: #667EEA",
        elements.length,
      );
      elements.forEach((element) => {
        const el = element as HTMLElement;
        el.style.transform = "";
        el.style.transition = "";
        el.classList.remove("project-bump");
        el.classList.remove("project-from-top");
        el.classList.remove("project-from-bottom");
        el.classList.remove("project-slide-out");
        el.classList.remove("project-fade-out");
        el.style.removeProperty("--item-index");
        el.style.removeProperty("--total-items");
      });

      console.log(
        "%c[PROJECTS] Final displayed projects: %O",
        "color: #2ECE71",
        filtered.map((p) => p.id),
      );
      console.log(
        "%c[PROJECTS] Transition complete",
        "color: #667EEA; font-weight: bold",
      );

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

  // Log final render state
  const renderedProjectIds = displayedProjects.map((p) => p.id);
  console.log(
    "%c[PROJECTS] Rendering %d projects",
    "color: #667EEA",
    displayedProjects.length,
  );
  console.log("%cRendered IDs: %O", "color: #667EEA", renderedProjectIds);

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
        <ProjectsContent
          containerRef={containerRef as React.RefObject<HTMLDivElement>}
        />
      </Suspense>
    </div>
  );
};
