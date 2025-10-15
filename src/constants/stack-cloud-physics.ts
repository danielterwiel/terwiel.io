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

/** Base collision force padding in pixels between nodes (will be scaled by viewport) */
export const COLLISION_PADDING_BASE = 6 as const;

/** Collision force strength (1.0 = maximum rigidity to prevent overlap and jitter) */
export const COLLISION_STRENGTH = 1.0 as const;

/** Collision force iterations for stability (12 = very high rigidity, prevents small node jitter) */
export const COLLISION_ITERATIONS = 12 as const;

/** Barnes-Hut theta parameter for many-body force (lower = more accurate, 0.5 recommended for mixed sizes) */
export const MANY_BODY_THETA = 0.5 as const;

/** Minimum distance for many-body force to prevent instability (nodes too close = infinite force) */
export const MANY_BODY_DISTANCE_MIN = 1 as const;

/** Base charge strength for many-body repulsion force (mobile/default) */
export const BASE_CHARGE_STRENGTH = -12 as const;

/** Base dampening factor for mass-based velocity dampening (0-1, where 1 = instant stop) */
export const MASS_DAMPEN_BASE = 0.08 as const;

/** Initial animation alpha target for smooth startup (low value prevents jitter) */
export const INITIAL_ALPHA_TARGET = 0.1 as const;

/** Initial animation duration in milliseconds */
export const INITIAL_ANIMATION_DURATION = 400 as const;
