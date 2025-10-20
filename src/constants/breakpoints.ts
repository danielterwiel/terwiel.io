/**
 * Breakpoints for responsive StackCloud sizing
 * Aligned with Tailwind CSS breakpoints
 * Single source of truth for viewport-based calculations
 */
export const STACK_CLOUD_BREAKPOINTS = {
  /** Small viewport threshold (Tailwind sm: 640px) */
  SMALL: 640,
  /** Medium viewport threshold (Tailwind md: 768px) */
  MEDIUM: 768,
  /** Large viewport threshold (Tailwind lg: 1024px) */
  LARGE: 1024,
  /** Root node radius scaling factor (relative to vmin) */
  ROOT_RADIUS_SCALE: 0.25 / 1.25, // 0.2
  /** Container min height */
  CONTAINER_MIN_HEIGHT: 400,
  /** Container max height */
  CONTAINER_MAX_HEIGHT: 600,
} as const;
