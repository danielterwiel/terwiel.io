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

  const a11y = useAccessibility();
  const currentSearchQuery = getSearchQuery(searchParams);

  useEffect(() => {
    if (!pieChartRef.current) return;

    // Clear hover state when recreating the pie chart
    onDomainHover?.(null);

    const svg = d3.select(pieChartRef.current);

    // Check if current search query matches a domain and store in ref
    const matchedDomain = matchesDomainName(currentSearchQuery, PROJECTS);
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
      .attr("fill", (d) => d.data.color)
      .attr("fill-opacity", 0.2)
      .attr("pointer-events", "all")
      .style("cursor", "pointer")
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
      const transitionDuration = a11y.getTransitionDuration(200);
      const hoverOffset = 8; // Distance to translate on hover

      hitAreas
        .on("mouseenter", function () {
          const datum = d3
            .select(this)
            .datum() as d3.PieArcDatum<PieSegmentData>;

          // Get the corresponding visible segment group (previous sibling)
          const visibleGroup = d3.select(
            this.previousSibling as SVGGElement,
          ) as d3.Selection<
            SVGGElement,
            d3.PieArcDatum<PieSegmentData>,
            null,
            undefined
          >;

          // Calculate centroid for smooth translation from center
          const centroid = arc.centroid(datum);
          const x = (centroid[0] / pieRadius) * hoverOffset;
          const y = (centroid[1] / pieRadius) * hoverOffset;

          // Hovered state: translate outward and reduce opacity
          visibleGroup
            .transition()
            .duration(transitionDuration)
            .attr("transform", `translate(${x}, ${y})`)
            .select("path")
            .attr("opacity", "0.85");

          // Notify parent component of domain hover
          onDomainHover?.(datum.data.domain as Domain);
          // Update local hover state for RootNodeExperience
          setHoveredDomain(datum.data.domain as Domain);
        })
        .on("mouseleave", function () {
          const datum = d3
            .select(this)
            .datum() as d3.PieArcDatum<PieSegmentData>;
          // Check if this segment's domain is selected (read from ref for current value)
          const isSelected = matchedDomainRef.current === datum.data.domain;
          // When leaving any segment, restore the selected domain if one exists
          const restoreDomain = matchedDomainRef.current
            ? (matchedDomainRef.current as Domain)
            : null;

          // Get the corresponding visible segment group (previous sibling)
          const visibleGroup = d3.select(
            this.previousSibling as SVGGElement,
          ) as d3.Selection<
            SVGGElement,
            d3.PieArcDatum<PieSegmentData>,
            null,
            undefined
          >;

          // Return to default or selected state
          visibleGroup
            .transition()
            .duration(transitionDuration)
            .attr("transform", "translate(0, 0)")
            .select("path")
            .attr("opacity", isSelected ? "1.0" : "0.6");

          // Notify parent of domain hover state (restore selected domain if exists)
          onDomainHover?.(restoreDomain);
          // Update local hover state to match
          setHoveredDomain(restoreDomain);
        })
        .on("click", function () {
          const datum = d3
            .select(this)
            .datum() as d3.PieArcDatum<PieSegmentData>;
          // Toggle URL search params with domain name
          const queryString = toggleSearchParam(
            currentSearchQuery,
            datum.data.domain,
          );
          router.push(`${pathname}${queryString}`);
        })
        .on("keydown", function (event: KeyboardEvent) {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            const datum = d3
              .select(this)
              .datum() as d3.PieArcDatum<PieSegmentData>;
            const queryString = toggleSearchParam(
              currentSearchQuery,
              datum.data.domain,
            );
            router.push(`${pathname}${queryString}`);
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
    currentSearchQuery,
    a11y,
  ]);

  return <g ref={pieChartRef} className="pie-chart" />;
}
