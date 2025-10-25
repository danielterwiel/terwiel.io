/**
 * Calculates coordinated timing for overlapping FLIP animations with viewport awareness.
 *
 * This utility manages the timing of simultaneous animations to eliminate visual gaps:
 * - Only visible items animate with staggered delays (items outside viewport snap instantly)
 * - FLIP animations for staying items begin immediately (overlapping with exits)
 * - Entering items animate in with coordinated delays based on visibility
 *
 * The key insight: Don't wait for exits to complete before repositioning.
 * Instead, start the FLIP animation early so staying items "chase" the exiting items.
 * Items outside the viewport are positioned instantly to avoid performance issues and gaps.
 */

interface AnimationTimingConfig {
  /** Total number of items being removed */
  removedCount: number;
  /** Number of removed items currently visible in viewport */
  visibleRemovedCount: number;
  /** Total number of staying items being repositioned */
  stayingCount: number;
  /** Number of staying items currently visible in viewport */
  visibleStayingCount: number;
  /** Total number of new items entering */
  enteringCount: number;
  /** Number of entering items currently visible in viewport */
  visibleEnteringCount: number;
  /** Base delay between sequential items (ms) */
  staggerDelay: number;
  /** Duration of individual exit/entry animations (ms) */
  animationDuration: number;
}

interface AnimationTiming {
  /** When to trigger the DOM update relative to animation start (ms) */
  domUpdateTrigger: number;
  /** When FLIP animation should start for staying items (ms) */
  flipStartDelay: number;
  /** Total time from animation start to completion (ms) */
  totalDuration: number;
  /** Individual item delays for removed items */
  exitDelays: number[];
  /** Individual item delays for entering items */
  entryDelays: number[];
  /** Maximum stagger (last item delay + duration) */
  maxDelay: number;
}

/**
 * Calculate coordinated animation timing to eliminate gaps.
 *
 * The strategy:
 * 1. Removed items animate out with staggered delays (0ms, 50ms, 100ms, ...)
 * 2. DOM updates early (around 200ms) when exits are clearly visible
 * 3. FLIP animations start immediately (0ms) overlapping with exits
 * 4. Entering items start with delay that accounts for the stagger
 *
 * This creates a smooth cascade where items exit and the space is immediately
 * filled by repositioned items, with new items entering from the sides.
 */
export function calculateOverlapTiming(
  config: AnimationTimingConfig,
): AnimationTiming {
  const {
    removedCount,
    visibleRemovedCount,
    enteringCount,
    visibleEnteringCount,
    staggerDelay,
    animationDuration,
  } = config;

  // Calculate staggered delays for removed items - only visible items are animated
  // Items outside viewport snap instantly (no animation)
  // First visible item starts at 0ms, each subsequent visible item delayed by staggerDelay
  const exitDelays = Array.from({ length: removedCount }, (_, i) => {
    // For items in viewport, apply stagger; for off-screen items, use 0 (snap)
    // This requires mapping visible removed items to their actual indices
    // We'll generate delays for all items, with only visible ones having animation
    return i < visibleRemovedCount ? i * staggerDelay : 0;
  });

  // The last VISIBLE removed item's delay + duration gives us the max time for exits
  const maxExitTime =
    visibleRemovedCount > 0
      ? (visibleRemovedCount - 1) * staggerDelay + animationDuration
      : 0;

  // DOM update should happen early enough that exits are visible
  // but before the main reflow happens. For viewport-aware animations,
  // trigger slightly earlier since we're only animating visible items
  const domUpdateTrigger = Math.min(
    animationDuration * 0.3,
    150, // Shorter trigger for viewport-aware approach
  );

  // FLIP animation starts immediately (0ms) to overlap with exits
  // This way, staying items begin repositioning while exits are animating
  const flipStartDelay = 0;

  // For entering items, start them with a slight delay after DOM update
  // This ensures they animate in smoothly as exiting items are leaving
  // Only visible entering items are animated
  const entryStartDelay = domUpdateTrigger + staggerDelay;
  const entryDelays = Array.from({ length: enteringCount }, (_, i) => {
    // Only visible entering items get animation delays
    return i < visibleEnteringCount ? entryStartDelay + i * staggerDelay : 0;
  });

  // Maximum delay is the latest animation completion time
  // Only consider visible items for the maximum duration calculation
  const maxEntryTime =
    visibleEnteringCount > 0
      ? entryStartDelay +
        (visibleEnteringCount - 1) * staggerDelay +
        animationDuration
      : 0;

  const maxDelay = Math.max(maxExitTime, maxEntryTime, animationDuration);

  return {
    domUpdateTrigger,
    flipStartDelay,
    totalDuration: maxDelay,
    exitDelays,
    entryDelays,
    maxDelay,
  };
}

/**
 * Get the delay for a specific removed item.
 * Items are indexed from the perspective of their animation group
 * (items being removed from top are numbered 0, 1, 2... separately from bottom items)
 */
export function getExitItemDelay(
  itemGroupIndex: number,
  staggerDelay: number,
): number {
  return itemGroupIndex * staggerDelay;
}

/**
 * Get the delay for a specific entering item.
 */
export function getEntryItemDelay(
  itemGroupIndex: number,
  staggerDelay: number,
  domUpdateTrigger: number,
): number {
  const entryStartDelay = domUpdateTrigger + staggerDelay;
  return entryStartDelay + itemGroupIndex * staggerDelay;
}
