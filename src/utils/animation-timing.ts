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
  /** ID of the viewport anchor item (stays static, no FLIP animation) */
  anchorItemId?: string | null;
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
  /** ID of the viewport anchor item (stays static, no FLIP animation) */
  anchorItemId?: string | null;
  /** Phase duration: exit animations only */
  exitPhaseDuration?: number;
  /** Phase duration: FLIP and entry animations */
  entryPhaseDuration?: number;
  /** Train effect enabled: entering items start at same time as exiting items */
  trainEffect?: boolean;
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
    anchorItemId,
  } = config;

  // DOM update trigger for train effect - calculated first, used in all delays
  // This is the time when new items appear in DOM and animations can begin
  // We use 50ms to give the browser time to render without making it too slow
  const DOM_UPDATE_TRIGGER = 50;

  // For train effect: exits also start AFTER DOM update so entries can start simultaneously
  // Calculate exit timing for items exiting from TOP
  // Start after DOM update, then stagger (domUpdateTrigger: 0, +50ms: 50, +100ms: 100, ...)
  const topExitDelays = Array.from({ length: removedFromTopCount }, (_, i) => {
    if (i < visibleRemovedFromTopCount) {
      // DOM_UPDATE_TRIGGER + stagger index * staggerDelay
      return DOM_UPDATE_TRIGGER + i * staggerDelay;
    }
    return 0;
  });

  // Calculate exit timing for items exiting from BOTTOM
  // Start after DOM update, then stagger
  const bottomExitDelays = Array.from(
    { length: removedFromBottomCount },
    (_, i) => {
      if (i < visibleRemovedFromBottomCount) {
        return DOM_UPDATE_TRIGGER + i * staggerDelay;
      }
      return 0;
    },
  );

  // Merge exit delays (order doesn't matter for exit timing)
  const exitDelays = [...topExitDelays, ...bottomExitDelays];

  // Calculate when exits complete for each direction
  // Note: starts at DOM_UPDATE_TRIGGER, not 0
  const maxTopExitTime =
    visibleRemovedFromTopCount > 0
      ? DOM_UPDATE_TRIGGER +
        (visibleRemovedFromTopCount - 1) * staggerDelay +
        animationDuration
      : 0;

  const maxBottomExitTime =
    visibleRemovedFromBottomCount > 0
      ? DOM_UPDATE_TRIGGER +
        (visibleRemovedFromBottomCount - 1) * staggerDelay +
        animationDuration
      : 0;

  // domUpdateTrigger: the critical timing for train effect
  // This is when the DOM updates and new items appear
  // All animations start after this point
  const domUpdateTrigger = DOM_UPDATE_TRIGGER;

  // FLIP animation starts right after DOM update
  // Staying items need the DOM to update first before FLIP can calculate positions
  const flipStartDelay = domUpdateTrigger;

  // Entry timing: TRAIN EFFECT - items should START entering AT THE SAME TIME
  // as their corresponding exiting items, creating a seamless "train" effect
  // This prevents any whitespace gaps in the viewport
  // Both exits and entries wait until after DOM update, then animate in parallel
  // Entering items start with the same stagger index (0, 50, 100, ...) as exits
  // This makes them slide through at the exact same speed/timing
  const entryFromTopStartDelay = domUpdateTrigger; // Start after DOM update
  const entryFromBottomStartDelay = domUpdateTrigger; // Start after DOM update

  // Build entry delays: each entering item gets the SAME delay as its paired exiting item
  // This creates the "train" effect where exits and entries animate in perfect sync
  // Both start after DOM update, with matching stagger indices
  const entryDelays: number[] = [];

  // Add delays for top-entering items (start at DOM_UPDATE_TRIGGER + stagger)
  for (let i = 0; i < enteringFromTopCount; i++) {
    const baseDelay =
      i < visibleEnteringFromTopCount
        ? DOM_UPDATE_TRIGGER + i * staggerDelay
        : 0;
    entryDelays.push(baseDelay);
  }

  // Add delays for bottom-entering items (start at DOM_UPDATE_TRIGGER + stagger)
  for (let i = 0; i < enteringFromBottomCount; i++) {
    const baseDelay =
      i < visibleEnteringFromBottomCount
        ? DOM_UPDATE_TRIGGER + i * staggerDelay
        : 0;
    entryDelays.push(baseDelay);
  }

  // Calculate maximum animation duration across all phases
  // Entries start at DOM_UPDATE_TRIGGER (same as exits for train effect)
  const maxTopEntryTime =
    visibleEnteringFromTopCount > 0
      ? DOM_UPDATE_TRIGGER +
        (visibleEnteringFromTopCount - 1) * staggerDelay +
        animationDuration
      : 0;

  const maxBottomEntryTime =
    visibleEnteringFromBottomCount > 0
      ? DOM_UPDATE_TRIGGER +
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

  // Calculate phase durations for clearer animation flow
  // With train effect: exits and entries happen in parallel, so total duration is max of both
  const exitPhaseDuration = Math.max(maxTopExitTime, maxBottomExitTime);
  const entryPhaseDuration = Math.max(maxTopEntryTime, maxBottomEntryTime);

  return {
    domUpdateTrigger,
    flipStartDelay,
    totalDuration: maxDelay,
    exitDelays,
    entryDelays,
    maxDelay,
    entryFromTopStartDelay,
    entryFromBottomStartDelay,
    anchorItemId,
    exitPhaseDuration,
    entryPhaseDuration,
    trainEffect: true, // Train effect is now always enabled for smooth transitions
  };
}
