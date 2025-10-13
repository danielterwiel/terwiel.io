import * as d3 from "d3";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { useEffect, useRef } from "react";

import type { Domain } from "~/types";

import { PROJECTS } from "~/data/projects";
import { useAccessibility } from "~/hooks/use-accessibility";
import { matchesDomainName } from "~/utils/get-domain-names";
import { getSearchQuery, toggleSearchParam } from "~/utils/search-params";

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
 */
export function RootNodeChart({
  pieData,
  pieRadius,
  onDomainHover,
  onAnimationComplete,
  setHoveredDomain,
}: RootNodeChartProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pieChartRef = useRef<SVGGElement>(null);
  const hasAnimatedRef = useRef(false);
  const matchedDomainRef = useRef<string | null>(null);
  const isTransitioningRef = useRef(false);

  const a11y = useAccessibility();
  const currentSearchQuery = getSearchQuery(searchParams);

  // Track selection state in refs to avoid expensive re-renders
  const currentSearchQueryRef = useRef(currentSearchQuery);
  currentSearchQueryRef.current = currentSearchQuery;

  // Update visual states without re-rendering entire chart
  useEffect(() => {
    if (!pieChartRef.current || !hasAnimatedRef.current) return;

    // Prevent double-firing on iOS Safari during router navigation
    if (isTransitioningRef.current) return;

    const matchedDomain = matchesDomainName(currentSearchQuery, PROJECTS);
    matchedDomainRef.current = matchedDomain;

    const svg = d3.select(pieChartRef.current);
    const transitionDuration = a11y.getTransitionDuration(150);

    const RING_THICKNESS = pieRadius * 0.1;
    const arc = d3
      .arc<d3.PieArcDatum<PieSegmentData>>()
      .innerRadius(pieRadius - RING_THICKNESS)
      .outerRadius(pieRadius);

    const selectedArc = d3
      .arc<d3.PieArcDatum<PieSegmentData>>()
      .innerRadius(pieRadius - RING_THICKNESS)
      .outerRadius(pieRadius + RING_THICKNESS);

    // Mark transition as in progress
    isTransitioningRef.current = true;

    // Reset any transforms and update arc shapes
    svg
      .selectAll<SVGGElement, d3.PieArcDatum<PieSegmentData>>(
        "g.segment-visual",
      )
      .attr("transform", "translate(0, 0)")
      .select<SVGPathElement>("path.pie-segment")
      .transition()
      .duration(transitionDuration)
      .attr("opacity", (d) => (matchedDomain === d.data.domain ? "1.0" : "0.6"))
      .attr("d", (d) =>
        matchedDomain === d.data.domain
          ? (selectedArc(d) ?? "")
          : (arc(d) ?? ""),
      )
      .on("end", () => {
        // Clear transition lock after animation completes
        isTransitioningRef.current = false;
      });

    // Update ARIA states
    svg
      .selectAll<SVGPathElement, d3.PieArcDatum<PieSegmentData>>(
        ".pie-segment-hit-area",
      )
      .attr("aria-pressed", (d) =>
        matchedDomain === d.data.domain ? "true" : "false",
      );
  }, [currentSearchQuery, a11y, pieRadius]);

  useEffect(() => {
    if (!pieChartRef.current) return;

    // Clear hover state when recreating the pie chart
    onDomainHover?.(null);

    const svg = d3.select(pieChartRef.current);

    // Read from ref to get latest value without retriggering effect
    const matchedDomain = matchesDomainName(
      currentSearchQueryRef.current,
      PROJECTS,
    );
    matchedDomainRef.current = matchedDomain;

    // Clear existing content
    svg.selectAll("*").remove();

    // Create pie layout
    const pie = d3
      .pie<PieSegmentData>()
      .value((d) => d.value)
      .sort(null); // Maintain order

    // Define arc states
    const RING_THICKNESS = pieRadius * 0.1; // Thickness of the ring border

    // Default arc: ring/donut style (hollow) - idle state
    const arc = d3
      .arc<d3.PieArcDatum<PieSegmentData>>()
      .innerRadius(pieRadius - RING_THICKNESS)
      .outerRadius(pieRadius);

    // Selected arc: double-thickness ring growing outward (2x the size)
    const selectedArc = d3
      .arc<d3.PieArcDatum<PieSegmentData>>()
      .innerRadius(pieRadius - RING_THICKNESS)
      .outerRadius(pieRadius + RING_THICKNESS);

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
          selected: matchedDomain === d.data.domain,
        });
        return `${baseClasses} ${stateClasses}`;
      })
      .attr("opacity", (d) => (matchedDomain === d.data.domain ? "1.0" : "0.6"))
      .attr("pointer-events", "none")
      .attr("d", (d) =>
        matchedDomain === d.data.domain
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
        return matchedDomain === d.data.domain ? "true" : "false";
      });

    // Title for hover tooltip
    hitAreas.append("title").text((d) => {
      return `${d.data.domain}: ${d.data.percentage.toFixed(1)}%`;
    });

    const setupHoverInteractions = () => {
      const transitionDuration = a11y.getTransitionDuration(150);

      // Hover arc: slightly larger than selected arc for hover effect
      const hoverArc = d3
        .arc<d3.PieArcDatum<PieSegmentData>>()
        .innerRadius(pieRadius - RING_THICKNESS)
        .outerRadius(pieRadius + RING_THICKNESS * 1.5);

      // Track if a touch is intended as a click (vs scroll/pan)
      let touchWasClick = false;

      const handleHoverStart = function (this: SVGPathElement) {
        const datum = d3.select(this).datum() as d3.PieArcDatum<PieSegmentData>;

        // Get the corresponding visible segment path
        const visiblePath = d3
          .select(this.previousSibling as SVGGElement)
          .select<SVGPathElement>("path.pie-segment");

        // Animate to hover state
        visiblePath
          .transition()
          .duration(transitionDuration)
          .attr("d", hoverArc(datum) ?? "")
          .attr("opacity", "0.85");

        // Notify parent component of domain hover
        onDomainHover?.(datum.data.domain as Domain);
        setHoveredDomain(datum.data.domain as Domain);
      };

      const handleHoverEnd = function (this: SVGPathElement) {
        const datum = d3.select(this).datum() as d3.PieArcDatum<PieSegmentData>;

        // Check if this segment's domain is selected
        const isSelected = matchedDomainRef.current === datum.data.domain;

        // When leaving any segment, restore the selected domain if one exists
        const restoreDomain = matchedDomainRef.current
          ? (matchedDomainRef.current as Domain)
          : null;

        // Get the corresponding visible segment path
        const visiblePath = d3
          .select(this.previousSibling as SVGGElement)
          .select<SVGPathElement>("path.pie-segment");

        // Animate back to default or selected state
        const targetArc = isSelected ? selectedArc : arc;
        visiblePath
          .transition()
          .duration(transitionDuration)
          .attr("d", targetArc(datum) ?? "")
          .attr("opacity", isSelected ? "1.0" : "0.6");

        // Notify parent of domain hover state (restore selected domain if exists)
        onDomainHover?.(restoreDomain);
        setHoveredDomain(restoreDomain);
      };

      const handleClick = function (this: SVGPathElement) {
        const datum = d3.select(this).datum() as d3.PieArcDatum<PieSegmentData>;

        // Get the corresponding visible segment path
        const visiblePath = d3
          .select(this.previousSibling as SVGGElement)
          .select<SVGPathElement>("path.pie-segment");

        // Immediately interrupt any ongoing transitions to prevent conflicts
        visiblePath.interrupt();

        // Pre-emptively update the matched domain ref to prevent race conditions
        const willBeSelected = matchedDomainRef.current !== datum.data.domain;
        if (willBeSelected) {
          matchedDomainRef.current = datum.data.domain;
        } else {
          matchedDomainRef.current = null;
        }

        const queryString = toggleSearchParam(
          currentSearchQueryRef.current,
          datum.data.domain,
        );
        router.push(`${pathname}${queryString}`);
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
      // No animation, setup interactions immediately and turn off animation state
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
}
