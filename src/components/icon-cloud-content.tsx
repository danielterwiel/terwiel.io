"use client";

import clsx from "clsx";
import * as d3 from "d3";
import { useRouter, useSearchParams } from "next/navigation";
import { createRoot, type Root } from "react-dom/client";

import type React from "react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import type { Domain } from "~/data/projects";
import type { IconNode } from "../types/icon-node";
import { ExperienceDisplayNode } from "~/components/experience-display-node";
import { Icon } from "~/components/icon";
import { PROJECTS } from "~/data/projects";
import { debounce } from "~/utils/debounce";
import { getDomainGlow } from "~/utils/domain-colors";
import { extractUniqueIcons } from "~/utils/extract-unique-icons";
import { updateCollisionForce } from "~/utils/icon-cloud-collision";
import { updateNodeGlows } from "~/utils/icon-cloud-glow";
import {
  getOptimalSVGDimensions,
  getResponsiveSVGDimensions,
  isMobileDevice,
} from "~/utils/icon-cloud-responsive";
import { EXPERIENCE_NODE_SCALE_LEVEL } from "~/utils/icon-cloud-scale";
import { updateNodeVisualStyling } from "~/utils/icon-cloud-styling";
import { getIconHexColor, getMagneticClasses } from "~/utils/icon-colors";
import {
  calculateNodeSizing,
  getIconClasses,
  getIconTargetColor,
  type NodeState,
  updateNodeDOMClasses,
} from "~/utils/node-styling";

/**
 * Responsive D3 Force Simulation with Centered Experience Node
 *
 * Centering Strategy (following d3 v7.x best practices):
 * 1. SVG uses viewBox + preserveAspectRatio="xMidYMid meet" for responsive scaling
 * 2. Experience node is FIXED at center using fx/fy (doesn't respond to forces)
 * 3. Other nodes use gentle forceX/forceY to drift toward center
 * 4. On resize: update viewBox dimensions and recalculate center (width/2, height/2)
 * 5. Mobile-first: viewBox dimensions scale down on smaller devices (600x600 -> 800x800)
 */
export const IconCloudContent: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const simulationRef = useRef<d3.Simulation<IconNode, undefined> | null>(null);
  const nodesRef = useRef<IconNode[]>([]);
  const selectedNodeRef = useRef<IconNode | null>(null);
  const experienceNodeRootRef = useRef<Root | null>(null);
  const [isAnimationReady, setIsAnimationReady] = useState(false);
  const [hoveredNode, setHoveredNode] = useState<IconNode | null>(null);
  const [selectedNode, setSelectedNode] = useState<IconNode | null>(null);
  const [hoveredDomain, setHoveredDomain] = useState<Domain | null>(null);
  const [svgDimensions, setSvgDimensions] = useState(() =>
    getOptimalSVGDimensions(),
  );

  // Get responsive viewBox dimensions (coordinate system for d3)
  const width = svgDimensions.width;
  const height = svgDimensions.height;

  // Calculate center in viewBox coordinate space - this is where experience node stays fixed
  const centerX = width / 2;
  const centerY = height / 2;

  const updateUrl = useCallback(
    (nodeName: string) => {
      const url = new URL(window.location.href);
      const currentSearch = url.searchParams.get("search");

      // If the node is already selected, clear the search parameter
      if (
        currentSearch &&
        decodeURIComponent(currentSearch).toLowerCase() ===
          nodeName.toLowerCase()
      ) {
        url.searchParams.delete("search");
      } else {
        url.searchParams.set("search", encodeURIComponent(nodeName));
      }

      router.replace(url.toString(), { scroll: false });
    },
    [router],
  );

  // Helper function to update node glows based on hovered domain
  const handleUpdateNodeGlows = useCallback((hoveredDomain: Domain | null) => {
    updateNodeGlows(svgRef.current, hoveredDomain);
  }, []);

  // Helper function to re-render the experience display node
  const updateExperienceDisplayNode = useCallback(() => {
    if (experienceNodeRootRef.current) {
      experienceNodeRootRef.current.render(
        <div className="w-full h-full flex items-center justify-center">
          <ExperienceDisplayNode
            selectedNode={selectedNode}
            hoveredNode={hoveredNode}
            onDomainHover={setHoveredDomain}
          />
        </div>,
      );
    }
  }, [selectedNode, hoveredNode]);

  // Helper function to smoothly update collision force radius
  const handleUpdateCollisionForce = useCallback(
    (hoveredNode: IconNode | null, selectedNode: IconNode | null) => {
      updateCollisionForce(simulationRef.current, hoveredNode, selectedNode);
    },
    [],
  );

  // Helper function to update node visual styling without full rerender
  const handleUpdateNodeVisualStyling = useCallback(
    (targetNode: IconNode, isSelected: boolean) => {
      updateNodeVisualStyling(svgRef.current, targetNode, isSelected);
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
          handleUpdateNodeVisualStyling(selectedNode, false);
        }

        // Update state and ref
        selectedNodeRef.current = foundNode;
        setSelectedNode(foundNode);

        // Apply visual styling to new selection
        setTimeout(() => {
          handleUpdateNodeVisualStyling(foundNode, true);
          // Update collision force for the newly selected node
          handleUpdateCollisionForce(hoveredNode, foundNode);
        }, 0);
      }
    } else if (!currentSearchQuery) {
      // Clear selection when no search query
      if (selectedNode) {
        // Remove visual styling from previously selected node
        setTimeout(() => {
          handleUpdateNodeVisualStyling(selectedNode, false);
          // Update collision force to reflect cleared selection
          handleUpdateCollisionForce(hoveredNode, null);
        }, 0);
      }

      selectedNodeRef.current = null;
      setSelectedNode(null);
    }
  }, [
    searchParams,
    handleUpdateNodeVisualStyling,
    hoveredNode,
    handleUpdateCollisionForce,
    selectedNode,
  ]);

  // Effect to update collision forces when hover/select state changes
  useEffect(() => {
    if (simulationRef.current && nodesRef.current.length > 0) {
      handleUpdateCollisionForce(hoveredNode, selectedNode);
    }
  }, [hoveredNode, selectedNode, handleUpdateCollisionForce]);

  // Effect to update the experience display node when state changes
  useEffect(() => {
    updateExperienceDisplayNode();
  }, [updateExperienceDisplayNode]);

  // Effect to update node glows when domain hover changes
  useEffect(() => {
    if (nodesRef.current.length > 0) {
      handleUpdateNodeGlows(hoveredDomain);
    }
  }, [hoveredDomain, handleUpdateNodeGlows]);

  // Effect to set up ResizeObserver and update dimensions after mount
  useEffect(() => {
    // Update dimensions immediately after mount
    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      const newDimensions = getResponsiveSVGDimensions(containerWidth);
      setSvgDimensions(newDimensions);
    }

    // Set up ResizeObserver for precise container size tracking
    if (typeof ResizeObserver !== "undefined" && containerRef.current) {
      let resizeTimeout: NodeJS.Timeout | null = null;

      const handleResize = (entries: ResizeObserverEntry[]) => {
        // Debounce resize handling
        if (resizeTimeout) {
          clearTimeout(resizeTimeout);
        }

        resizeTimeout = setTimeout(() => {
          for (const entry of entries) {
            const containerWidth = entry.contentRect.width;
            const newDimensions = getResponsiveSVGDimensions(containerWidth);

            // Only update if dimensions actually changed
            if (
              newDimensions.width !== svgDimensions.width ||
              newDimensions.height !== svgDimensions.height
            ) {
              setSvgDimensions(newDimensions);

              // Restart simulation with new dimensions
              if (simulationRef.current && nodesRef.current.length > 0) {
                const newCenterX = newDimensions.width / 2;
                const newCenterY = newDimensions.height / 2;

                // Update experience node fixed position to new center
                const expNode = nodesRef.current.find(
                  (n) => n.id === "experience-display",
                );
                if (expNode) {
                  expNode.fx = newCenterX;
                  expNode.fy = newCenterY;
                }

                // Update centering forces for other nodes
                simulationRef.current
                  .force(
                    "x",
                    d3
                      .forceX()
                      .x((d) => {
                        const node = d as IconNode;
                        return node.id === "experience-display"
                          ? newCenterX
                          : newCenterX;
                      })
                      .strength(0.008),
                  )
                  .force(
                    "y",
                    d3
                      .forceY()
                      .y((d) => {
                        const node = d as IconNode;
                        return node.id === "experience-display"
                          ? newCenterY
                          : newCenterY;
                      })
                      .strength(0.008),
                  )
                  .force(
                    "collision",
                    d3
                      .forceCollide<IconNode>()
                      .radius((d) => {
                        const nodeState: NodeState = {
                          isHovered: d.isHovered ?? false,
                          isSelected: selectedNode?.id === d.id,
                          isActive: false,
                        };
                        const useExistingRadius = d.id === "experience-display";
                        const sizing = calculateNodeSizing(
                          d,
                          nodesRef.current.length,
                          newDimensions.width,
                          newDimensions.height,
                          nodeState,
                          useExistingRadius,
                        );
                        return sizing.collisionRadius;
                      })
                      .strength(0.3)
                      .iterations(1),
                  )
                  .alpha(0.3)
                  .restart();
              }
            }
          }
        }, 250);
      };

      resizeObserverRef.current = new ResizeObserver(handleResize);
      resizeObserverRef.current.observe(containerRef.current);
    }

    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
    };
  }, [selectedNode, svgDimensions.width, svgDimensions.height]);

  // Effect to handle viewport resize and update SVG dimensions (fallback for browsers without ResizeObserver)
  useEffect(() => {
    const handleResize = debounce(() => {
      const newDimensions = getResponsiveSVGDimensions();
      setSvgDimensions(newDimensions);

      // Restart simulation with new dimensions to reposition nodes
      if (simulationRef.current && nodesRef.current.length > 0) {
        const newCenterX = newDimensions.width / 2;
        const newCenterY = newDimensions.height / 2;

        // Update experience node fixed position to new center
        const expNode = nodesRef.current.find(
          (n) => n.id === "experience-display",
        );
        if (expNode) {
          expNode.fx = newCenterX;
          expNode.fy = newCenterY;
        }

        // Update forces with new dimensions
        simulationRef.current
          .force(
            "x",
            d3
              .forceX()
              .x((d) => {
                const node = d as IconNode;
                return node.id === "experience-display"
                  ? newCenterX
                  : newCenterX;
              })
              .strength(0.008),
          )
          .force(
            "y",
            d3
              .forceY()
              .y((d) => {
                const node = d as IconNode;
                return node.id === "experience-display"
                  ? newCenterY
                  : newCenterY;
              })
              .strength(0.008),
          )
          .force(
            "collision",
            d3
              .forceCollide<IconNode>()
              .radius((d) => {
                const nodeState: NodeState = {
                  isHovered: d.isHovered ?? false,
                  isSelected: selectedNode?.id === d.id,
                  isActive: false,
                };
                // Use existing radius for experience display node
                const useExistingRadius = d.id === "experience-display";
                const sizing = calculateNodeSizing(
                  d,
                  nodesRef.current.length,
                  newDimensions.width,
                  newDimensions.height,
                  nodeState,
                  useExistingRadius,
                );
                return sizing.collisionRadius;
              })
              .strength(0.3)
              .iterations(1),
          )
          .alpha(0.3)
          .restart();
      }
    }, 250);

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [selectedNode]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: Intentionally empty deps to run simulation setup only once
  useLayoutEffect(() => {
    // Small delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      if (!svgRef.current) return;

      const svg = d3.select(svgRef.current);
      svg.selectAll("*").remove();

      const nodes = extractUniqueIcons(PROJECTS, width, height);

      // Update all node radii with responsive sizing
      nodes.forEach((node) => {
        const nodeState: NodeState = {
          isHovered: false,
          isSelected: false,
          isActive: false,
        };
        const sizing = calculateNodeSizing(
          node,
          nodes.length + 1,
          width,
          height,
          nodeState,
        );
        node.r = sizing.radius;
      });

      // Add special experience display node
      const experienceNode: IconNode = {
        id: "experience-display",
        name: "Experience Display",
        icon: "experience",
        url: "",
        r: Math.max(...nodes.map((n) => n.r)) * 1.5, // 50% larger than largest node
        scaleLevel: EXPERIENCE_NODE_SCALE_LEVEL,
        x: centerX,
        y: centerY,
        fx: centerX, // Initially fixed at center
        fy: centerY,
        group: 0, // Special group for experience node
      };

      nodes.push(experienceNode);
      nodesRef.current = nodes;

      // Stop previous simulation if it exists
      if (simulationRef.current) {
        simulationRef.current.stop();
      }

      // Create force simulation with simplified centering approach
      // Experience node is FIXED at center via fx/fy, other nodes use gentle centering forces
      const simulation = d3
        .forceSimulation<IconNode>(nodes)
        .force("charge", d3.forceManyBody().strength(3)) // Gentle repulsion between nodes
        .force(
          "collision",
          d3
            .forceCollide<IconNode>()
            .radius((d) => {
              // Use responsive sizing calculation for collision radius
              const nodeState: NodeState = {
                isHovered: d.isHovered ?? false,
                isSelected: false,
                isActive: false,
              };
              // Use existing radius for experience display node
              const useExistingRadius = d.id === "experience-display";
              const sizing = calculateNodeSizing(
                d,
                nodes.length,
                width,
                height,
                nodeState,
                useExistingRadius,
              );
              return sizing.collisionRadius;
            })
            .strength(0.3)
            .iterations(1),
        )
        // Use forceX/forceY for gentle attraction to center (experience node ignores due to fx/fy)
        .force(
          "x",
          d3
            .forceX()
            .x((d) => {
              const node = d as IconNode;
              return node.id === "experience-display"
                ? (node.fx ?? centerX)
                : centerX;
            })
            .strength(0.008),
        )
        .force(
          "y",
          d3
            .forceY()
            .y((d) => {
              const node = d as IconNode;
              return node.id === "experience-display"
                ? (node.fy ?? centerY)
                : centerY;
            })
            .strength(0.008),
        )
        .force("boundaryY", () => {
          // Y-axis boundary constraint to keep nodes within container
          nodes.forEach((node) => {
            // Use responsive sizing for boundary calculations
            const nodeState: NodeState = {
              isHovered: node.isHovered ?? false,
              isSelected: false,
              isActive: false,
            };
            // Use existing radius for experience display node
            const useExistingRadius = node.id === "experience-display";
            const sizing = calculateNodeSizing(
              node,
              nodes.length,
              width,
              height,
              nodeState,
              useExistingRadius,
            );
            const nodeRadius = sizing.collisionRadius;
            const minY = nodeRadius;
            const maxY = height - nodeRadius;

            if (node.y !== undefined) {
              if (node.y < minY) {
                node.y = minY;
                node.vy = Math.max(0, node.vy || 0); // Prevent moving further up
              } else if (node.y > maxY) {
                node.y = maxY;
                node.vy = Math.min(0, node.vy || 0); // Prevent moving further down
              }
            }
          });
        })
        .alpha(0.1) // Start with very low energy
        .alphaDecay(0.005) // Extremely slow decay for calm settling
        .velocityDecay(0.6); // Higher velocity decay for calmer movement

      simulationRef.current = simulation;

      // Create container for nodes
      const nodeContainer = svg.append("g").attr("class", "nodes");

      // Detect if mobile device to disable drag & drop
      const isMobile = isMobileDevice();

      // Create node groups
      const nodeGroups = nodeContainer
        .selectAll<SVGGElement, IconNode>("g")
        .data(nodes)
        .enter()
        .append("g")
        .attr("class", "node")
        .style("cursor", "pointer");

      // Only enable drag & drop on non-mobile devices
      if (!isMobile) {
        nodeGroups.call(
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

              // Experience node returns to center, others are free to move
              if (d.id === "experience-display") {
                // Simply reset to center position - fx/fy keeps it there
                d.fx = centerX;
                d.fy = centerY;
                // Gentle simulation restart to smoothly reposition
                simulation.alphaTarget(0.05).restart();
                setTimeout(() => simulation.alphaTarget(0), 500);
              } else {
                // Release other nodes after drag
                d.fx = null;
                d.fy = null;
              }

              // Reset z-index after dragging
              const targetElement = event.sourceEvent?.target?.parentNode;
              if (targetElement && targetElement instanceof Element) {
                d3.select(targetElement).style("z-index", "auto");
              }
            }),
        );
      }

      // Circles removed - using water droplet effect instead

      // Add hover effects
      nodeGroups
        .on("mouseenter", function (_event, d) {
          // Skip hover effects for experience-display node (it handles its own interactions)
          if (d.id === "experience-display") return;

          // Lock the node position
          d.fx = d.x;
          d.fy = d.y;
          d.isHovered = true;

          // Set hovered node for text display
          setHoveredNode(d);

          // Update collision force for smooth node spacing
          updateCollisionForce(simulationRef.current, d, selectedNode);

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
          // Skip hover effects for experience-display node (it handles its own interactions)
          if (d.id === "experience-display") return;

          // Unlock the node position
          d.fx = null;
          d.fy = null;
          d.isHovered = false;

          // Clear hovered node for text display
          setHoveredNode(null);

          // Reset collision force to normal state
          updateCollisionForce(simulationRef.current, null, selectedNode);

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
            // Calculate offset to center foreignObject around node position
            // Apply offset in transform instead of foreignObject x/y attributes (Safari bug workaround)
            const nodeState: NodeState = {
              isHovered: d.isHovered ?? false,
              isSelected: selectedNode?.id === d.id,
              isActive: false,
            };
            const useExistingRadius = d.id === "experience-display";
            const sizing = calculateNodeSizing(
              d,
              nodes.length,
              width,
              height,
              nodeState,
              useExistingRadius,
            );
            // Apply centering offset in the transform (Safari ignores foreignObject x/y)
            const offsetX = (d.x ?? 0) + sizing.offset;
            const offsetY = (d.y ?? 0) + sizing.offset;
            return `translate(${offsetX},${offsetY})`;
          });
      });

      // Enable smooth animations after initial positioning
      simulation.on("end", () => {
        setIsAnimationReady(true);
      });

      // Use foreignObject to embed React icons with responsive sizing
      const foreignObjects = nodeGroups
        .append("foreignObject")
        .attr("width", (d) => {
          // Calculate responsive size based on SVG dimensions, node count, and node state
          const nodeState: NodeState = {
            isHovered: false,
            isSelected: false,
            isActive: false,
          };
          // Use existing radius for experience display node to preserve its custom size
          const useExistingRadius = d.id === "experience-display";
          const sizing = calculateNodeSizing(
            d,
            nodes.length,
            width,
            height,
            nodeState,
            useExistingRadius,
          );
          return sizing.foreignObjectSize;
        })
        .attr("height", (d) => {
          const nodeState: NodeState = {
            isHovered: false,
            isSelected: false,
            isActive: false,
          };
          const useExistingRadius = d.id === "experience-display";
          const sizing = calculateNodeSizing(
            d,
            nodes.length,
            width,
            height,
            nodeState,
            useExistingRadius,
          );
          return sizing.foreignObjectSize;
        })
        // Safari ignores foreignObject x/y attributes - we apply offset in parent <g> transform instead
        .attr("x", 0)
        .attr("y", 0)
        .attr("class", (d) => `node-scale-${d.scaleLevel}`)
        .style("overflow", "visible");

      // Create outer containers for React components with node-container class for scaling
      const outerContainers = foreignObjects
        .append("xhtml:div")
        .attr("class", (d) =>
          clsx(
            "node-container flex items-center justify-center relative overflow-visible",
            // Experience display node needs pointer events for pie chart interaction
            d.id !== "experience-display" && "pointer-events-none",
          ),
        )
        .style("overflow", "visible");

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
            "node-magnetic flex items-center justify-center transition-shadow duration-300 overflow-visible",
          );
        })
        .style("overflow", "visible")
        .each(function (d) {
          // Apply initial domain glow
          if (d.domain) {
            const container = this as HTMLElement;
            const glowColor = getDomainGlow(d.domain);
            container.style.boxShadow = `0 0 20px ${glowColor}, 0 0 40px ${glowColor}`;
          }
        });

      // Render React icons into each magnetic container
      magneticContainers.each(function (d) {
        const root = createRoot(this as Element);

        // Special handling for experience display node
        if (d.id === "experience-display") {
          // Apply the same magnetic container styling as selected nodes
          const containerElement = this as HTMLElement;
          const nodeState: NodeState = {
            isHovered: false,
            isSelected: true, // Always use selected styling
            isActive: false,
          };
          updateNodeDOMClasses(containerElement, d, nodeState);

          // Store the root reference for later updates
          experienceNodeRootRef.current = root;

          root.render(
            <div className="w-full h-full flex items-center justify-center">
              <ExperienceDisplayNode
                selectedNode={selectedNode}
                hoveredNode={hoveredNode}
              />
            </div>,
          );
          return;
        }

        // Regular icon nodes
        const IconComponent = Icon[d.icon as keyof typeof Icon];

        if (IconComponent) {
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
      // Clean up the experience node root reference
      experienceNodeRootRef.current = null;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full max-w-4xl mx-auto mb-8 px-4 overflow-visible flex flex-col"
    >
      <div className="relative w-full overflow-visible pb-[100%]">
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
