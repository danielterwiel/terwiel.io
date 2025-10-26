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
import {
  getSearchDomain,
  getSearchFilter,
  getSearchQuery,
} from "~/utils/search-params";
import { buildSelectionIndex } from "~/utils/stack-cloud/selection-index";
import { planViewportAwareTransition } from "~/utils/viewport-anchor-transition";

const ProjectsContent = ({
  containerRef,
}: {
  containerRef: React.RefObject<HTMLDivElement>;
}) => {
  const searchParams = useSearchParams();
  const query = getSearchQuery(searchParams);
  const filter = getSearchFilter(searchParams);

  // Use filter parameter if set (from StackCloud), otherwise fall back to query (from SearchInput)
  const activeSearchTerm = filter || query;

  // Extract domain filter (if search term matches a domain name exactly)
  const domain = getSearchDomain(activeSearchTerm, PROJECTS) as Domain | null;

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
  // Checks BOTH query (from SearchInput) and filter (from StackCloud) parameters
  const filtered = useMemo(() => {
    const cached = filterCache.get(activeSearchTerm, domain ?? undefined);
    if (cached) {
      return cached;
    }

    const result = filterProjects(
      PROJECTS,
      activeSearchTerm,
      domain ?? undefined,
      selectionIndex,
    );
    filterCache.set(activeSearchTerm, domain ?? undefined, result);
    return result;
  }, [activeSearchTerm, domain, selectionIndex]);

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
    anchorScrollOffset: number | null; // Anchor's position relative to container top
    anchorItemId: string | null; // ID of anchor item for scroll restoration
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
      transitionAbortControllerRef.current.abort();
      transitionAbortControllerRef.current = null;
    }

    // Create new abort controller for this transition
    const abortController = new AbortController();
    transitionAbortControllerRef.current = abortController;

    // If we're already transitioning, forcefully abort and clean up
    if (isTransitioningRef.current) {
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

      // Unlock container height during force cleanup
      if (listRef.current) {
        listRef.current.style.height = "";
      }
    }

    // CRITICAL: Capture the current visible projects at the START of transition
    // This ensures the anchor point remains stable throughout the animation
    const capturedVisibleProjects = new Set(visibleProjects);

    void prepareTransition(abortController.signal);

    async function prepareTransition(signal: AbortSignal) {
      isTransitioningRef.current = true;

      // Check if abort was requested before starting
      if (signal.aborted) {
        isTransitioningRef.current = false;
        transitionPlanRef.current = null;
        // DO NOT update prevFilteredRef here - let the new transition handle it
        return;
      }

      // STEP 1: Use LCS ONLY for staying item detection (not directions)
      const { stayingItems } = planTransition(
        prevFilteredRef.current,
        filtered,
      );

      // STEP 2: Use viewport-aware planning for ALL direction logic
      // This is simpler and more reliable than merging LCS + viewport directions
      const viewportPlan = planViewportAwareTransition(
        prevFilteredRef.current,
        filtered,
        capturedVisibleProjects,
      );

      // STEP 3: Build transition steps from viewport plan
      // Map viewport-aware plan to our TransitionStep format
      const oldPlan: TransitionStep[] = prevFilteredRef.current.map(
        (project) => {
          const vpItem = viewportPlan.plan.find(
            (vp) => vp.itemId === project.id,
          );
          if (!vpItem) {
            // Item not in plan - shouldn't happen, but handle gracefully
            return {
              item: project.id,
              project,
              action: "slide-out" as const,
              oldIndex: prevFilteredRef.current.findIndex(
                (p) => p.id === project.id,
              ),
              direction: "bottom" as const,
            };
          }

          if (vpItem.action === "stay") {
            const oldIndex = prevFilteredRef.current.findIndex(
              (p) => p.id === project.id,
            );
            const newIndex = filtered.findIndex((p) => p.id === project.id);
            return {
              item: project.id,
              project,
              action: "stay" as const,
              oldIndex,
              newIndex,
            };
          }

          // Action is slide-out or fade
          return {
            item: project.id,
            project,
            action: vpItem.action,
            oldIndex: prevFilteredRef.current.findIndex(
              (p) => p.id === project.id,
            ),
            direction: vpItem.direction,
          };
        },
      );

      const newPlan: TransitionStep[] = filtered.map((project) => {
        const vpItem = viewportPlan.plan.find((vp) => vp.itemId === project.id);
        if (!vpItem) {
          // Item not in plan - shouldn't happen, but handle gracefully
          return {
            item: project.id,
            project,
            action: "slide-in" as const,
            newIndex: filtered.findIndex((p) => p.id === project.id),
            direction: "top" as const,
          };
        }

        if (vpItem.action === "stay") {
          // Already in old plan
          return {
            item: project.id,
            project,
            action: "stay" as const,
            newIndex: filtered.findIndex((p) => p.id === project.id),
          };
        }

        // Action is slide-in
        return {
          item: project.id,
          project,
          action: vpItem.action,
          newIndex: filtered.findIndex((p) => p.id === project.id),
          direction: vpItem.direction,
        };
      });

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

      // CRITICAL: Save anchor element's scroll position before DOM update
      // This prevents scroll jumps when items are added/removed above the anchor
      let anchorScrollOffset: number | null = null;
      let anchorElement: HTMLElement | null = null;
      if (viewportPlan.anchor.anchorItemId && containerRef.current) {
        anchorElement =
          currentElements.find(
            (el) => el.dataset.projectId === viewportPlan.anchor.anchorItemId,
          ) ?? null;
        if (anchorElement) {
          // Save anchor's position relative to container top
          const containerTop = containerRef.current.getBoundingClientRect().top;
          const anchorTop = anchorElement.getBoundingClientRect().top;
          anchorScrollOffset = anchorTop - containerTop;
        }
      }

      // CRITICAL: Lock the list container height to prevent it from collapsing
      // as items are removed. This keeps the anchor item in its visual position
      // while new items slide up underneath from below.
      if (listRef.current) {
        const currentHeight = listRef.current.offsetHeight;
        listRef.current.style.height = `${currentHeight}px`;
      }

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
        anchorItemId: viewportPlan.anchor.anchorItemId, // Pass anchor to prevent FLIP animation
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

          // Viewport-aware optimization: only visible items get staggered animation delay
          // Off-viewport items get reduced delay but still animate (for smoothness)
          const isVisible = capturedVisibleProjects.has(plan.item);
          if (isVisible) {
            const delayMs = groupIndex * 50;
            element.style.transitionDelay = `${delayMs / 1000}s`;
          } else {
            // Off-viewport: minimal delay, still animates for visual consistency
            element.style.transitionDelay = "0s";
          }

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
        anchorScrollOffset, // For scroll position restoration
        anchorItemId: viewportPlan.anchor.anchorItemId, // For finding anchor after DOM update
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
        isTransitioningRef.current = false;
        transitionPlanRef.current = null;
        // DO NOT update state when aborted - the new effect will handle it
        return;
      }

      // PHASE 3: Update to new filtered list
      // This triggers a React render, and useLayoutEffect will fire to do FLIP before paint
      setDisplayedProjects(filtered);
      prevFilteredRef.current = filtered;
      prevQueryRef.current = query;
      prevDomainRef.current = domain;
    }
  }, [filtered]);

  // PHASE 4: FLIP animation using useLayoutEffect (runs BEFORE browser paint)
  // biome-ignore lint/correctness/useExhaustiveDependencies: containerRef is stable and should not trigger re-runs
  useLayoutEffect(() => {
    const plan = transitionPlanRef.current;
    if (!listRef.current) return;

    // If no transition plan, just make all items visible (fallback for normal renders)
    if (!plan) {
      const liElements = Array.from(listRef.current.querySelectorAll("li"));
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
      timing,
      anchorScrollOffset,
      anchorItemId,
    } = plan;

    const newElements = Array.from(
      listRef.current.querySelectorAll("li"),
    ) as HTMLElement[];

    // CRITICAL: Restore scroll position to keep anchor in same viewport position
    // This prevents scroll jumps when items are added/removed above the anchor
    if (anchorItemId && anchorScrollOffset !== null && containerRef.current) {
      const newAnchorElement = newElements.find(
        (el) => el.dataset.projectId === anchorItemId,
      );
      if (newAnchorElement) {
        // Calculate anchor's new position relative to container top
        const containerTop = containerRef.current.getBoundingClientRect().top;
        const newAnchorTop = newAnchorElement.getBoundingClientRect().top;
        const newAnchorOffset = newAnchorTop - containerTop;

        // Calculate how much scroll adjustment is needed
        const scrollDelta = newAnchorOffset - anchorScrollOffset;

        if (Math.abs(scrollDelta) > 1) {
          // Adjust scroll position to keep anchor in same viewport position
          containerRef.current.scrollTop += scrollDelta;
        }
      }
    }

    // CRITICAL: Prevent staying items from being visible before FLIP transforms are applied
    // This must happen in useLayoutEffect (BEFORE browser paint) to prevent flicker
    // EXCEPTION: Skip hiding the anchor item - it stays visually static
    positionsBeforeRef.current.forEach((data, itemId) => {
      if (!data.isStaying) return;
      // Skip anchor item - it stays visible and static
      if (timing.anchorItemId === itemId) return;

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
    // CRITICAL: The anchor item is NOT animated - it stays in the same visual position
    positionsBeforeRef.current.forEach((data, itemId) => {
      if (!data.isStaying) return;
      // CRITICAL: Skip anchor item - it remains completely static in the viewport
      if (timing.anchorItemId === itemId) {
        return;
      }

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

          // Viewport-aware entry optimization: visible items get staggered delays
          // Off-viewport items get minimal delay but still animate
          // Direction-specific timing: TOP items wait for TOP exits, BOTTOM for BOTTOM exits
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
            // Off-viewport: minimal delay, still animates for visual consistency
            item.style.transitionDelay = "0s";
          }
        }

        item.classList.add("project-visible");
      } else if (projectId && stayingItems.has(projectId)) {
        // Staying item that wasn't processed by FLIP (likely the anchor or off-viewport)
        item.classList.add("project-visible");

        // If this is the anchor, add a subtle bump animation to signal it's staying
        if (timing.anchorItemId === projectId) {
          item.classList.add("project-bump");
        }
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
        isTransitioningRef.current = false;
        return;
      }

      const elements = Array.from(
        listRef.current?.querySelectorAll("li") ?? [],
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

      // CRITICAL: Unlock container height after animation completes
      // This allows the container to shrink/expand based on new content
      if (listRef.current) {
        listRef.current.style.height = "";
      }

      isTransitioningRef.current = false;
      transitionPlanRef.current = null;
    }, maxAnimationDuration);

    return () => clearTimeout(cleanupTimer);
  }, [displayedProjects, filtered]);

  // Determine project state for rendering (minimal - most logic is in transition handler)
  const projectStates = useMemo(() => {
    // Use LCS ONLY for staying item detection
    const { stayingItems } = planTransition(
      prevFilteredRef.current,
      displayedProjects,
    );

    // Use viewport-aware planning for directions
    const viewportPlan = planViewportAwareTransition(
      prevFilteredRef.current,
      displayedProjects,
      visibleProjects,
    );

    const states = new Map<string, { action: string; direction?: string }>();

    displayedProjects.forEach((project) => {
      const vpItem = viewportPlan.plan.find((vp) => vp.itemId === project.id);

      // For staying items, don't apply any directional classes during render
      // The FLIP animation in Phase 4 will handle them without initial animation classes
      if (stayingItems.has(project.id)) {
        states.set(project.id, { action: "stay" });
      } else if (vpItem) {
        states.set(project.id, {
          action: vpItem.action,
          direction: vpItem.direction,
        });
      } else {
        // Fallback - shouldn't happen
        states.set(project.id, { action: "stay" });
      }
    });

    return states;
  }, [displayedProjects, visibleProjects]);

  return (
    // biome-ignore lint/correctness/useUniqueElementIds: Projects section is rendered only once
    <article className="prose max-w-none" id="projects">
      <h2
        id={projectsId}
        className="mb-6 text-2xl font-bold md:text-center md:pt-2"
      >
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
