import * as d3 from "d3";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { useEffect, useMemo, useRef, useState } from "react";

import type { Domain } from "~/data/projects";
import type { Dimensions } from "~/types/simulation";
import { DOMAIN_COLORS, KLEIN_BLUE } from "~/constants/colors";
import { PROJECTS } from "~/data/projects";
import { calculateDomainExperiences } from "~/utils/calculate-domain-size";
import { matchesDomainName } from "~/utils/get-domain-names";
import { getSearchQuery, toggleSearchParam } from "~/utils/search-params";
import { RootNodeExperience } from "./root-node-experience";

interface RootNodeProps {
  dimensions: Dimensions;
  nodeRef: (el: SVGGElement | null) => void;
  onDomainHover?: (domain: Domain | null) => void;
  hoveredStack?: {
    id: string;
    name: string;
    iconKey: string;
    color: string;
    domain: Domain;
  } | null;
  isActiveHover?: boolean;
}

interface PieSegmentData {
  domain: string;
  value: number;
  color: string;
  percentage: number;
}

/**
 * Root node component for the stack visualization
 * Displays the centered "root" node with a domain pie chart using d3
 */
export function RootNode({
  dimensions,
  nodeRef,
  onDomainHover,
  hoveredStack,
  isActiveHover = false,
}: RootNodeProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pieChartRef = useRef<SVGGElement>(null);
  const hasAnimatedRef = useRef(false);
  const matchedDomainRef = useRef<string | null>(null);
  const [hoveredDomain, setHoveredDomain] = useState<Domain | null>(null);

  const currentSearchQuery = getSearchQuery(searchParams);

  const domainExperiences = useMemo(
    () => calculateDomainExperiences(PROJECTS),
    [],
  );

  // Prepare data for d3 pie chart
  const pieData: PieSegmentData[] = useMemo(
    () =>
      domainExperiences.map((exp) => ({
        domain: exp.domain,
        value: exp.percentage,
        color: DOMAIN_COLORS[exp.domain],
        percentage: exp.percentage,
      })),
    [domainExperiences],
  );

  const pieRadius = dimensions.rootRadius * 0.75; // 75% of root radius

  // Set initial hovered domain based on selected domain in search params
  useEffect(() => {
    const matchedDomain = matchesDomainName(currentSearchQuery, PROJECTS);
    setHoveredDomain(matchedDomain);
  }, [currentSearchQuery]);

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

    // Define arc states for smooth transitions
    const RING_THICKNESS = pieRadius * 0.15; // Thickness of the ring border

    // Default arc: ring/donut style (hollow)
    const arc = d3
      .arc<d3.PieArcDatum<PieSegmentData>>()
      .innerRadius(pieRadius - RING_THICKNESS)
      .outerRadius(pieRadius);

    // Hover arc: ring grows outward (1.75x thicker)
    const hoverArc = d3
      .arc<d3.PieArcDatum<PieSegmentData>>()
      .innerRadius(pieRadius - RING_THICKNESS)
      .outerRadius(pieRadius + RING_THICKNESS * 0.75);

    // Selected arc: filled from center
    const selectedArc = d3
      .arc<d3.PieArcDatum<PieSegmentData>>()
      .innerRadius(0)
      .outerRadius(pieRadius);

    // Generate pie segments
    const arcs = pie(pieData);

    // Determine if we should animate (only on first render)
    const shouldAnimate = !hasAnimatedRef.current;

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

    // Create all pie segments (fully rendered)
    const paths = pieGroup
      .selectAll("path")
      .data(arcs)
      .enter()
      .append("path")
      .attr("fill", (d) => d.data.color)
      .attr("class", "pie-segment magnetic-base magnetic-rounded-full")
      .attr("cursor", "pointer")
      .style("opacity", (d) => (matchedDomain === d.data.domain ? "0" : "1.0"))
      .style("filter", "drop-shadow(0 2px 8px rgba(0, 0, 0, 0.15))")
      .attr("d", (d) =>
        matchedDomain === d.data.domain
          ? (selectedArc(d) ?? "")
          : (arc(d) ?? ""),
      );

    // Title for accessibility
    paths.append("title").text((d) => {
      return `${d.data.domain}: ${d.data.percentage.toFixed(1)}%`;
    });

    const setupHoverInteractions = () => {
      paths
        .on("mouseenter", function () {
          const datum = d3
            .select(this)
            .datum() as d3.PieArcDatum<PieSegmentData>;
          const isSelected = matchedDomainRef.current === datum.data.domain;
          const targetArc = isSelected ? selectedArc : hoverArc;

          d3.select(this)
            .transition()
            .duration(200)
            .ease(d3.easeCubicOut)
            .style("opacity", isSelected ? "0.5" : "0.7")
            .attrTween("d", function () {
              const interpolate = d3.interpolate(
                d3.select(this).attr("d"),
                targetArc(datum) ?? "",
              );
              return (t) => interpolate(t);
            });
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
          const targetArc = isSelected ? selectedArc : arc;

          d3.select(this)
            .transition()
            .duration(200)
            .ease(d3.easeCubicOut)
            .style("opacity", isSelected ? "0" : "1.0")
            .attrTween("d", function () {
              const interpolate = d3.interpolate(
                d3.select(this).attr("d"),
                targetArc(datum) ?? "",
              );
              return (t) => interpolate(t);
            });
          // Clear domain hover
          onDomainHover?.(null);
          // Clear local hover state, but keep selected domain if exists
          setHoveredDomain(isSelected ? (datum.data.domain as Domain) : null);
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
          setupHoverInteractions();
        });
    } else {
      // No animation, setup interactions immediately
      setupHoverInteractions();
    }
  }, [pieData, pieRadius, onDomainHover, router, pathname, currentSearchQuery]);

  return (
    <g
      ref={nodeRef}
      aria-label="Root node with domain distribution"
      transform={`translate(${dimensions.centerX}, ${dimensions.centerY})`}
    >
      {/* Pie chart segments */}
      <g ref={pieChartRef} className="pie-chart" />

      {/* Border circle */}
      <circle
        r={dimensions.rootRadius}
        fill="none"
        stroke={KLEIN_BLUE}
        strokeWidth={0.1}
        className="magnetic-base magnetic-rounded-full"
        style={{
          animation: "borderGrow 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.4s both",
        }}
      />

      {/* Center experience display */}
      <RootNodeExperience
        dimensions={dimensions}
        hoveredStack={hoveredStack}
        hoveredDomain={hoveredDomain}
        isActiveHover={isActiveHover}
      />

      <style jsx>{`
        @keyframes borderGrow {
          from {
            r: 0;
            opacity: 0;
          }
          to {
            r: ${dimensions.rootRadius};
            opacity: 1;
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        /* Respect reduced motion */
        @media (prefers-reduced-motion: reduce) {
          :global(.pie-segment),
          circle,
          text {
            animation: none !important;
            opacity: 0.7;
          }
          circle {
            opacity: 1;
          }
          text {
            opacity: 1;
          }
        }
      `}</style>
    </g>
  );
}
