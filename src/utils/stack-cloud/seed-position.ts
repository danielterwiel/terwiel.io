import { clamp } from "../math";

/**
 * Seed initial position for a node outside the root exclusion ring
 * Ensures nodes start in valid positions within the container bounds
 */
export function seedPosition(
  centerX: number,
  centerY: number,
  width: number,
  height: number,
  nodeRadius: number,
  rootExclusionRadius: number,
  padding = 10,
): { x: number; y: number } {
  const angle = Math.random() * Math.PI * 2;

  const maxR =
    Math.min(
      centerX - padding - nodeRadius,
      width - centerX - padding - nodeRadius,
      centerY - padding - nodeRadius,
      height - centerY - padding - nodeRadius,
    ) || 0;

  const minR = rootExclusionRadius + nodeRadius + 4;
  const r = clamp(minR + Math.random() * (maxR - minR), minR, maxR);

  const x = clamp(
    centerX + Math.cos(angle) * r,
    padding + nodeRadius,
    width - padding - nodeRadius,
  );

  const y = clamp(
    centerY + Math.sin(angle) * r,
    padding + nodeRadius,
    height - padding - nodeRadius,
  );

  return { x, y };
}
