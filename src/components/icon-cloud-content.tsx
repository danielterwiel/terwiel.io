"use client";

import clsx from "clsx";
import * as d3 from "d3";
import { useRouter, useSearchParams } from "next/navigation";
import { createRoot } from "react-dom/client";

import type React from "react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import type { IconNode } from "../types/icon-node";
import { Icon } from "~/components/icon";
import { StackItemExperience } from "~/components/stack-item-experience";
import { PROJECTS } from "~/data/projects";
import { extractUniqueIcons } from "~/utils/extract-unique-icons";
import { getIconHexColor, getMagneticClasses } from "~/utils/icon-colors";
import {
  getIconClasses,
  getIconTargetColor,
  type NodeState,
  updateNodeDOMClasses,
} from "~/utils/node-styling";

function getScaleFactor(scaleLevel: number): number {
  return 1.0 + ((scaleLevel - 1) / 9) * 2.0;
}

export const IconCloudContent: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const svgRef = useRef<SVGSVGElement>(null);
  const simulationRef = useRef<d3.Simulation<IconNode, undefined> | null>(null);
  const nodesRef = useRef<IconNode[]>([]);
  const selectedNodeRef = useRef<IconNode | null>(null);
  const [isAnimationReady, setIsAnimationReady] = useState(false);
  const [hoveredNode, setHoveredNode] = useState<IconNode | null>(null);
  const [selectedNode, setSelectedNode] = useState<IconNode | null>(null);

  // Fixed dimensions for viewBox - will scale responsively
  const width = 800;
  const height = 600;

  const updateUrl = useCallback(
    (nodeName: string) => {
      const url = new URL(window.location.href);
      url.searchParams.set("search", encodeURIComponent(nodeName));
      router.replace(url.toString(), { scroll: false });
    },
    [router],
  );

  // Helper function to smoothly update collision force radius
  const updateCollisionForce = useCallback(
    (hoveredNode: IconNode | null, selectedNode: IconNode | null) => {
      if (!simulationRef.current) return;

      // Create a gentle radius function that gradually expands around hovered/selected nodes
      const radiusFunction = (node: IconNode) => {
        const baseRadius = node.r + 12;
        const minRadius = Math.max(baseRadius, 50);

        // If this is the hovered node, give it more space but less aggressive
        if (hoveredNode && node.id === hoveredNode.id) {
          return Math.max(baseRadius * 1.4, 75); // Much gentler expansion for hovered
        }

        // If this is the selected node (and not hovered), give it subtle space
        if (
          selectedNode &&
          node.id === selectedNode.id &&
          (!hoveredNode || node.id !== hoveredNode.id)
        ) {
          return Math.max(baseRadius * 1.2, 60); // Very subtle space for selected
        }

        // For other nodes, check distance to hovered/selected nodes
        const activeNode = hoveredNode || selectedNode;
        if (activeNode && activeNode.id !== node.id) {
          const dx = (node.x || 0) - (activeNode.x || 0);
          const dy = (node.y || 0) - (activeNode.y || 0);
          const distance = Math.sqrt(dx * dx + dy * dy);

          // Very gradual influence with larger radius for smoother transitions
          const influenceRadius = hoveredNode ? 200 : 160; // Larger influence area
          const influenceFactor = Math.max(0, 1 - distance / influenceRadius);
          const expansionMultiplier = hoveredNode ? 1.08 : 1.05; // Much gentler expansion

          return Math.max(
            baseRadius * (1 + influenceFactor * (expansionMultiplier - 1)),
            minRadius,
          );
        }

        return minRadius;
      };

      // Update collision force with very gentle transition
      simulationRef.current
        .force(
          "collision",
          d3
            .forceCollide<IconNode>()
            .radius(radiusFunction)
            .strength(0.3) // Much gentler strength for calmer movement
            .iterations(1), // Fewer iterations for more natural, less rigid behavior
        )
        .alphaTarget(0.02) // Ultra-low energy for very calm, slow movement
        .restart();

      // Very gradually reduce alpha target for ultra-smooth settling
      setTimeout(() => {
        if (simulationRef.current) {
          simulationRef.current.alphaTarget(0.008);
        }
      }, 1200);

      setTimeout(() => {
        if (simulationRef.current) {
          simulationRef.current.alphaTarget(0.003);
        }
      }, 3000);

      setTimeout(() => {
        if (simulationRef.current) {
          simulationRef.current.alphaTarget(0);
        }
      }, 5000);
    },
    [],
  );

  // Helper function to update node visual styling without full rerender
  const updateNodeVisualStyling = useCallback(
    (targetNode: IconNode, isSelected: boolean) => {
      if (!svgRef.current) return;

      const svg = d3.select(svgRef.current);
      const nodeGroups = svg.selectAll<SVGGElement, IconNode>("g.node");

      nodeGroups.each(function (d) {
        const foreignObject = d3.select(this).select("foreignObject");
        const outerContainer = foreignObject
          .select("div")
          .node() as HTMLElement;

        if (outerContainer) {
          const shouldBeSelected = d.id === targetNode.id && isSelected;
          const nodeState: NodeState = {
            isHovered: d.isHovered || false,
            isSelected: shouldBeSelected,
            isActive: false,
          };

          // Update DOM classes using utility function
          updateNodeDOMClasses(outerContainer, d, nodeState);

          // Update icon color with smooth transition
          const iconElement = outerContainer.querySelector("svg");
          if (iconElement) {
            const targetColor = getIconTargetColor(d, nodeState);
            d3.select(iconElement)
              .interrupt() // Cancel any ongoing transitions
              .transition()
              .duration(300)
              .ease(d3.easeCubicInOut)
              .style("color", targetColor);
          }
        }
      });
    },
    [],
  );

  useEffect(() => {
    const currentSearchQuery = searchParams.get("search");

    if (currentSearchQuery && nodesRef.current.length > 0) {
      const decodedSearch =
        decodeURIComponent(currentSearchQuery).toLowerCase();
      const foundNode = nodesRef.current.find(
        (node) => node.name.toLowerCase() === decodedSearch,
      );

      if (foundNode) {
        // Clear previous selection styling if different node
        if (selectedNode && selectedNode.id !== foundNode.id) {
          updateNodeVisualStyling(selectedNode, false);
        }

        // Update state and ref
        selectedNodeRef.current = foundNode;
        setSelectedNode(foundNode);

        // Apply visual styling to new selection
        setTimeout(() => {
          updateNodeVisualStyling(foundNode, true);
          // Update collision force for the newly selected node
          updateCollisionForce(hoveredNode, foundNode);
        }, 0);
      }
    } else if (!currentSearchQuery) {
      // Clear selection when no search query
      if (selectedNode) {
        // Remove visual styling from previously selected node
        setTimeout(() => {
          updateNodeVisualStyling(selectedNode, false);
          // Update collision force to reflect cleared selection
          updateCollisionForce(hoveredNode, null);
        }, 0);
      }

      selectedNodeRef.current = null;
      setSelectedNode(null);
    }
  }, [
    searchParams,
    updateNodeVisualStyling,
    hoveredNode,
    updateCollisionForce,
    selectedNode,
  ]);

  // Effect to update collision forces when hover/select state changes
  useEffect(() => {
    if (simulationRef.current && nodesRef.current.length > 0) {
      updateCollisionForce(hoveredNode, selectedNode);
    }
  }, [hoveredNode, selectedNode, updateCollisionForce]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: Intentionally empty deps to run simulation setup only once
  useLayoutEffect(() => {
    // Small delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      if (!svgRef.current) return;

      const svg = d3.select(svgRef.current);
      svg.selectAll("*").remove();

      const nodes = extractUniqueIcons(PROJECTS, width, height);
      nodesRef.current = nodes;

      // Stop previous simulation if it exists
      if (simulationRef.current) {
        simulationRef.current.stop();
      }

      // Create force simulation with ultra-gentle forces for very calm behavior
      const simulation = d3
        .forceSimulation<IconNode>(nodes)
        .force("charge", d3.forceManyBody().strength(3)) // Much more reduced for ultra-calm movement
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force(
          "collision",
          d3
            .forceCollide<IconNode>()
            .radius((d) => Math.max(d.r + 12, 50))
            .strength(0.3) // Much gentler collision strength
            .iterations(1), // Fewer iterations for more organic movement
        )
        .force("x", d3.forceX(width / 2).strength(0.008)) // Ultra-gentle centering
        .force("y", d3.forceY(height / 2).strength(0.008)) // Ultra-gentle centering
        .alpha(0.1) // Start with very low energy
        .alphaDecay(0.005) // Extremely slow decay for calm settling
        .velocityDecay(0.6); // Higher velocity decay for calmer movement

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
              if (!event.active) simulation.alphaTarget(0.15).restart(); // Gentler drag activation
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

      // Circles removed - using water droplet effect instead

      // Add hover effects
      nodeGroups
        .on("mouseenter", function (_event, d) {
          // Lock the node position
          d.fx = d.x;
          d.fy = d.y;
          d.isHovered = true;

          // Set hovered node for text display
          setHoveredNode(d);

          // Update collision force for smooth node spacing
          updateCollisionForce(d, selectedNode);

          // Update node styling for hover state
          const foreignObject = d3.select(this).select("foreignObject");
          const outerContainer = foreignObject
            .select("div")
            .node() as HTMLElement;

          if (outerContainer) {
            const currentSearchQuery = searchParams.get("search");
            const isSelected =
              currentSearchQuery &&
              decodeURIComponent(currentSearchQuery).toLowerCase() ===
                d.name.toLowerCase();
            const nodeState: NodeState = {
              isHovered: true,
              isSelected: Boolean(isSelected),
              isActive: false,
            };

            updateNodeDOMClasses(outerContainer, d, nodeState);

            const iconElement = outerContainer.querySelector("svg");
            if (iconElement) {
              const targetColor = getIconTargetColor(d, nodeState);
              const transitionKey = `hover-${d.id}`;

              d3.select(iconElement)
                .interrupt(transitionKey) // Cancel any ongoing transitions for this icon
                .transition(transitionKey)
                .duration(450)
                .ease(d3.easeQuadOut)
                .style("color", targetColor);
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

          // Clear hovered node for text display
          setHoveredNode(null);

          // Reset collision force to normal state
          updateCollisionForce(null, selectedNode);

          // Update node styling to preserve selected state while removing hover
          const foreignObject = d3.select(this).select("foreignObject");
          const outerContainer = foreignObject
            .select("div")
            .node() as HTMLElement;

          if (outerContainer) {
            const currentSearchQuery = searchParams.get("search");
            const isSelected =
              currentSearchQuery &&
              decodeURIComponent(currentSearchQuery).toLowerCase() ===
                d.name.toLowerCase();
            const nodeState: NodeState = {
              isHovered: false,
              isSelected: Boolean(isSelected),
              isActive: false,
            };

            // Update DOM classes using utility function
            updateNodeDOMClasses(outerContainer, d, nodeState);

            // Update icon color with smooth transition
            const iconElement = outerContainer.querySelector("svg");
            if (iconElement) {
              const targetColor = getIconTargetColor(d, nodeState);
              const transitionKey = `unhover-${d.id}`;

              d3.select(iconElement)
                .interrupt(`hover-${d.id}`) // Cancel any ongoing hover transitions
                .interrupt(transitionKey) // Cancel any ongoing unhover transitions
                .transition(transitionKey)
                .duration(450)
                .ease(d3.easeQuadOut)
                .style("color", targetColor);
            }
          }
        });

      // Add click handlers
      nodeGroups.on("click", (_event, d) => {
        // Only update URL - let useEffect handle all state updates and visual styling
        // This makes URLSearchParams the single source of truth
        updateUrl(d.name);

        if (d.url.startsWith("http") || d.url.startsWith("//")) {
          // External links - open in new tab
          window.open(d.url, "_blank", "noopener,noreferrer");
        }
        // Note: For internal links, we just update the search params rather than navigating
        // This allows the user to stay on the current page while selecting stack items
      });

      // Mouse interaction for attraction
      svg.on("mousemove", (event) => {
        const [mouseX, mouseY] = d3.pointer(event);

        // Add an ultra-gentle attractive force towards mouse
        simulation
          .force("mouse", d3.forceX(mouseX).strength(0.003)) // Ultra-subtle attraction
          .force("mouse-y", d3.forceY(mouseY).strength(0.003)) // Ultra-subtle attraction
          .alphaTarget(0.008) // Very low energy for ultra-calm movement
          .restart();
      });

      svg.on("mouseleave", () => {
        // Remove mouse forces when mouse leaves
        simulation.force("mouse", null).force("mouse-y", null).alphaTarget(0);
      });

      // Update positions on tick with very smooth transitions
      simulation.on("tick", () => {
        nodeGroups
          .transition()
          .duration(isAnimationReady ? 200 : 0) // Longer transition duration for smoother movement
          .ease(d3.easeQuadOut) // Gentler easing for calmer visual animation
          .attr("transform", (d) => {
            // Remove container scaling to avoid double scaling with icon scaling
            return `translate(${d.x},${d.y})`;
          });
      });

      // Enable smooth animations after initial positioning
      simulation.on("end", () => {
        setIsAnimationReady(true);
      });

      // Use foreignObject to embed React icons with scale classes for consistent sizing
      const foreignObjects = nodeGroups
        .append("foreignObject")
        .attr("width", (d) => {
          // Calculate size based on scale level to match CSS classes
          const scaleFactor = getScaleFactor(d.scaleLevel);
          return Math.max(35 * scaleFactor * 2.8, 120);
        })
        .attr("height", (d) => {
          const scaleFactor = getScaleFactor(d.scaleLevel);
          return Math.max(35 * scaleFactor * 2.8, 120);
        })
        .attr("x", (d) => {
          const scaleFactor = getScaleFactor(d.scaleLevel);
          return -Math.max(35 * scaleFactor * 1.4, 60);
        })
        .attr("y", (d) => {
          const scaleFactor = getScaleFactor(d.scaleLevel);
          return -Math.max(35 * scaleFactor * 1.4, 60);
        })
        .attr("class", (d) => `node-scale-${d.scaleLevel}`);

      // Create outer containers for React components with node-container class for scaling
      const outerContainers = foreignObjects
        .append("xhtml:div")
        .attr(
          "class",
          clsx(
            "node-container flex items-center justify-center",
            "pointer-events-none relative",
          ),
        );

      // Create magnetic inner containers with node-magnetic class for scaling
      const magneticContainers = outerContainers
        .append("xhtml:div")
        .attr("class", (d) => {
          // Check if this node should be selected from URL
          const searchQuery = searchParams.get("search");
          const isSelectedFromUrl =
            searchQuery &&
            decodeURIComponent(searchQuery).toLowerCase() ===
              d.name.toLowerCase();

          return clsx(
            getMagneticClasses(undefined, {
              component: "node",
              withRing: true, // Explicitly enable ring for nodes
              variant: isSelectedFromUrl ? "selected" : "base",
            }),
            "node-magnetic flex items-center justify-center",
          );
        });

      // Render React icons into each magnetic container
      magneticContainers.each(function (d) {
        const IconComponent = Icon[d.icon as keyof typeof Icon];

        if (IconComponent) {
          const root = createRoot(this as Element);
          const iconHexColor = getIconHexColor(d.icon);

          // Determine initial state based on selection
          const searchQuery = searchParams.get("search");
          const isSelectedFromUrl =
            searchQuery &&
            decodeURIComponent(searchQuery).toLowerCase() ===
              d.name.toLowerCase();
          const shouldShowSelected = Boolean(
            selectedNode?.id === d.id || isSelectedFromUrl,
          );

          const nodeState: NodeState = {
            isHovered: false,
            isSelected: shouldShowSelected,
            isActive: false,
          };

          // Generate icon classes using utility function
          const iconClasses = getIconClasses({ node: d, state: nodeState });

          // Apply initial magnetic state using utility function
          const containerElement = this as HTMLElement;
          updateNodeDOMClasses(containerElement, d, nodeState);

          root.render(
            <div className="w-full h-full flex items-center justify-center">
              <IconComponent
                className={clsx(iconClasses.current, "node-icon block m-auto")}
                ref={(svgElement: SVGSVGElement | null) => {
                  if (svgElement) {
                    // Apply initial styling based on state
                    const targetColor = getIconTargetColor(d, nodeState);
                    svgElement.style.color = targetColor;

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

                        // Apply the correction transform, preserving any existing transform
                        const existingTransform = svgElement.style.transform;
                        let newTransform = "";

                        if (
                          Math.abs(opticalDx) > 0.1 ||
                          Math.abs(opticalDy) > 0.1
                        ) {
                          newTransform = `translate(${opticalDx}px, ${opticalDy}px)`;
                        }

                        // Combine transforms if both exist
                        if (existingTransform && newTransform) {
                          svgElement.style.transform = `${existingTransform} ${newTransform}`;
                        } else if (newTransform) {
                          svgElement.style.transform = newTransform;
                        }

                        // Apply icon color based on node state
                        if (shouldShowSelected && iconHexColor) {
                          svgElement.style.color = iconHexColor;
                        }

                        svgElement.setAttribute(
                          "preserveAspectRatio",
                          "xMidYMid",
                        );
                      } catch (error) {
                        console.warn(
                          "Error auto-centering icon:",
                          d.icon,
                          error,
                        );
                      }
                    }, 0);
                  }
                }}
              />
            </div>,
          );
        }
      });
    }, 10);

    return () => {
      clearTimeout(timeoutId);
      if (simulationRef.current) {
        simulationRef.current.stop();
      }
    };
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto mb-8 px-4 overflow-visible flex flex-col">
      <StackItemExperience
        hoveredNode={hoveredNode}
        selectedNode={selectedNode}
      />

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
