/**
 * Stack cloud physics constants - single source of truth
 * These values control the D3 force simulation behavior
 */

/** Root exclusion zone multiplier (1.3 = 130% of root radius) */
export const ROOT_EXCLUSION_FACTOR = 1.3 as const;

/** Root exclusion force strength (higher = stronger push away from root) */
export const ROOT_EXCLUSION_STRENGTH = 0.12 as const;

/** Boundary padding in pixels to keep nodes away from viewport edges */
export const BOUNDARY_PADDING = 10 as const;

/** Segment padding factor (0.2 = 20% padding on each side of domain segment) */
export const SEGMENT_PADDING_FACTOR = 0.2 as const;

/** D3 arc angle offset to convert to Math angle (0 = top → 0 = right) */
export const ARC_TO_MATH_ANGLE_OFFSET = Math.PI / 2;

/** Collision force padding in pixels between nodes */
export const COLLISION_PADDING = 6 as const;

/** Collision force strength (0.5 = moderate) */
export const COLLISION_STRENGTH = 0.5 as const;

/** Collision force iterations for stability */
export const COLLISION_ITERATIONS = 2 as const;

/** Many-body charge strength (negative = repulsion) */
export const CHARGE_STRENGTH = -12 as const;

/** Positioning force strength (forceX/forceY) for gentle centering */
export const POSITIONING_FORCE_STRENGTH = 0.05 as const;
