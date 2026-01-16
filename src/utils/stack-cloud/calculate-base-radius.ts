import type { Stack } from "~/types";

/**
 * Calculate optimal base stack radius for force simulation
 * Based on circle packing principles with varying circle sizes
 *
 * Algorithm:
 * 1. Calculate available area (viewport minus root node exclusion zone)
 * 2. Determine target coverage ratio (~40-50% for comfortable spacing)
 * 3. Account for size factor distribution (varying node sizes)
 * 4. Solve for base radius that achieves target coverage
 *
 * Formula derivation:
 * - Total circle area = Σ(π * (baseRadius * sizeFactor[i])²) for all nodes
 * - Coverage ratio = Total circle area / Available area
 * - Solving for baseRadius given target coverage ratio
 *
 * @param viewportWidth - SVG viewport width in pixels
 * @param viewportHeight - SVG viewport height in pixels
 * @param rootRadius - Root node radius (for exclusion zone calculation)
 * @param stacks - Pre-computed unique stacks (avoids redundant extraction)
 * @param sizeFactors - Pre-computed size factors (avoids redundant date parsing)
 * @returns Optimal base radius for stack nodes
 */
export function calculateBaseStackRadius(
  viewportWidth: number,
  viewportHeight: number,
  rootRadius: number,
  stacks: Stack[],
  sizeFactors: Map<string, number>,
): number {
  // Edge case: no stacks
  if (stacks.length === 0) return 30;

  // Calculate viewport metrics
  const viewportArea = viewportWidth * viewportHeight;
  const vmin = Math.min(viewportWidth, viewportHeight);

  // Calculate root exclusion area (circular region around center)
  // Root exclusion factor is 1.3 from stack-cloud-physics constants
  const rootExclusionRadius = rootRadius * 1.3;
  const rootExclusionArea = Math.PI * rootExclusionRadius * rootExclusionRadius;

  // Available area for stack nodes (viewport minus root exclusion)
  const availableArea = viewportArea - rootExclusionArea;

  // Calculate sum of squared size factors: Σ(sizeFactor[i]²)
  // This accounts for varying node sizes in the packing density calculation
  let sumOfSquaredFactors = 0;
  for (const stack of stacks) {
    const sizeFactor = sizeFactors.get(stack.name) ?? 1.0;
    sumOfSquaredFactors += sizeFactor * sizeFactor;
  }

  // Target coverage ratio: percentage of available area covered by circles
  // Research shows 40-50% is optimal for force-directed layouts with varying sizes
  // - Too low (<30%): Nodes too small, hard to interact with
  // - Too high (>60%): Overcrowded, unstable physics
  //
  // We use adaptive coverage based on viewport size:
  // - Small screens (mobile): 45% coverage (larger nodes, easier touch targets)
  // - Large screens (desktop): 35% coverage (more breathing room, better aesthetics)
  const isSmallViewport = vmin < 600;
  const targetCoverage = isSmallViewport ? 0.45 : 0.35;

  // Solve for base radius using circle packing formula
  // Total area = Σ(π * (r_base * f_i)²) = π * r_base² * Σ(f_i²)
  // Coverage = Total area / Available area = target
  // r_base² = (target * Available area) / (π * Σ(f_i²))
  const baseRadiusSquared =
    (targetCoverage * availableArea) / (Math.PI * sumOfSquaredFactors);
  const baseRadius = Math.sqrt(baseRadiusSquared);

  // Apply constraints to ensure reasonable sizes across all viewports
  // Min: 15px (mobile touch target minimum ~45px diameter)
  // Max: vmin * 0.08 (prevents nodes from being too large on big screens)
  const minRadius = 15;
  const maxRadius = vmin * 0.08;
  const constrainedRadius = Math.max(
    minRadius,
    Math.min(maxRadius, baseRadius),
  );

  return constrainedRadius;
}
