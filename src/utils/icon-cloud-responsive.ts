/**
 * Responsive utilities for icon cloud sizing and behavior
 * Handles viewport-based calculations for optimal node sizing on different devices
 */

export interface ViewportDimensions {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
}

/**
 * Mobile breakpoint (matches Tailwind's sm breakpoint)
 */
const MOBILE_BREAKPOINT = 640;

/**
 * Tablet breakpoint (matches Tailwind's md breakpoint)
 */
const TABLET_BREAKPOINT = 768;

/**
 * Detects if the current device is mobile based on viewport width
 */
export function isMobileDevice(): boolean {
  if (typeof window === "undefined") return false;
  return window.innerWidth < MOBILE_BREAKPOINT;
}

/**
 * Detects if the current device is tablet based on viewport width
 */
export function isTabletDevice(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.innerWidth >= MOBILE_BREAKPOINT &&
    window.innerWidth < TABLET_BREAKPOINT
  );
}

/**
 * Gets current viewport dimensions and device type
 */
export function getViewportDimensions(): ViewportDimensions {
  if (typeof window === "undefined") {
    return {
      width: 800,
      height: 800,
      isMobile: false,
      isTablet: false,
    };
  }

  const width = window.innerWidth;
  const height = window.innerHeight;

  return {
    width,
    height,
    isMobile: width < MOBILE_BREAKPOINT,
    isTablet: width >= MOBILE_BREAKPOINT && width < TABLET_BREAKPOINT,
  };
}

/**
 * Calculates optimal base node radius based on viewport size and number of nodes
 * Uses circle packing efficiency formula: area = π * r²
 *
 * @param nodeCount - Total number of nodes in the simulation
 * @param viewportWidth - Width of the viewport
 * @param viewportHeight - Height of the viewport
 * @returns Optimal base radius for nodes
 */
export function calculateBaseNodeRadius(
  nodeCount: number,
  viewportWidth: number,
  viewportHeight: number,
): number {
  // Calculate available area (use 70% of viewport to leave breathing room)
  const availableArea = viewportWidth * viewportHeight * 0.7;

  // Calculate area per node
  const areaPerNode = availableArea / nodeCount;

  // Calculate radius from area: r = sqrt(area / π)
  const baseRadius = Math.sqrt(areaPerNode / Math.PI);

  // Apply device-specific scale factors
  const viewport = getViewportDimensions();
  let scaleFactor = 1.0;

  if (viewport.isMobile) {
    // Mobile: reduce size significantly to fit more nodes
    scaleFactor = 0.35;
  } else if (viewport.isTablet) {
    // Tablet: moderate reduction
    scaleFactor = 0.5;
  } else {
    // Desktop: use larger nodes
    scaleFactor = 0.65;
  }

  // Apply minimum and maximum constraints
  const radius = baseRadius * scaleFactor;
  const minRadius = viewport.isMobile ? 15 : viewport.isTablet ? 20 : 25;
  const maxRadius = viewport.isMobile ? 35 : viewport.isTablet ? 50 : 70;

  return Math.max(minRadius, Math.min(maxRadius, radius));
}

/**
 * Calculates responsive scale factor based on base radius and node scale level
 *
 * @param _baseRadius - The base radius calculated for the viewport (unused, kept for API consistency)
 * @param scaleLevel - The scale level of the node (0-4, where 3 is the special experience node)
 * @returns Scale factor to apply to the node
 */
export function calculateNodeScaleFactor(
  _baseRadius: number,
  scaleLevel: number,
): number {
  // Base scale factors for each level
  const scaleLevelFactors: Record<number, number> = {
    0: 0.6, // Smallest
    1: 0.8, // Small
    2: 1.0, // Medium (base)
    3: 1.5, // Large (experience display node)
    4: 1.2, // Medium-Large
  };

  const levelFactor = scaleLevelFactors[scaleLevel] ?? 1.0;

  // Apply viewport-specific adjustments
  const viewport = getViewportDimensions();

  if (viewport.isMobile) {
    // On mobile, compress the scale differences
    return levelFactor * 0.8;
  }

  if (viewport.isTablet) {
    // On tablet, slightly compress
    return levelFactor * 0.9;
  }

  // Desktop: use full scale factors
  return levelFactor;
}

/**
 * Calculates collision force radius for a node based on base radius and state
 *
 * @param baseRadius - The base radius calculated for the viewport
 * @param scaleLevel - The scale level of the node
 * @param isHovered - Whether the node is hovered
 * @param isSelected - Whether the node is selected
 * @returns Collision radius for the force simulation
 */
export function calculateCollisionRadius(
  baseRadius: number,
  scaleLevel: number,
  isHovered: boolean,
  isSelected: boolean,
): number {
  const scaleFactor = calculateNodeScaleFactor(baseRadius, scaleLevel);
  let radius = baseRadius * scaleFactor;

  // Add padding for collision detection
  const basePadding = 12;

  // Increase radius when hovered or selected for better spacing
  if (isSelected) {
    radius *= 1.25;
  } else if (isHovered) {
    radius *= 1.5;
  }

  return Math.max(radius + basePadding, 50);
}

/**
 * Gets optimal SVG dimensions for the icon cloud based on viewport
 *
 * @returns Object with width and height for the SVG viewBox
 */
export function getOptimalSVGDimensions(): { width: number; height: number } {
  const viewport = getViewportDimensions();

  // Use fixed viewBox dimensions that work well across devices
  // The viewBox scaling will handle the actual responsive behavior
  if (viewport.isMobile) {
    return { width: 600, height: 600 };
  }

  if (viewport.isTablet) {
    return { width: 700, height: 700 };
  }

  // Desktop
  return { width: 800, height: 800 };
}
