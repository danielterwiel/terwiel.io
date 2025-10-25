/**
 * Calculates coordinated timing for viewport-aware FLIP animations without overlaps.
 *
 * This utility manages the timing of simultaneous animations with VIEWPORT ANCHOR awareness:
 * - Only visible items animate with staggered delays (items outside viewport snap instantly)
 * - FLIP animations for staying items whose VIEWPORT POSITION changed (not DOM position)
 * - Entering items wait for their corresponding DIRECTION'S exits to fully complete
 * - Direction-specific sequencing: Items above anchor slide UP when exiting/entering from top
 *   Items below anchor slide DOWN when exiting/entering from bottom
 *
 * The key insight: Use viewport anchor to determine direction dynamically.
 * This prevents overlaps: items exiting UP from anchor, items entering DOWN toward anchor, etc.
 * Staying items use FLIP only if their visual viewport position changed.
 * Items outside the viewport snap instantly to avoid gaps and maintain performance.
 */

interface AnimationTimingConfig {
  /** Total number of items being removed */
  removedCount: number;
  /** Number of removed items currently visible in viewport */
  visibleRemovedCount: number;
  /** Number of removed items from TOP direction */
  removedFromTopCount: number;
  /** Number of removed items from TOP direction that are visible */
  visibleRemovedFromTopCount: number;
  /** Number of removed items from BOTTOM direction */
  removedFromBottomCount: number;
  /** Number of removed items from BOTTOM direction that are visible */
  visibleRemovedFromBottomCount: number;
  /** Total number of staying items being repositioned */
  stayingCount: number;
  /** Number of staying items currently visible in viewport */
  visibleStayingCount: number;
  /** Total number of new items entering */
  enteringCount: number;
  /** Number of entering items currently visible in viewport */
  visibleEnteringCount: number;
  /** Number of entering items from TOP direction */
  enteringFromTopCount: number;
  /** Number of entering items from TOP direction that are visible */
  visibleEnteringFromTopCount: number;
  /** Number of entering items from BOTTOM direction */
  enteringFromBottomCount: number;
  /** Number of entering items from BOTTOM direction that are visible */
  visibleEnteringFromBottomCount: number;
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
  /** When entering items from TOP should start (after top-exits clear space) */
  entryFromTopStartDelay: number;
  /** When entering items from BOTTOM should start (after bottom-exits clear space) */
  entryFromBottomStartDelay: number;
}

/**
 * Calculate coordinated animation timing to eliminate gaps and overlaps.
 *
 * The strategy implements DIRECTIONAL SEQUENCING:
 * 1. TOP-exiting items slide up starting at 0ms with stagger (0, 50, 100, ...)
 * 2. BOTTOM-exiting items slide down starting at 0ms with stagger (0, 50, 100, ...)
 * 3. DOM updates after top/bottom exits clear space (around 60-70% through exit duration)
 * 4. FLIP animations start immediately for staying items
 * 5. TOP-entering items wait for top-exits to mostly clear, then slide down from top
 * 6. BOTTOM-entering items wait for bottom-exits to mostly clear, then slide up from bottom
 *
 * This prevents overlaps by ensuring:
 * - Items exiting from direction X don't compete with items entering from direction X
 * - Entering items wait for their corresponding exit direction to clear space
 * - Staying items animate smoothly while exits happen and entries wait
 */
export function calculateOverlapTiming(
  config: AnimationTimingConfig,
): AnimationTiming {
  const {
    removedFromTopCount,
    visibleRemovedFromTopCount,
    removedFromBottomCount,
    visibleRemovedFromBottomCount,
    enteringFromTopCount,
    visibleEnteringFromTopCount,
    enteringFromBottomCount,
    visibleEnteringFromBottomCount,
    staggerDelay,
    animationDuration,
  } = config;

  // Calculate exit timing for items exiting from TOP
  // These slide up and out immediately (stagger: 0, 50, 100, ...)
  const topExitDelays = Array.from({ length: removedFromTopCount }, (_, i) =>
    i < visibleRemovedFromTopCount ? i * staggerDelay : 0,
  );

  // Calculate exit timing for items exiting from BOTTOM
  // These slide down and out immediately (stagger: 0, 50, 100, ...)
  const bottomExitDelays = Array.from(
    { length: removedFromBottomCount },
    (_, i) => (i < visibleRemovedFromBottomCount ? i * staggerDelay : 0),
  );

  // Merge exit delays (order doesn't matter for exit timing)
  const exitDelays = [...topExitDelays, ...bottomExitDelays];

  // Calculate when exits complete for each direction
  const maxTopExitTime =
    visibleRemovedFromTopCount > 0
      ? (visibleRemovedFromTopCount - 1) * staggerDelay + animationDuration
      : 0;

  const maxBottomExitTime =
    visibleRemovedFromBottomCount > 0
      ? (visibleRemovedFromBottomCount - 1) * staggerDelay + animationDuration
      : 0;

  // DOM update happens after exits are mostly visible (around 60% through exit)
  const domUpdateTrigger = Math.min(
    animationDuration * 0.4, // Slightly later to ensure exits are visible
    180,
  );

  // FLIP animation starts at domUpdateTrigger (not 0) to prevent flicker
  // Staying items need the DOM to update first before FLIP can calculate positions
  const flipStartDelay = domUpdateTrigger;

  // Entry timing: Items from TOP wait for top-exits to fully complete
  // This prevents new top entries from overlapping with items exiting from top
  // If no items exit from top, entries can start after FLIP repositioning
  const entryFromTopStartDelay =
    removedFromTopCount > 0
      ? maxTopExitTime + staggerDelay // Wait for exits to complete, then start entries
      : Math.max(domUpdateTrigger + animationDuration * 0.5, staggerDelay); // No exits, wait for FLIP to progress

  // Entry timing: Items from BOTTOM wait for bottom-exits to fully complete
  // This prevents new bottom entries from overlapping with items exiting from bottom
  // If no items exit from bottom, entries can start after FLIP repositioning
  const entryFromBottomStartDelay =
    removedFromBottomCount > 0
      ? maxBottomExitTime + staggerDelay // Wait for exits to complete, then start entries
      : Math.max(domUpdateTrigger + animationDuration * 0.5, staggerDelay); // No exits, wait for FLIP to progress

  // Build entry delays with direction-specific start times
  const entryDelays: number[] = [];

  // Add delays for top-entering items (using entryFromTopStartDelay)
  for (let i = 0; i < enteringFromTopCount; i++) {
    const baseDelay =
      i < visibleEnteringFromTopCount
        ? entryFromTopStartDelay + i * staggerDelay
        : 0;
    entryDelays.push(baseDelay);
  }

  // Add delays for bottom-entering items (using entryFromBottomStartDelay)
  for (let i = 0; i < enteringFromBottomCount; i++) {
    const baseDelay =
      i < visibleEnteringFromBottomCount
        ? entryFromBottomStartDelay + i * staggerDelay
        : 0;
    entryDelays.push(baseDelay);
  }

  // Calculate maximum animation duration across all phases
  const maxTopEntryTime =
    visibleEnteringFromTopCount > 0
      ? entryFromTopStartDelay +
        (visibleEnteringFromTopCount - 1) * staggerDelay +
        animationDuration
      : 0;

  const maxBottomEntryTime =
    visibleEnteringFromBottomCount > 0
      ? entryFromBottomStartDelay +
        (visibleEnteringFromBottomCount - 1) * staggerDelay +
        animationDuration
      : 0;

  const maxDelay = Math.max(
    maxTopExitTime,
    maxBottomExitTime,
    maxTopEntryTime,
    maxBottomEntryTime,
    animationDuration,
  );

  return {
    domUpdateTrigger,
    flipStartDelay,
    totalDuration: maxDelay,
    exitDelays,
    entryDelays,
    maxDelay,
    entryFromTopStartDelay,
    entryFromBottomStartDelay,
  };
}
