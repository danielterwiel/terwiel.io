"use client";

import * as d3 from "d3";
import { createRoot } from "react-dom/client";

import type React from "react";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { Icon } from "~/components/icon";
import { PROJECTS, type Project } from "~/data/projects";
import { ICON_COLORS } from "~/consts/icon-colors";
import {
  calculateStackExperience,
  calculateExperienceScale,
} from "~/utils/calculate-experience";

type IconNode = {
  id: string;
  name: string;
  icon: string;
  url: string;
  r: number;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
  vx?: number;
  vy?: number;
  group: number;
  isHovered?: boolean;
};

function extractUniqueIcons(
  projects: Project[],
  width: number,
  height: number,
): IconNode[] {
  const iconMap = new Map<string, IconNode>();
  let idCounter = 0;

  // Calculate experience for all stack items
  const stackExperience = calculateStackExperience(projects);

  // Create a map for quick experience lookup by stack name
  const experienceMap = new Map(stackExperience.map((exp) => [exp.name, exp]));

  // Extract stack icons
  projects.forEach((project) => {
    project.stack.forEach((stackItem) => {
      if (!iconMap.has(stackItem.icon)) {
        // Get experience for this stack item
        const experience = experienceMap.get(stackItem.name);

        // Calculate dynamic radius based on experience
        // Base radius is 35, max is 70 (2x), min stays at 35
        const baseRadius = 35;
        const dynamicRadius = experience
          ? calculateExperienceScale(experience.totalMonths, stackExperience, {
              minScale: 1.0,
              maxScale: 2.0,
              baseRadius,
            })
          : baseRadius;

        iconMap.set(stackItem.icon, {
          id: `stack-${idCounter++}`,
          name: stackItem.name,
          icon: stackItem.icon,
          url: stackItem.url,
          r: dynamicRadius,
          group: 1, // Stack icons
        });
      }
    });
  });

  const nodes = Array.from(iconMap.values());

  // Pre-position nodes in a grid pattern to prevent initial overlapping
  const cols = Math.ceil(Math.sqrt(nodes.length));
  const spacing = Math.min(width / cols, height / cols) * 0.8;
  const startX = (width - (cols - 1) * spacing) / 2;
  const startY = (height - Math.ceil(nodes.length / cols - 1) * spacing) / 2;

  nodes.forEach((node, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    node.x = startX + col * spacing;
    node.y = startY + row * spacing;
  });

  return nodes;
}

export const IconCloud: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const simulationRef = useRef<d3.Simulation<IconNode, undefined> | null>(null);
  const [isAnimationReady, setIsAnimationReady] = useState(false);
  const router = useRouter();

  // Fixed dimensions for viewBox - will scale responsively
  const width = 800;
  const height = 600;

  const initializeSimulation = useCallback(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const nodes = extractUniqueIcons(PROJECTS, width, height);

    // Stop previous simulation if it exists
    if (simulationRef.current) {
      simulationRef.current.stop();
    }

    // Create force simulation with gentler initial forces
    const simulation = d3
      .forceSimulation<IconNode>(nodes)
      .force("charge", d3.forceManyBody().strength(15)) // Reduced from 30
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force(
        "collision",
        d3.forceCollide<IconNode>().radius((d) => d.r + 15), // Dynamic padding based on node size
      )
      .force("x", d3.forceX(width / 2).strength(0.05)) // Reduced from 0.1
      .force("y", d3.forceY(height / 2).strength(0.05)) // Reduced from 0.1
      .alpha(0.3) // Start with lower energy
      .alphaDecay(0.02); // Slower decay for smoother animation

    simulationRef.current = simulation;

    // Create container for nodes
    const nodeContainer = svg.append("g").attr("class", "nodes");

    // Create node groups
    const nodeGroups = nodeContainer
      .selectAll<SVGGElement, IconNode>("g")
      .data(nodes)
      .enter()
      .append("g")
      .attr("class", "node")
      .style("cursor", "pointer")
      .call(
        d3
          .drag<SVGGElement, IconNode>()
          .on("start", (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
            // Bring dragged element to front
            const targetElement = event.sourceEvent?.target?.parentNode;
            if (targetElement && targetElement instanceof Element) {
              d3.select(targetElement).style("z-index", "9999").raise();
            }
          })
          .on("drag", (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on("end", (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
            // Reset z-index after dragging
            const targetElement = event.sourceEvent?.target?.parentNode;
            if (targetElement && targetElement instanceof Element) {
              d3.select(targetElement).style("z-index", "auto");
            }
          }),
      );

    // Add circles (bubbles)
    nodeGroups
      .append("circle")
      .attr("r", (d) => d.r)
      .attr("fill", "transparent")
      .attr("stroke", "#e5e7eb")
      .attr("stroke-width", 2);

    // Add hover effects
    nodeGroups
      .on("mouseenter", function (_event, d) {
        // Lock the node position
        d.fx = d.x;
        d.fy = d.y;
        d.isHovered = true;

        // Add gentle repulsion force to push other nodes away smoothly
        simulation
          .force(
            "collision",
            d3
              .forceCollide<IconNode>()
              .radius((node) => {
                const baseRadius = node.r + 15;
                // If this is the hovered node, use a moderate expanded radius
                if (node === d) return baseRadius * 1.4;
                // For other nodes, check if they're close to the hovered node
                const dx = (node.x || 0) - (d.x || 0);
                const dy = (node.y || 0) - (d.y || 0);
                const distance = Math.sqrt(dx * dx + dy * dy);
                // If close to hovered node, slightly increase their effective radius for collision
                return distance < baseRadius * 2.5
                  ? baseRadius * 1.2
                  : baseRadius;
              })
              .strength(0.7)
              .iterations(2),
          )
          .alphaTarget(0.15)
          .restart();

        // Change icon color and scale on hover with individual state management
        const foreignObject = d3.select(this).select("foreignObject");
        const iconContainer = foreignObject.select("div").node() as HTMLElement;
        if (iconContainer) {
          const iconElement = iconContainer.querySelector("svg");
          if (iconElement) {
            // Create a unique transition key for this specific icon
            const transitionKey = `hover-${d.id}`;

            // Get color values for smooth interpolation
            const iconColor = ICON_COLORS[d.icon as keyof typeof ICON_COLORS];
            const defaultColor = "#6b7280"; // text-gray-500 equivalent
            const hoverColor = iconColor
              ? iconColor.replace("text-[", "").replace("]", "")
              : defaultColor;

            // Apply hover styles with smooth color interpolation
            d3.select(iconElement)
              .interrupt(transitionKey) // Cancel any ongoing transitions for this icon
              .transition(transitionKey)
              .duration(300)
              .ease(d3.easeCubicInOut)
              .styleTween("color", function () {
                const interpolateColor = d3.interpolate(
                  defaultColor,
                  hoverColor,
                );
                return function (t) {
                  return interpolateColor(t);
                };
              })
              .styleTween("transform", function () {
                const interpolateScale = d3.interpolate(1, 1.5);
                return function (t) {
                  return `scale(${interpolateScale(t)})`;
                };
              });
          }
        }

        // Bring to front
        d3.select(this).raise();
      })
      .on("mouseleave", function (_event, d) {
        // Unlock the node position
        d.fx = null;
        d.fy = null;
        d.isHovered = false;

        // Reset collision force to normal
        simulation
          .force(
            "collision",
            d3.forceCollide<IconNode>().radius((node) => node.r + 15),
          )
          .alphaTarget(0);

        // Reset icon color and scale on mouse leave with individual state management
        const foreignObject = d3.select(this).select("foreignObject");
        const iconContainer = foreignObject.select("div").node() as HTMLElement;
        if (iconContainer) {
          const iconElement = iconContainer.querySelector("svg");
          if (iconElement) {
            // Create a unique transition key for this specific icon
            const transitionKey = `unhover-${d.id}`;

            // Get color values for smooth interpolation back to default
            const iconColor = ICON_COLORS[d.icon as keyof typeof ICON_COLORS];
            const defaultColor = "#6b7280"; // text-gray-500 equivalent
            const hoverColor = iconColor
              ? iconColor.replace("text-[", "").replace("]", "")
              : defaultColor;

            // Apply default styles with smooth color interpolation back to default
            d3.select(iconElement)
              .interrupt(`hover-${d.id}`) // Cancel any ongoing hover transitions
              .interrupt(transitionKey) // Cancel any ongoing unhover transitions
              .transition(transitionKey)
              .duration(300)
              .ease(d3.easeCubicInOut)
              .styleTween("color", function () {
                const interpolateColor = d3.interpolate(
                  hoverColor,
                  defaultColor,
                );
                return function (t) {
                  return interpolateColor(t);
                };
              })
              .styleTween("transform", function () {
                const interpolateScale = d3.interpolate(1.3, 1);
                return function (t) {
                  return `scale(${interpolateScale(t)})`;
                };
              });
          }
        }
      });

    // Add click handlers
    nodeGroups.on("click", (_event, d) => {
      if (d.url.startsWith('http') || d.url.startsWith('//')) {
        // External links - open in new tab
        window.open(d.url, '_blank', 'noopener,noreferrer');
      } else {
        // Internal links - use Next.js router for SPA navigation
        router.push(d.url);
      }
    });

    // Mouse interaction for attraction
    svg.on("mousemove", (event) => {
      const [mouseX, mouseY] = d3.pointer(event);

      // Add a temporary attractive force towards mouse with smooth transition
      simulation
        .force("mouse", d3.forceX(mouseX).strength(0.03))
        .force("mouse-y", d3.forceY(mouseY).strength(0.03))
        .alphaTarget(0.05)
        .restart();
    });

    svg.on("mouseleave", () => {
      // Remove mouse forces when mouse leaves
      simulation.force("mouse", null).force("mouse-y", null).alphaTarget(0);
    });

    // Update positions on tick with smooth transitions
    simulation.on("tick", () => {
      nodeGroups
        .transition()
        .duration(isAnimationReady ? 100 : 0) // Smoother transition duration
        .ease(d3.easeCubicInOut) // Best easing for smooth visual animation
        .attr("transform", (d) => {
          const containerScale = d.isHovered ? 1.5 : 1;
          return `translate(${d.x},${d.y}) scale(${containerScale})`;
        });
    });

    // Enable smooth animations after initial positioning
    simulation.on("end", () => {
      setIsAnimationReady(true);
    });

    // Use foreignObject to embed React icons
    const foreignObjects = nodeGroups
      .append("foreignObject")
      .attr("width", (d) => d.r * 2)
      .attr("height", (d) => d.r * 2)
      .attr("x", (d) => -d.r)
      .attr("y", (d) => -d.r);

    // Create div containers for React components
    const iconContainers = foreignObjects
      .append("xhtml:div")
      .attr(
        "class",
        "w-full h-full flex items-center justify-center pointer-events-none m-0 p-0 box-border relative overflow-hidden",
      );

    // Render React icons into each container
    iconContainers.each(function (d) {
      const IconComponent = Icon[d.icon as keyof typeof Icon];

      if (IconComponent) {
        const root = createRoot(this as Element);
        const iconColor = ICON_COLORS[d.icon as keyof typeof ICON_COLORS];
        const defaultClass =
          "text-gray-800 dark:text-gray-400 drop-shadow-sm scale-100 transition-all duration-300 ease-in-out";
        const hoverClass = iconColor
          ? `${iconColor} drop-shadow-sm scale-150 transition-all duration-300 ease-in-out`
          : "text-gray-800 dark:text-gray-400 drop-shadow-sm scale-150 transition-all duration-300 ease-in-out";

        // Store classes for hover state management
        const element = this as HTMLElement;
        element.setAttribute("data-default-class", defaultClass);
        element.setAttribute("data-hover-class", hoverClass);

        root.render(
          <div className="flex items-center justify-center w-full h-full absolute top-0 left-0">
            <IconComponent
              width={d.r * 1.0}
              height={d.r * 1.0}
              className={`${defaultClass} block m-auto`}
              ref={(svgElement: SVGSVGElement | null) => {
                if (svgElement) {
                  // Auto-center the icon based on its geometric bounds
                  setTimeout(() => {
                    try {
                      const vb = svgElement.viewBox.baseVal;
                      if (!vb || !vb.width) {
                        // Set default viewBox if none exists
                        svgElement.setAttribute("viewBox", "0 0 24 24");
                        svgElement.setAttribute(
                          "preserveAspectRatio",
                          "xMidYMid",
                        );
                        return;
                      }

                      const cx = vb.x + vb.width / 2;
                      const cy = vb.y + vb.height / 2;
                      const bb = svgElement.getBBox();
                      const dx = cx - (bb.x + bb.width / 2);
                      const dy = cy - (bb.y + bb.height / 2);

                      // Apply optical centering adjustments for specific icons
                      let opticalDx = dx;
                      let opticalDy = dy;

                      // Add icon-specific optical adjustments
                      const iconName = d.icon.toLowerCase();
                      if (iconName.includes("vercel")) opticalDy -= 0.5;
                      if (
                        iconName.includes("x") ||
                        iconName.includes("twitter")
                      )
                        opticalDx -= 0.3;
                      if (
                        iconName.includes("triangle") ||
                        iconName.includes("arrow")
                      )
                        opticalDy -= 0.5;

                      // Apply the correction transform
                      if (
                        Math.abs(opticalDx) > 0.1 ||
                        Math.abs(opticalDy) > 0.1
                      ) {
                        svgElement.style.transform = `translate(${opticalDx}px, ${opticalDy}px)`;
                      }

                      svgElement.setAttribute(
                        "preserveAspectRatio",
                        "xMidYMid",
                      );
                    } catch (error) {
                      console.warn("Error auto-centering icon:", d.icon, error);
                    }
                  }, 0);
                }
              }}
            />
          </div>,
        );
      }
    });
  }, []);

  useLayoutEffect(() => {
    // Small delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      initializeSimulation();
    }, 10);

    return () => {
      clearTimeout(timeoutId);
      if (simulationRef.current) {
        simulationRef.current.stop();
      }
    };
  }, [initializeSimulation]);

  return (
    <div className="w-full max-w-4xl mx-auto my-8 px-4 overflow-visible">
      <div className="relative w-full overflow-visible pb-[75%]">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="xMidYMid meet"
          className="absolute inset-0 w-full h-full overflow-visible"
          style={{
            background: "transparent",
            overflow: "visible",
            zIndex: 50,
            opacity: isAnimationReady ? 1 : 0.7, // Fade in effect
            transition: "opacity 0.3s ease-in-out",
          }}
        />
      </div>
    </div>
  );
};
