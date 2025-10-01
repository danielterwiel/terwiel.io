import { clsx } from "clsx";

import type { IconNode } from "../types/icon-node";
import {
  calculateBaseNodeRadius,
  calculateCollisionRadius,
  calculateNodeScaleFactor,
  getViewportDimensions,
} from "./icon-cloud-responsive";
import { getIconColorClass, getIconHexColor } from "./icon-colors";

export interface NodeState {
  isHovered: boolean;
  isSelected: boolean;
  isActive: boolean;
}

export interface NodeSizing {
  radius: number;
  collisionRadius: number;
  foreignObjectSize: number;
  offset: number;
  scaleFactor: number;
}

export interface NodeClassConfig {
  node: IconNode;
  state: NodeState;
}

/**
 * Generate icon classes based on node state
 */
export function getIconClasses({ node, state }: NodeClassConfig): {
  default: string;
  hover: string;
  selected: string;
  current: string;
} {
  const iconColorClass = getIconColorClass(node.icon);
  const baseClasses = "drop-shadow-sm transition-all duration-300 ease-in-out";
  const defaultColorClasses = "text-gray-800";

  const classes = {
    default: clsx(baseClasses, defaultColorClasses, "scale-100"),
    hover: clsx(
      baseClasses,
      iconColorClass || defaultColorClasses,
      "scale-150",
    ),
    selected: clsx(
      baseClasses,
      iconColorClass || defaultColorClasses,
      "scale-125",
    ),
  };

  // Determine current class based on state priority: selected > hover > default
  // Selected state takes priority to prevent color conflicts during hover
  let current = classes.default;
  if (state.isHovered && !state.isSelected) current = classes.hover;
  if (state.isSelected) current = classes.selected;

  return { ...classes, current };
}

/**
 * Get the target color for an icon based on its state
 * Selected state takes priority over hover to prevent color conflicts
 */
export function getIconTargetColor(node: IconNode, state: NodeState): string {
  const iconColor = getIconHexColor(node.icon);
  const defaultColor = "#6b7280"; // text-gray-500 equivalent

  // Selected state takes priority - if selected, always use icon color regardless of hover
  if (state.isSelected && iconColor) return iconColor;
  // Only apply hover color if not selected
  if (state.isHovered && !state.isSelected && iconColor) return iconColor;
  return defaultColor;
}

/**
 * Update DOM element classes for a node
 */
export function updateNodeDOMClasses(
  element: HTMLElement,
  _node: IconNode,
  state: NodeState,
): void {
  const magneticContainer = element.querySelector(
    ".magnetic-base",
  ) as HTMLElement;
  const foreignObject = element.closest("foreignObject") as Element;

  if (magneticContainer) {
    // Remove all variant classes first
    magneticContainer.classList.remove(
      "magnetic-hover",
      "magnetic-active",
      "magnetic-selected",
    );

    // Add current state classes
    if (state.isHovered && !state.isSelected) {
      magneticContainer.classList.add("magnetic-hover");
    }
    if (state.isSelected) {
      magneticContainer.classList.add("magnetic-selected");
    }
    if (state.isActive && !state.isHovered && !state.isSelected) {
      magneticContainer.classList.add("magnetic-active");
    }
  }

  if (foreignObject) {
    // Remove existing classes
    foreignObject.classList.remove("node-selected");
    // Add new classes
    if (state.isSelected) {
      foreignObject.classList.add("node-selected");
    }
  }
}

/**
 * Calculates responsive node sizing based on viewport, node count, and node state
 * This acts as the main sizing state machine for icon cloud nodes
 *
 * @param node - The icon node to calculate sizing for
 * @param nodeCount - Total number of nodes in the simulation
 * @param state - Current state of the node (hover, selected, etc.)
 * @returns Complete sizing information for the node
 */
export function calculateNodeSizing(
  node: IconNode,
  nodeCount: number,
  state: NodeState,
): NodeSizing {
  const viewport = getViewportDimensions();

  // Calculate base radius for all nodes based on viewport and node count
  const baseRadius = calculateBaseNodeRadius(
    nodeCount,
    viewport.width,
    viewport.height,
  );

  // Get scale factor for this specific node based on its scale level
  const scaleFactor = calculateNodeScaleFactor(baseRadius, node.scaleLevel);

  // Calculate the actual radius for this node
  const radius = baseRadius * scaleFactor;

  // Calculate collision radius (includes state-based adjustments)
  const collisionRadius = calculateCollisionRadius(
    baseRadius,
    node.scaleLevel,
    state.isHovered,
    state.isSelected,
  );

  // Calculate foreignObject dimensions
  // ForeignObject needs to be larger to accommodate icon scaling on hover
  const foreignObjectSize = Math.max(radius * 2.8, 120);

  // Calculate offset to center the foreignObject
  const offset = -foreignObjectSize / 2;

  return {
    radius,
    collisionRadius,
    foreignObjectSize,
    offset,
    scaleFactor,
  };
}
