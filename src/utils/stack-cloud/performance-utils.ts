import type { SimulationNode } from "~/types/simulation";

const MOVEMENT_THRESHOLD = 0.5;
interface NodePositionCache {
  x: number;
  y: number;
  scaleFactor: number;
}

const positionCache = new Map<string, NodePositionCache>();
export function hasNodeMovedSignificantly(node: SimulationNode): boolean {
  if (node.x === undefined || node.y === undefined) return false;

  const cached = positionCache.get(node.id);
  if (!cached) {
    // First time seeing this node, update it
    positionCache.set(node.id, {
      x: node.x,
      y: node.y,
      scaleFactor: node.scaleFactor ?? 1.0,
    });
    return true;
  }

  // Check if position or scale has changed significantly
  const dx = Math.abs(node.x - cached.x);
  const dy = Math.abs(node.y - cached.y);
  const scaleChanged = (node.scaleFactor ?? 1.0) !== cached.scaleFactor;

  const hasMoved = dx > MOVEMENT_THRESHOLD || dy > MOVEMENT_THRESHOLD;

  if (hasMoved || scaleChanged) {
    // Update cache
    cached.x = node.x;
    cached.y = node.y;
    cached.scaleFactor = node.scaleFactor ?? 1.0;
    return true;
  }

  return false;
}

export function clearPositionCache(): void {
  positionCache.clear();
}

export function forceNodeUpdate(nodeId: string): void {
  positionCache.delete(nodeId);
}

const radiusCache = new Map<
  string,
  { radius: number; scaleFactor: number; result: number }
>();

export function clearRadiusCache(): void {
  radiusCache.clear();
}

export const TICKS_PER_FRAME = 2;
export function calculateOptimalAlphaTarget(
  changeMagnitude: number,
  isLargeChange: boolean,
): number {
  // Base alpha target - very low to prevent jitter
  const base = 0.04;

  if (isLargeChange) {
    // For large changes (domain selection), use higher target
    return Math.min(base * 1.5, 0.08);
  }

  // For small changes, use gentle reheat
  return base * (1 + changeMagnitude * 0.3);
}

export function isLargeSelectionChange(
  changeMagnitude: number,
  nodeCount: number,
): boolean {
  return changeMagnitude > 0.2 || nodeCount * changeMagnitude > 5;
}
export function calculateOptimalSettlingTime(
  changeMagnitude: number,
  isLargeChange: boolean,
): number {
  if (isLargeChange) {
    // Large changes: longer settling (600-1000ms)
    return 600 + changeMagnitude * 400;
  }

  // Small changes: quick settling (300-500ms)
  return 300 + changeMagnitude * 200;
}
