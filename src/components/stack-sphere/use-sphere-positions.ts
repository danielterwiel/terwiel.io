/**
 * Fibonacci Sphere Point Distribution Algorithm
 *
 * This hook calculates 3D positions for items distributed evenly on a sphere surface
 * using the Fibonacci/Golden Spiral method. This is the mathematical foundation for
 * the CSS 3D sphere visualization.
 *
 * ## Algorithm Overview
 *
 * The Fibonacci sphere (also called Golden Spiral Sphere) provides the most uniform
 * distribution of points on a sphere surface. It's based on the golden ratio and
 * creates a spiral pattern similar to sunflower seeds.
 *
 * ## Mathematical Foundation
 *
 * ### Golden Angle
 * The golden angle is: π(3 - √5) ≈ 2.39996 radians ≈ 137.508°
 * This angle minimizes clustering because it's the "most irrational" angle -
 * no matter how many points you add, they never align into rows.
 *
 * ### Core Formula
 * For n points on a unit sphere:
 *
 * ```
 * goldenAngle = π(3 - √5)
 *
 * For each point i (0 to n-1):
 *   y = 1 - (i / (n-1)) * 2        // Vertical position: 1 to -1 (top to bottom)
 *   radius = √(1 - y²)             // Horizontal radius at this y level
 *   theta = goldenAngle * i        // Angle around the vertical axis
 *
 *   x = cos(theta) * radius
 *   z = sin(theta) * radius
 * ```
 *
 * ### Improved Distribution with Epsilon Offset
 *
 * The canonical Fibonacci lattice has slightly suboptimal packing near the poles.
 * An offset parameter ε pushes points away from the poles, improving packing by ~8.3%.
 *
 * Source: https://extremelearning.com.au/how-to-evenly-distribute-points-on-a-sphere-more-effectively-than-the-canonical-fibonacci-lattice/
 *
 * Optimal ε values by point count:
 * - n < 24:        ε = 0.33
 * - 24 ≤ n < 177:  ε = 1.33
 * - 177 ≤ n < 890: ε = 3.33
 * - n ≥ 890:       ε = 10
 *
 * Modified formula with offset:
 * ```
 * y = 1 - ((i + ε) / (n - 1 + 2ε)) * 2
 * ```
 *
 * ## CSS 3D Transform Mapping
 *
 * The spherical coordinates (x, y, z) are converted to CSS transforms:
 *
 * ### Method 1: rotateY + rotateX + translateZ (simpler, used here)
 * ```
 * theta = atan2(z, x)              // Horizontal angle
 * phi = asin(y)                    // Vertical angle
 * transform: rotateY(θ°) rotateX(φ°) translateZ(radius)
 * ```
 *
 * ### Method 2: translate3d (alternative)
 * ```
 * transform: translate3d(x * radius, y * radius, z * radius)
 * ```
 *
 * We use Method 1 because it naturally keeps items facing outward (readable text).
 *
 * ## GPU Acceleration Notes
 *
 * CSS transforms (rotateX, rotateY, translateZ) are GPU-accelerated and run on
 * the compositor thread, not blocking the main thread. This is critical for
 * smooth 60fps animation with many elements.
 *
 * Key optimizations:
 * - Use transform and opacity only (compositor-friendly)
 * - Add will-change: transform during animation
 * - Remove will-change when idle to free GPU memory
 * - Use contain: paint to isolate repaints
 *
 * ## References
 *
 * - Fibonacci lattice optimization: https://extremelearning.com.au/how-to-evenly-distribute-points-on-a-sphere-more-effectively-than-the-canonical-fibonacci-lattice/
 * - CSS 3D tag cloud: https://www.cssscript.com/3d-rotating-sphere-tags-cloud/
 * - GPU animation: https://www.smashingmagazine.com/2016/12/gpu-animation-doing-it-right/
 * - CSS containment: https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Containment/Using
 */

import { useMemo } from "react";

/** Position data for a single sphere item */
export type SpherePosition = {
  /** Index of the item in the original array */
  index: number;
  /** Cartesian X coordinate (-1 to 1) */
  x: number;
  /** Cartesian Y coordinate (-1 to 1) */
  y: number;
  /** Cartesian Z coordinate (-1 to 1) */
  z: number;
  /** Horizontal rotation angle in degrees for CSS rotateY */
  theta: number;
  /** Vertical rotation angle in degrees for CSS rotateX */
  phi: number;
  /** CSS transform string for positioning */
  transform: string;
  /** Z-depth for opacity/scale effects (0 = front, 1 = back) */
  depth: number;
};

/**
 * Get optimal epsilon offset for improved Fibonacci lattice packing
 * Based on research by Martin Roberts (Extreme Learning)
 */
function getOptimalEpsilon(n: number): number {
  if (n < 24) return 0.33;
  if (n < 177) return 1.33;
  if (n < 890) return 3.33;
  return 10;
}

/** Golden angle in radians: π(3 - √5) ≈ 2.39996 */
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

/**
 * Calculate Fibonacci sphere positions for a given number of items
 *
 * @param count - Number of items to distribute on the sphere
 * @param radius - Sphere radius in pixels for CSS transform
 * @returns Array of position data for each item
 */
export function calculateSpherePositions(
  count: number,
  radius: number,
): SpherePosition[] {
  if (count === 0) return [];
  if (count === 1) {
    // Single item goes at front center
    return [
      {
        index: 0,
        x: 0,
        y: 0,
        z: 1,
        theta: 0,
        phi: 0,
        transform: `rotateY(0deg) rotateX(0deg) translateZ(${radius}px)`,
        depth: 0,
      },
    ];
  }

  const epsilon = getOptimalEpsilon(count);
  const positions: SpherePosition[] = [];

  for (let i = 0; i < count; i++) {
    // Vertical position with epsilon offset for better pole distribution
    // y goes from ~1 (top) to ~-1 (bottom)
    const y = 1 - ((i + epsilon) / (count - 1 + 2 * epsilon)) * 2;

    // Horizontal radius at this y level (Pythagorean)
    const horizontalRadius = Math.sqrt(1 - y * y);

    // Angle around the vertical axis (golden angle increment)
    const theta = GOLDEN_ANGLE * i;

    // Cartesian coordinates on unit sphere
    const x = Math.cos(theta) * horizontalRadius;
    const z = Math.sin(theta) * horizontalRadius;

    // Convert to CSS-friendly angles (degrees)
    // theta: horizontal rotation (around Y axis)
    // phi: vertical rotation (around X axis)
    const thetaDeg = Math.atan2(z, x) * (180 / Math.PI);
    const phiDeg = Math.asin(y) * (180 / Math.PI);

    // Depth for visual effects (0 = front, 1 = back)
    // z=1 is front, z=-1 is back
    // Round to 2 decimal places to prevent hydration mismatch
    const depth = Math.round(((1 - z) / 2) * 100) / 100;

    positions.push({
      index: i,
      x,
      y,
      z,
      theta: thetaDeg,
      phi: phiDeg,
      transform: `rotateY(${thetaDeg.toFixed(2)}deg) rotateX(${phiDeg.toFixed(2)}deg) translateZ(${radius}px)`,
      depth,
    });
  }

  return positions;
}

/**
 * React hook for memoized sphere position calculations
 *
 * @param count - Number of items to distribute
 * @param radius - Sphere radius in pixels
 * @returns Memoized array of sphere positions
 */
export function useSpherePositions(
  count: number,
  radius: number,
): SpherePosition[] {
  return useMemo(
    () => calculateSpherePositions(count, radius),
    [count, radius],
  );
}
