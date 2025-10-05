import { clamp } from "../math";

/**
 * Calculate maximum radius at a specific angle that keeps node within bounds
 */
function getMaxRadiusAtAngle(
  angle: number,
  centerX: number,
  centerY: number,
  width: number,
  height: number,
  nodeRadius: number,
  padding: number,
): number {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const constraints: number[] = [];

  // X-axis constraints
  if (cos > 0.01) {
    // Moving right
    constraints.push((width - padding - nodeRadius - centerX) / cos);
  } else if (cos < -0.01) {
    // Moving left
    constraints.push((centerX - padding - nodeRadius) / -cos);
  }

  // Y-axis constraints
  if (sin > 0.01) {
    // Moving down (positive Y in SVG)
    constraints.push((height - padding - nodeRadius - centerY) / sin);
  } else if (sin < -0.01) {
    // Moving up (negative Y in SVG)
    constraints.push((centerY - padding - nodeRadius) / -sin);
  }

  // Return minimum constraint, or a large default if no constraints
  return constraints.length > 0 ? Math.min(...constraints) : 1000;
}

/**
 * Seed initial position for a node outside the root exclusion ring
 * Ensures nodes start in valid positions within the container bounds
 *
 * @param domainAngle - Optional angle in radians to position the node at a specific angle (e.g., domain segment midpoint)
 */
export function seedPosition(
  centerX: number,
  centerY: number,
  width: number,
  height: number,
  nodeRadius: number,
  rootExclusionRadius: number,
  padding = 10,
  domainAngle?: number,
): { x: number; y: number } {
  const angle = domainAngle ?? Math.random() * Math.PI * 2;

  // Calculate maximum radius at this specific angle
  const maxR = getMaxRadiusAtAngle(
    angle,
    centerX,
    centerY,
    width,
    height,
    nodeRadius,
    padding,
  );

  const minR = rootExclusionRadius + nodeRadius + 4;
  const r = clamp(minR + Math.random() * (maxR - minR), minR, maxR);

  // No need to clamp - radius guarantees we're in bounds
  const x = centerX + Math.cos(angle) * r;
  const y = centerY + Math.sin(angle) * r;

  return { x, y };
}
