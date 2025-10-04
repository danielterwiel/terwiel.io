import * as d3 from "d3";

import { useEffect, useMemo, useRef } from "react";

import type { Dimensions } from "~/types/simulation";
import { DOMAIN_COLORS } from "~/constants/domain-colors";
import { PROJECTS } from "~/data/projects";
import { calculateDomainExperiences } from "~/utils/calculate-domain-size";

interface RootNodeProps {
  dimensions: Dimensions;
  nodeRef: (el: SVGGElement | null) => void;
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
export function RootNode({ dimensions, nodeRef }: RootNodeProps) {
  const pieChartRef = useRef<SVGGElement>(null);

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

  useEffect(() => {
    if (!pieChartRef.current) return;

    const svg = d3.select(pieChartRef.current);

    // Clear existing content
    svg.selectAll("*").remove();

    // Create pie layout
    const pie = d3
      .pie<PieSegmentData>()
      .value((d) => d.value)
      .sort(null); // Maintain order

    // Create arc generator
    const arc = d3
      .arc<d3.PieArcDatum<PieSegmentData>>()
      .innerRadius(0)
      .outerRadius(pieRadius);

    // Create hover arc (slightly larger)
    const hoverArc = d3
      .arc<d3.PieArcDatum<PieSegmentData>>()
      .innerRadius(0)
      .outerRadius(pieRadius * 1.05);

    // Generate pie segments
    const arcs = pie(pieData);

    // Create clip path for radar sweep animation
    const defs = svg.append("defs");
    const clipPath = defs
      .append("clipPath")
      .attr("id", `radar-sweep-${Math.random().toString(36).substr(2, 9)}`);

    const clipPathId = clipPath.attr("id");

    // Create sweep arc (a wedge that grows from 0° to 360°)
    const sweepArc = d3
      .arc()
      .innerRadius(0)
      .outerRadius(pieRadius * 1.5); // Larger than pie to ensure full coverage

    // Create the sweeping wedge path
    const sweepPath = clipPath
      .append("path")
      .datum({
        startAngle: 0,
        endAngle: 0,
        innerRadius: 0,
        outerRadius: pieRadius * 1.5,
      })
      .attr("d", sweepArc as unknown as string);

    // Create a group for all pie segments with clip-path applied
    const pieGroup = svg.append("g").attr("clip-path", `url(#${clipPathId})`);

    // Create all pie segments (fully rendered)
    const paths = pieGroup
      .selectAll("path")
      .data(arcs)
      .enter()
      .append("path")
      .attr("fill", (d) => d.data.color)
      .attr("class", "pie-segment magnetic-base magnetic-rounded-full")
      .attr("cursor", "pointer")
      .style("opacity", "0.4")
      .style("filter", "drop-shadow(0 2px 8px rgba(0, 0, 0, 0.15))")
      .attr("d", arc);

    // Title for accessibility
    paths.append("title").text((d) => {
      return `${d.data.domain}: ${d.data.percentage.toFixed(1)}%`;
    });

    // Animate the sweep wedge from 0 to 2π
    sweepPath
      .transition()
      .duration(1500)
      .attrTween("d", (d) => {
        const interpolate = d3.interpolate(0, Math.PI * 2);
        return (t) => {
          d.endAngle = interpolate(t);
          return sweepArc(d) as string;
        };
      })
      .on("end", () => {
        // After sweep completes, remove clip-path and add hover interactions
        pieGroup.attr("clip-path", null);

        // Hover interactions
        paths
          .on("mouseenter", function () {
            const datum = d3
              .select(this)
              .datum() as d3.PieArcDatum<PieSegmentData>;
            d3.select(this)
              .classed("magnetic-hover", true)
              .style("opacity", "0.7")
              .transition()
              .duration(200)
              .attr("d", hoverArc(datum) ?? "");
          })
          .on("mouseleave", function () {
            const datum = d3
              .select(this)
              .datum() as d3.PieArcDatum<PieSegmentData>;
            d3.select(this)
              .classed("magnetic-hover", false)
              .style("opacity", "0.4")
              .transition()
              .duration(200)
              .attr("d", arc(datum) ?? "");
          });
      });
  }, [pieData, pieRadius]);

  return (
    <g
      ref={nodeRef}
      className="node root-node"
      aria-label="Root node with domain distribution"
      transform={`translate(${dimensions.centerX}, ${dimensions.centerY})`}
    >
      {/* Pie chart segments */}
      <g ref={pieChartRef} className="pie-chart" />

      {/* Border circle */}
      <circle
        r={dimensions.rootRadius}
        fill="none"
        stroke="#002FA7"
        strokeWidth={0.1}
        className="magnetic-base magnetic-rounded-full"
        style={{
          animation: "borderGrow 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.4s both",
        }}
      />

      {/* Center text */}
      <text
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={dimensions.rootRadius * 0.2}
        fill="#002FA7"
        fontWeight="600"
        style={{
          animation: "fadeIn 0.4s ease-out 2s both",
          pointerEvents: "none",
        }}
      >
        Experience
      </text>

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
