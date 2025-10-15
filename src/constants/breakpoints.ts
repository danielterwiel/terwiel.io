/**
 * Breakpoints for responsive StackCloud sizing
 * Single source of truth for viewport-based calculations
 */
export const STACK_CLOUD_BREAKPOINTS = {
  /** Small viewport threshold (mobile) */
  SMALL: 400,
  /** Medium viewport threshold (tablet) */
  MEDIUM: 600,
  /** Root node radius scaling factor (relative to vmin) */
  ROOT_RADIUS_SCALE: 0.25 / 1.25, // 0.2
  /** Container min height */
  CONTAINER_MIN_HEIGHT: 400,
  /** Container max height */
  CONTAINER_MAX_HEIGHT: 600,
} as const;
