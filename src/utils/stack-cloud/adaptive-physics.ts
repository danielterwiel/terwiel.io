import type { SimulationNode } from "~/types/simulation";
import {
  COLLISION_PADDING_BASE,
  MANY_BODY_DISTANCE_MIN,
} from "~/constants/stack-cloud-physics";
import { clamp } from "~/utils/math";

/**
 * D3 force simulation default parameters
 * Used as baselines for adaptive physics calculations
 */
const D3_DEFAULT_ALPHA_DECAY = 0.0228; // 1 - Math.pow(0.001, 1/300)

/**
 * Calculates viewport metrics for adaptive physics
 */
export interface ViewportMetrics {
  width: number;
  height: number;
  vmin: number;
  viewportArea: number;
  viewportScale: number; // Normalized to 400px baseline
}

export function calculateViewportMetrics(
  width: number,
  height: number,
): ViewportMetrics {
  const vmin = Math.min(width, height);
  return {
    width,
    height,
    vmin,
    viewportArea: width * height,
    viewportScale: vmin / 400,
  };
}

/**
 * Calculates node statistics for physics tuning
 */
export interface NodeStats {
  totalNodeArea: number;
  avgRadius: number;
  minRadius: number;
  nodeCount: number;
  nodeDensity: number;
  coverageRatio: number;
}

export function calculateNodeStats(
  nodes: SimulationNode[],
  viewportArea: number,
): NodeStats {
  const nodeCount = nodes.length;

  const totalNodeArea = nodes.reduce((sum, node) => {
    const effectiveRadius = node.radius * (node.scaleFactor ?? 1);
    return sum + Math.PI * effectiveRadius * effectiveRadius;
  }, 0);

  const avgRadius =
    nodeCount > 0 ? nodes.reduce((sum, n) => sum + n.radius, 0) / nodeCount : 0;

  const minRadius = nodeCount > 0 ? Math.min(...nodes.map((n) => n.radius)) : 0;

  const nodeDensity = nodeCount / viewportArea;
  const coverageRatio = totalNodeArea / viewportArea;

  return {
    totalNodeArea,
    avgRadius,
    minRadius,
    nodeCount,
    nodeDensity,
    coverageRatio,
  };
}

/**
 * Adaptive physics parameters based on viewport and node coverage
 */
export interface AdaptivePhysicsParams {
  collisionPadding: number;
  velocityDecay: number;
  alphaDecay: number;
  chargeStrength: number;
  positioningStrength: number;
  manyBodyTheta: number;
  manyBodyDistanceMin: number;
}

export function calculateAdaptivePhysics(
  viewport: ViewportMetrics,
  nodeStats: NodeStats,
  _baseCharge = -8,
  manyBodyTheta = 0.5,
): AdaptivePhysicsParams {
  const { viewportScale } = viewport;
  const { nodeDensity, minRadius } = nodeStats;

  // Simple viewport-based approach for collision padding
  // Larger viewports get slightly more padding for visual comfort
  const densityAdjustment = clamp(1 / (nodeDensity * 100000), 0.8, 1.5);
  const collisionPadding =
    COLLISION_PADDING_BASE * viewportScale * densityAdjustment;

  // VIEWPORT-ADAPTIVE FIX: Based on D3 force simulation research
  // Key insight: Desktop needs BOTH higher velocityDecay AND lower alphaDecay
  // "Higher velocityDecay slows nodes down, need to ensure alpha decay is low
  // to prevent simulation from cooling before nodes reach endpoint"

  const isLargeViewport = viewport.vmin >= 600;

  // Velocity decay: controls friction/damping
  // Desktop (large screen): Higher decay (0.7) slows movement, prevents overshoot
  // Mobile (small screen): Default (0.4) allows smooth settling
  // Research: "High velocity decay (0.9) slows ticks, but need low alpha decay"
  const velocityDecay = isLargeViewport ? 0.7 : 0.4;

  // Alpha decay: controls simulation cooling speed
  // Desktop: LOWER decay (0.015) gives time for slowed nodes to settle
  // Mobile: Default (0.0228) for normal settling speed
  // CRITICAL: When velocityDecay is high, alphaDecay MUST be low
  const alphaDecay = isLargeViewport ? 0.015 : D3_DEFAULT_ALPHA_DECAY;

  // Charge strength: controls repulsion between nodes
  // Moderate strength works best for mixed node sizes
  const chargeStrength = -10;

  // Positioning strength: controls centering force
  // Low strength prevents overshoot and oscillation
  const positioningStrength = 0.03;

  // CRITICAL: distanceMin prevents instability (infinite force at zero distance)
  const manyBodyDistanceMin = Math.max(MANY_BODY_DISTANCE_MIN, minRadius * 0.5);

  return {
    collisionPadding,
    velocityDecay,
    alphaDecay,
    chargeStrength,
    positioningStrength,
    manyBodyTheta,
    manyBodyDistanceMin,
  };
}

/**
 * Calculate mass factor for a node (used for force scaling)
 * Formula: (radius / avgRadius)²
 */
export function calculateMassFactor(radius: number, avgRadius: number): number {
  return (radius / avgRadius) ** 2;
}

/**
 * Calculate adaptive alpha target for reheat/transitions
 * Research: alphaTarget should be VERY LOW (0.03-0.1) to prevent jitter
 * Lower values = smoother transitions, less oscillation
 */
export function calculateAlphaTarget(
  _vmin: number,
  changeMagnitude = 0,
): number {
  // Use consistently low alphaTarget across all viewports
  // Research shows low values prevent jitter during transitions
  const baseAlphaTarget = 0.05;

  if (changeMagnitude === 0) {
    // For viewport resize: use very low alphaTarget for smooth settling
    return baseAlphaTarget;
  }

  // For selection changes: scale based on how many nodes changed
  // Keep range tight (0.05-0.08) to prevent oscillation
  const changeMultiplier = 0.8 + changeMagnitude * 0.4;
  const calculatedAlphaTarget = baseAlphaTarget * changeMultiplier;

  return clamp(calculatedAlphaTarget, 0.03, 0.1);
}

/**
 * Calculate settling time based on alpha decay
 * Lower alpha decay needs more time to settle
 */
export function calculateSettlingTime(
  currentAlpha: number,
  alphaDecay: number,
  targetAlpha = 0.001,
): number {
  const settlingTicks =
    Math.log(targetAlpha / Math.max(currentAlpha, 0.1)) /
    Math.log(1 - alphaDecay);
  // Longer settling time for slower alpha decay
  return clamp(settlingTicks * 16, 300, 2000);
}
