/**
 * Breakpoints for responsive StackCloud sizing
 * Single source of truth for viewport-based calculations
 */
export const STACK_CLOUD_BREAKPOINTS = {
  /** Small viewport threshold (mobile) */
  SMALL: 400,
  /** Medium viewport threshold (tablet) */
  MEDIUM: 600,
  /** Stack node radius for small viewports */
  STACK_RADIUS_SMALL: 22,
  /** Stack node radius for medium viewports */
  STACK_RADIUS_MEDIUM: 26,
  /** Stack node radius for large viewports */
  STACK_RADIUS_LARGE: 30,
  /** Root node radius scaling factor (relative to vmin) */
  ROOT_RADIUS_SCALE: 0.25 / 1.25,
  /** Container min height */
  CONTAINER_MIN_HEIGHT: 400,
  /** Container max height */
  CONTAINER_MAX_HEIGHT: 600,
} as const;
