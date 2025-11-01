import * as d3 from "d3";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { useDeferredValue, useEffect, useRef, useTransition } from "react";

import type { Domain } from "~/types";

import { PROJECTS } from "~/data/projects";
import { useAccessibility } from "~/hooks/use-accessibility";
import { isEqualDomain, matchesDomainName } from "~/utils/get-domain-names";
import {
  getSearchFilter,
  getSearchQuery,
  toggleFilterParam,
} from "~/utils/search-params";

interface PieSegmentData {
  domain: string;
  value: number;
  color: string;
  percentage: number;
}

interface RootNodeChartProps {
  pieData: PieSegmentData[];
  pieRadius: number;
  onDomainHover?: (domain: Domain | null) => void;
  onAnimationComplete?: () => void;
  setHoveredDomain: (domain: Domain | null) => void;
}

/**
 * Pie chart component for the root node visualization
 * Handles all d3 rendering and interactions for the domain distribution chart
 * Memoized to prevent unnecessary re-renders of expensive d3 operations
 */
// biome-ignore lint/style/useComponentExportOnlyModules: Component is exported via memo wrapper
const RootNodeChartComponent = (props: RootNodeChartProps) => {
  const {
    pieData,
    pieRadius,
    onDomainHover,
    onAnimationComplete,
    setHoveredDomain,
  } = props;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pieChartRef = useRef<SVGGElement>(null);
  const hasAnimatedRef = useRef(false);
  const matchedDomainRef = useRef<string | null>(null);
  // Track previous animation state to detect rapid toggles
  const previouslyAnimatingRef = useRef<boolean>(false);
  const [_isPending, startTransition] = useTransition();

  const a11y = useAccessibility();
  const currentSearchQuery = getSearchQuery(searchParams);
  const currentSearchFilter = getSearchFilter(searchParams);

  // Defer filter updates to let animations complete first
  // This prevents D3 transitions from blocking urgent UI updates
  const _deferredSearchFilter = useDeferredValue(currentSearchFilter);

  // Track selection state in refs to avoid expensive re-renders
  const currentSearchQueryRef = useRef(currentSearchQuery);
  currentSearchQueryRef.current = currentSearchQuery;

  const currentSearchFilterRef = useRef(currentSearchFilter);
  currentSearchFilterRef.current = currentSearchFilter;

  // Store startTransition in ref so it can be accessed in useEffect
  const startTransitionRef = useRef(startTransition);
  startTransitionRef.current = startTransition;

  // Update visual states without re-rendering entire chart
  // Uses deferred value to avoid blocking urgent UI updates
  // Immediately interrupts ongoing animations on new updates for responsive feel
  // biome-ignore lint/correctness/useExhaustiveDependencies: currentSearchQuery and currentSearchFilter are needed to trigger updates when search params change, even though they're read from refs
  useEffect(() => {
    if (!pieChartRef.current) {
      return;
    }
    if (!hasAnimatedRef.current) {
      return;
    }

    // Use requestAnimationFrame to batch visual updates for better performance
    const rafId = requestAnimationFrame(() => {
      if (!pieChartRef.current) return;

      // Check query first (from SearchInput), then filter (from StackCloud) if no query match
      let matchedDomain = matchesDomainName(
        currentSearchQueryRef.current,
        PROJECTS,
      );
      if (!matchedDomain) {
        matchedDomain = matchesDomainName(
          currentSearchFilterRef.current,
          PROJECTS,
        );
      }

      // CRITICAL BUG FIX: Save previous state BEFORE updating ref
      // Compare NEW state (matchedDomain) with OLD state (matchedDomainRef.current)
      // Use isEqualDomain for case-insensitive comparison
      const stateIsChanging = !isEqualDomain(
        matchedDomain,
        matchedDomainRef.current,
      );

      // Early bailout: Skip update entirely if state hasn't changed
      // This prevents unnecessary DOM operations and D3 transitions
      if (!stateIsChanging) {
        return;
      }

      matchedDomainRef.current = matchedDomain;

      const svg = d3.select(pieChartRef.current);

      const RING_THICKNESS = pieRadius * 0.08; // Match the ring thickness used when creating the chart
      const arc = d3
        .arc<d3.PieArcDatum<PieSegmentData>>()
        .innerRadius(pieRadius - RING_THICKNESS)
        .outerRadius(pieRadius);

      const selectedArc = d3
        .arc<d3.PieArcDatum<PieSegmentData>>()
        .innerRadius(pieRadius - RING_THICKNESS)
        .outerRadius(pieRadius + RING_THICKNESS * 1.1); // Match the selection scale used when creating the chart

      // Batch DOM updates together
      const segments = svg.selectAll<
        SVGGElement,
        d3.PieArcDatum<PieSegmentData>
      >("g.segment-visual");

      // PERFORMANCE: Batch ALL DOM reads first (prevents layout thrashing)
      const pathElements = segments.select<SVGPathElement>("path.pie-segment");
      const hitAreas = svg.selectAll<
        SVGPathElement,
        d3.PieArcDatum<PieSegmentData>
      >(".pie-segment-hit-area");

      // Now batch ALL DOM writes together (prevents reflow/repaint churn)
      segments.attr("transform", "translate(0, 0)");

      const baseDuration = a11y.getTransitionDuration(150);

      // Immediately interrupt ongoing animations for responsive feel
      pathElements.interrupt();

      // Use shorter animation if we're in a "burst" of rapid updates
      // (detected by checking if an animation was already running)
      const isRapidBurst = previouslyAnimatingRef.current;
      previouslyAnimatingRef.current = true;

      // Skip animation entirely on rapid bursts to feel snappy
      // Otherwise use normal duration
      const transitionDuration = isRapidBurst ? 0 : baseDuration;

      // Update paths with transition (batched)
      // PERFORMANCE: Single transition for all segments is faster than individual ones
      pathElements
        .transition()
        .duration(transitionDuration)
        .attr("opacity", (d) =>
          isEqualDomain(matchedDomain, d.data.domain) ? "1.0" : "0.55",
        ) // Moderate contrast for multiple selections
        .attr("d", (d) =>
          isEqualDomain(matchedDomain, d.data.domain)
            ? (selectedArc(d) ?? "")
            : (arc(d) ?? ""),
        )
        .on("end", () => {
          // Reset rapid burst detection after animation completes
          previouslyAnimatingRef.current = false;
        });

      // Update ARIA states (batched, no transitions needed)
      hitAreas.attr("aria-pressed", (d) =>
        isEqualDomain(matchedDomain, d.data.domain) ? "true" : "false",
      );
    });

    return () => cancelAnimationFrame(rafId);
  }, [a11y, pieRadius, currentSearchQuery, currentSearchFilter]);

  useEffect(() => {
    if (!pieChartRef.current) return;

    // Clear hover state when recreating the pie chart
    onDomainHover?.(null);

    const svg = d3.select(pieChartRef.current);

    // Read from refs to get latest search values without retriggering effect
    // Check query first (from SearchInput), then filter (from StackCloud) if no query match
    let matchedDomain = matchesDomainName(
      currentSearchQueryRef.current,
      PROJECTS,
    );
    if (!matchedDomain) {
      matchedDomain = matchesDomainName(
        currentSearchFilterRef.current,
        PROJECTS,
      );
    }
    matchedDomainRef.current = matchedDomain;

    // Clear existing content
    svg.selectAll("*").remove();

    // Create pie layout
    const pie = d3
      .pie<PieSegmentData>()
      .value((d) => d.value)
      .sort(null); // Maintain order

    // Define arc states
    const RING_THICKNESS = pieRadius * 0.08; // Thickness of the ring border

    // Default arc: ring/donut style (hollow) - idle state
    const arc = d3
      .arc<d3.PieArcDatum<PieSegmentData>>()
      .innerRadius(pieRadius - RING_THICKNESS)
      .outerRadius(pieRadius);

    // Selected arc: moderate growth outward for clear but balanced selection (WCAG 2.2)
    const selectedArc = d3
      .arc<d3.PieArcDatum<PieSegmentData>>()
      .innerRadius(pieRadius - RING_THICKNESS)
      .outerRadius(pieRadius + RING_THICKNESS * 1.1);

    // Invisible hit area arc: always full segment for better mobile interaction
    const hitAreaArc = d3
      .arc<d3.PieArcDatum<PieSegmentData>>()
      .innerRadius(0)
      .outerRadius(pieRadius);

    // Generate pie segments
    const arcs = pie(pieData);

    const shouldAnimate = !hasAnimatedRef.current && !a11y.prefersReducedMotion;

    interface SweepDatum {
      startAngle: number;
      endAngle: number;
      innerRadius: number;
      outerRadius: number;
    }

    let clipPathId: string | undefined;
    let sweepPath:
      | d3.Selection<SVGPathElement, SweepDatum, null, undefined>
      | undefined;
    let sweepArc: d3.Arc<unknown, SweepDatum> | undefined;

    if (shouldAnimate) {
      // Create clip path for pie chart radar sweep animation
      const defs = svg.append("defs");
      const clipPath = defs
        .append("clipPath")
        .attr("id", `radar-sweep-${Math.random().toString(36).substr(2, 9)}`);

      clipPathId = clipPath.attr("id");

      // Create sweep arc (a wedge that grows from 0° to 360°)
      sweepArc = d3
        .arc<SweepDatum>()
        .innerRadius(0)
        .outerRadius(pieRadius * 1.5); // Larger than pie to ensure full coverage

      // Create the sweeping wedge path
      sweepPath = clipPath
        .append("path")
        .datum<SweepDatum>({
          startAngle: 0,
          endAngle: 0,
          innerRadius: 0,
          outerRadius: pieRadius * 1.5,
        })
        .attr("d", sweepArc as unknown as string);
    }

    // Create a group for all pie segments
    const pieGroup = svg
      .append("g")
      .attr("clip-path", shouldAnimate ? `url(#${clipPathId})` : null);

    // Create groups for each segment (visible path + invisible hit area)
    const segmentGroups = pieGroup
      .selectAll("g.segment-group")
      .data(arcs)
      .enter()
      .append("g")
      .attr("class", "segment-group");

    // Create visible pie segments
    const visibleSegments = segmentGroups
      .append("g")
      .attr("class", "segment-visual");

    visibleSegments
      .append("path")
      .attr("fill", (d) => d.data.color)
      .attr("class", (d) => {
        const baseClasses = "pie-segment magnetic-base magnetic-rounded-full";
        const stateClasses = a11y.getStateClasses({
          selected: isEqualDomain(matchedDomain, d.data.domain),
        });
        return `${baseClasses} ${stateClasses}`;
      })
      .attr("opacity", (d) =>
        isEqualDomain(matchedDomain, d.data.domain) ? "1.0" : "0.55",
      ) // Moderate contrast for multiple selections
      .attr("pointer-events", "none")
      .attr("d", (d) =>
        isEqualDomain(matchedDomain, d.data.domain)
          ? (selectedArc(d) ?? "")
          : (arc(d) ?? ""),
      );

    // Create hit areas (always full segments for better touch targets)
    const hitAreas = segmentGroups
      .append("path")
      .attr("class", () => {
        const baseClass = "pie-segment-hit-area";
        const stateClasses = a11y.getStateClasses({});
        return `${baseClass} ${stateClasses}`;
      })
      .attr("fill", "transparent")
      .attr("pointer-events", "all")
      .style("cursor", "pointer")
      .style("-webkit-tap-highlight-color", "transparent")
      .attr("d", (d) => hitAreaArc(d) ?? "");

    // Add ARIA attributes for accessibility
    hitAreas
      .attr("role", "button")
      .attr("tabindex", "0")
      .attr("aria-label", (d) => {
        return `${d.data.domain}: ${d.data.percentage.toFixed(1)}% - click to filter`;
      })
      .attr("aria-pressed", (d) => {
        return isEqualDomain(matchedDomain, d.data.domain) ? "true" : "false";
      });

    // Title for hover tooltip
    hitAreas.append("title").text((d) => {
      return `${d.data.domain}: ${d.data.percentage.toFixed(1)}%`;
    });

    const setupHoverInteractions = () => {
      const transitionDuration = a11y.getTransitionDuration(150);

      // Hover arc: slightly larger than default but smaller than selected for clear hierarchy
      const hoverArc = d3
        .arc<d3.PieArcDatum<PieSegmentData>>()
        .innerRadius(pieRadius - RING_THICKNESS)
        .outerRadius(pieRadius + RING_THICKNESS * 1.1);

      // Track if a touch is intended as a click (vs scroll/pan)
      let touchWasClick = false;

      const handleHoverStart = function (this: SVGPathElement) {
        const datum = d3.select(this).datum() as d3.PieArcDatum<PieSegmentData>;

        // Get the corresponding visible segment path
        const visiblePath = d3
          .select(this.previousSibling as SVGGElement)
          .select<SVGPathElement>("path.pie-segment");

        // Immediately interrupt any ongoing transitions for responsive feel
        visiblePath.interrupt();

        // Animate to hover state - clear hierarchy: default (0.55) → hover (0.8) → selected (1.0)
        // Force re-application of transition by temporarily setting to a different state first
        const hoverPath = hoverArc(datum) ?? "";
        const hoverOpacity = "0.8";

        visiblePath
          .transition()
          .duration(transitionDuration)
          .attr("d", hoverPath)
          .attr("opacity", hoverOpacity);

        // Notify parent component of domain hover
        onDomainHover?.(datum.data.domain as Domain);
        setHoveredDomain(datum.data.domain as Domain);
      };

      const handleHoverEnd = function (this: SVGPathElement) {
        const datum = d3.select(this).datum() as d3.PieArcDatum<PieSegmentData>;

        // Check if this segment's domain is selected
        const isSelected = isEqualDomain(
          matchedDomainRef.current,
          datum.data.domain,
        );

        // When leaving any segment, always clear the hover domain
        // Don't restore to selected domain - that's managed by RootNodeExperience's logic:
        // It will show hoveredStack if hoveredDomain is null and hoveredStack is set
        const restoreDomain = null;

        // Get the corresponding visible segment path
        const visiblePath = d3
          .select(this.previousSibling as SVGGElement)
          .select<SVGPathElement>("path.pie-segment");

        // Immediately interrupt any ongoing transitions for responsive feel
        visiblePath.interrupt();

        // Animate back to default or selected state
        const targetArc = isSelected ? selectedArc : arc;
        visiblePath
          .transition()
          .duration(transitionDuration)
          .attr("d", targetArc(datum) ?? "")
          .attr("opacity", isSelected ? "1.0" : "0.55"); // Moderate contrast for multiple selections

        // Notify parent of domain hover state (clear hover when leaving segment)
        onDomainHover?.(restoreDomain);
        setHoveredDomain(restoreDomain);
      };

      const handleClick = function (this: SVGPathElement) {
        const datum = d3.select(this).datum() as d3.PieArcDatum<PieSegmentData>;

        // Get the corresponding visible segment path
        const visiblePath = d3
          .select(this.previousSibling as SVGGElement)
          .select<SVGPathElement>("path.pie-segment");

        // Only interrupt THIS segment's animation, not all segments
        // This prevents breaking state on other segments
        visiblePath.interrupt();

        const queryString = toggleFilterParam(
          currentSearchFilterRef.current,
          datum.data.domain,
        );

        startTransitionRef.current(() => {
          router.push(`${pathname}${queryString}`, { scroll: false });
        });
      };

      hitAreas
        .on("mouseenter", handleHoverStart)
        .on("mouseleave", handleHoverEnd)
        // Touch events for iOS
        .on("touchstart", (event: TouchEvent) => {
          // Mark this as a potential click
          touchWasClick = true;
          // Don't trigger hover animation on touch - wait to see if it's a click or scroll
          event.preventDefault();
        })
        .on("touchmove", () => {
          // If user moves finger, it's a scroll/pan, not a click
          touchWasClick = false;
        })
        .on("touchend", function (event: TouchEvent) {
          if (touchWasClick) {
            // This was a tap/click, trigger the click handler directly
            // Skip hover animations entirely to avoid conflicts
            event.preventDefault();
            handleClick.call(this);
            touchWasClick = false;
          }
        })
        .on("touchcancel", () => {
          touchWasClick = false;
        })
        .on("click", function () {
          // This will only fire for mouse/trackpad clicks
          // Touch devices use touchend handler which calls preventDefault()
          // preventing the click event from firing
          handleClick.call(this);
        })
        .on("keydown", function (event: KeyboardEvent) {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleClick.call(this);
          }
        });
    };

    if (shouldAnimate && sweepPath && sweepArc) {
      // Animate the sweep wedge from 0 to 2π
      sweepPath
        .transition()
        .duration(1500)
        .attrTween("d", (d) => {
          const interpolate = d3.interpolate(0, Math.PI * 2);
          return (t) => {
            d.endAngle = interpolate(t);
            return (sweepArc?.(d) as string) ?? "";
          };
        })
        .on("end", () => {
          // After sweep completes, remove clip-path and add hover interactions
          pieGroup.attr("clip-path", null);
          hasAnimatedRef.current = true;
          onAnimationComplete?.();
          setupHoverInteractions();
        });
    } else {
      // No animation, setup interactions immediately and mark animation as complete
      hasAnimatedRef.current = true;
      onAnimationComplete?.();
      setupHoverInteractions();
    }
  }, [
    pieData,
    pieRadius,
    onDomainHover,
    onAnimationComplete,
    setHoveredDomain,
    router,
    pathname,
    a11y,
  ]);

  return <g ref={pieChartRef} className="pie-chart" />;
};

// Export component without memo to ensure useSearchParams() hook re-runs when URL changes
// The memo was preventing React from re-rendering when router.push() updated the URL,
// causing useSearchParams() to return stale values and blocking state updates
export const RootNodeChart = RootNodeChartComponent;
