import type { DomainAngleRange } from "./calculate-domain-angles";
import { SEGMENT_PADDING_FACTOR } from "~/constants/stack-cloud-physics";

/**
 * Calculate the angle for a node within its domain segment
 * Distributes nodes evenly across the segment with padding
 *
 * @param angleRange - The domain's angular range (startAngle, endAngle)
 * @param index - Node index within the domain (0-based)
 * @param totalCount - Total number of nodes in the domain
 * @returns Angle in radians (d3.arc() coordinate system, 0 = top)
 */
export function calculateNodeAngleInSegment(
  angleRange: DomainAngleRange,
  index: number,
  totalCount: number,
): number {
  const { startAngle, endAngle } = angleRange;

  // Single node: use segment midpoint
  if (totalCount === 1) {
    return (startAngle + endAngle) / 2;
  }

  // Multiple nodes: distribute evenly with padding
  const angularWidth = endAngle - startAngle;
  const padding = angularWidth * SEGMENT_PADDING_FACTOR;
  const usableWidth = angularWidth - 2 * padding;

  const t = index / (totalCount - 1); // 0 to 1
  return startAngle + padding + t * usableWidth;
}
