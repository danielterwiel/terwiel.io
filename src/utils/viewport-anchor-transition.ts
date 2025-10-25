import type { Project } from "~/types";

/**
 * Determines if an item's viewport position has changed despite staying in the list.
 * This is crucial for staying items that need FLIP animation.
 */
interface StayingItemFlipInfo {
  itemId: string;
  shouldFlip: boolean;
  oldViewportIndex: number;
  newViewportIndex: number;
}

/**
 * Information about items visible in viewport before the transition
 */
interface ViewportAnchorInfo {
  /** IDs of items currently visible in viewport */
  visibleItemIds: Set<string>;
  /** Map of item ID to its viewport position (0 = top, 1 = second, etc.) */
  viewportPositions: Map<string, number>;
  /** The "anchor" - ideally the first visible staying item */
  anchorItemId: string | null;
}

/**
 * Enhanced transition plan that considers viewport anchoring
 */
interface ViewportAwareTransitionPlan {
  itemId: string;
  action: "stay" | "slide-out" | "slide-in" | "fade";
  direction?: "top" | "bottom";
  isViewportAnchor?: boolean;
  /** For staying items: whether their viewport position changed */
  shouldFlip?: boolean;
  /** Whether this item is currently visible in viewport (for animation decisions) */
  isVisible?: boolean;
  /** Whether this item should animate (false = snap instantly) */
  shouldAnimate?: boolean;
}

/**
 * Analyzes current viewport state to find anchor items.
 * Returns the first VISIBLE staying item, or the first staying item if none are visible.
 *
 * The anchor item is crucial because:
 * - Items above it should slide UP when removed, slide DOWN when entering
 * - Items below it should slide DOWN when removed, slide UP when entering
 * - The anchor item itself should remain visually static (scale animation only)
 *
 * IMPORTANT: We prioritize VISIBLE staying items because the anchor should be
 * something the user can see. We capture visibleOldItemIds at animation start
 * to ensure consistency throughout the transition.
 */
export function findViewportAnchor(
  oldItems: Project[],
  newItems: Project[],
  visibleOldItemIds: Set<string>,
): ViewportAnchorInfo {
  const stayingItemIds = new Set<string>();
  const stayingOldIndices = new Map<string, number>();

  // Find staying items and their old indices
  for (let i = 0; i < oldItems.length; i++) {
    const oldItem = oldItems[i];
    if (oldItem && newItems.some((ni) => ni.id === oldItem.id)) {
      stayingItemIds.add(oldItem.id);
      stayingOldIndices.set(oldItem.id, i);
    }
  }

  // Track visible staying items
  const visibleStayingItems: { itemId: string; oldIndex: number }[] = [];
  for (let i = 0; i < oldItems.length; i++) {
    const item = oldItems[i];
    if (item && stayingItemIds.has(item.id) && visibleOldItemIds.has(item.id)) {
      visibleStayingItems.push({ itemId: item.id, oldIndex: i });
    }
  }

  // CRITICAL: Prioritize first VISIBLE staying item as anchor
  // This ensures the anchor is something the user can actually see
  let anchorItemId: string | null = null;
  if (visibleStayingItems.length > 0) {
    anchorItemId = visibleStayingItems[0]?.itemId ?? null;
  } else {
    // Fallback: if no visible staying items, use first staying item
    for (const item of oldItems) {
      if (item && stayingItemIds.has(item.id)) {
        anchorItemId = item.id;
        break;
      }
    }
  }

  console.log(
    "%c[VIEWPORT-ANCHOR] Staying items: %O, Visible staying items: %O, Anchor (first visible staying): %s",
    "color: #667EEA",
    Array.from(stayingItemIds),
    visibleStayingItems.map((v) => v.itemId),
    anchorItemId ?? "null",
  );

  // Build viewport positions for visible items in the old list
  const viewportPositions = new Map<string, number>();
  let viewportIndex = 0;
  for (const item of oldItems) {
    if (item && visibleOldItemIds.has(item.id)) {
      viewportPositions.set(item.id, viewportIndex);
      viewportIndex++;
    }
  }

  return {
    visibleItemIds: visibleOldItemIds,
    viewportPositions,
    anchorItemId,
  };
}

/**
 * Determines direction for items relative to a viewport anchor.
 *
 * Given an anchor item that's visible in the viewport:
 * - Items with lower indices (above in list) → "top"
 * - Items with higher indices (below in list) → "bottom"
 * - Items between staying items → detect based on which staying item is closer
 */
function getDirectionRelativeToAnchor(
  itemIndex: number,
  anchorIndex: number,
): "top" | "bottom" {
  return itemIndex < anchorIndex ? "top" : "bottom";
}

/**
 * Determines which staying items changed their viewport position.
 * These items will need FLIP animation.
 *
 * NOTE: We can only reliably detect FLIP needs for items that were visible BEFORE.
 * Items that become newly visible or invisible can't be predicted, so we leave
 * that to the FLIP logic in projects.tsx which has access to actual DOM measurements.
 */
export function findStayingItemsNeedingFlip(
  _oldItems: Project[],
  _newItems: Project[],
  anchorInfo: ViewportAnchorInfo,
): StayingItemFlipInfo[] {
  // This function is currently unused - FLIP detection happens in projects.tsx
  // with actual DOM measurements after the DOM updates.
  // We keep this for documentation and potential future use.

  const flipItems: StayingItemFlipInfo[] = [];

  // Only items that were visible in the old list are candidates for FLIP
  // Items that are newly visible or newly invisible need actual DOM measurements
  for (const [itemId, oldViewportIndex] of anchorInfo.viewportPositions) {
    // Without knowing the actual new viewport state (which requires DOM measurements),
    // we can only mark all previously visible staying items for potential FLIP
    // The actual FLIP animation decision happens in projects.tsx Phase 4
    flipItems.push({
      itemId,
      shouldFlip: true, // Will be determined by FLIP logic based on actual positions
      oldViewportIndex,
      newViewportIndex: -1, // Unknown until DOM updates
    });
  }

  return flipItems;
}

/**
 * Detects if this is a single-result scenario that needs special handling.
 *
 * Special Case: When filtering results in a single item that's already in the viewport
 * but not at the top, it should slide to the top of the viewport to maximize visibility.
 *
 * Returns: { isSingleResult: boolean, shouldSlideToTop: boolean, itemId: string | null }
 */
export function detectSingleResultCase(
  oldItems: Project[],
  newItems: Project[],
  visibleOldItemIds: Set<string>,
): {
  isSingleResult: boolean;
  shouldSlideToTop: boolean;
  itemId: string | null;
} {
  // Not a single result case
  if (newItems.length !== 1) {
    return { isSingleResult: false, shouldSlideToTop: false, itemId: null };
  }

  const singleItem = newItems[0];
  if (!singleItem) {
    return { isSingleResult: false, shouldSlideToTop: false, itemId: null };
  }

  // Single result exists - check if it was visible and not already at top
  const wasVisible = visibleOldItemIds.has(singleItem.id);
  const oldIndex = oldItems.findIndex((item) => item?.id === singleItem.id);
  const wasAtTop = oldIndex === 0;

  // Should slide to top if it was visible but not at the top position
  const shouldSlideToTop = wasVisible && !wasAtTop;

  console.log(
    "%c[SINGLE-RESULT] Detected: item=%s, wasVisible=%s, oldIndex=%d, shouldSlideToTop=%s",
    "color: #FF6B6B",
    singleItem.id,
    wasVisible,
    oldIndex,
    shouldSlideToTop,
  );

  return {
    isSingleResult: true,
    shouldSlideToTop,
    itemId: singleItem.id,
  };
}

/**
 * Plans viewport-aware transitions that prevent overlaps.
 *
 * Strategy:
 * 1. Check for single-result special case first
 * 2. Find the anchor item (first visible staying item)
 * 3. For each old item:
 *    - If staying AND visible: keep in place (scale animation only)
 *    - If staying but NOT visible: can snap to new position instantly
 *    - If exiting AND visible: animate out in direction relative to anchor
 *    - If exiting but NOT visible: remove instantly
 * 4. For each new item:
 *    - If entering AND will be visible: animate in from direction relative to anchor
 *    - If entering but NOT visible: add instantly
 *    - Wait for exits to complete before entries start
 *
 * KEY BEHAVIORS:
 * - Visible staying items remain visually static (scale animation only)
 * - Off-viewport items snap instantly (no animation overhead)
 * - Entries wait for exits to complete (no overlaps)
 */
export function planViewportAwareTransition(
  oldItems: Project[],
  newItems: Project[],
  visibleOldItemIds: Set<string>,
): {
  plan: ViewportAwareTransitionPlan[];
  anchor: ViewportAnchorInfo;
  flipItems: StayingItemFlipInfo[];
  singleResultCase: ReturnType<typeof detectSingleResultCase>;
} {
  // STEP 1: Check for single-result special case
  const singleResultCase = detectSingleResultCase(
    oldItems,
    newItems,
    visibleOldItemIds,
  );

  const anchor = findViewportAnchor(oldItems, newItems, visibleOldItemIds);
  const flipItems = findStayingItemsNeedingFlip(oldItems, newItems, anchor);

  const plan: ViewportAwareTransitionPlan[] = [];

  // Find staying item IDs and their new indices
  const stayingItemIds = new Set<string>();
  const stayingNewIndices = new Map<string, number>();

  for (let i = 0; i < newItems.length; i++) {
    const newItem = newItems[i];
    if (newItem && oldItems.some((oi) => oi.id === newItem.id)) {
      stayingItemIds.add(newItem.id);
      stayingNewIndices.set(newItem.id, i);
    }
  }

  // Plan for old items
  for (let i = 0; i < oldItems.length; i++) {
    const oldItem = oldItems[i];
    if (!oldItem) continue;

    const isVisible = visibleOldItemIds.has(oldItem.id);

    if (stayingItemIds.has(oldItem.id)) {
      // Staying item
      const isAnchor = oldItem.id === anchor.anchorItemId;
      const flipInfo = flipItems.find((fi) => fi.itemId === oldItem.id);
      plan.push({
        itemId: oldItem.id,
        action: "stay",
        // CRITICAL: Never FLIP the anchor item - it stays visually static in the viewport
        shouldFlip: isAnchor ? false : (flipInfo?.shouldFlip ?? false),
        isViewportAnchor: isAnchor,
        isVisible,
        // Staying items that are visible should animate (scale), off-viewport should snap
        shouldAnimate: isVisible,
      });
    } else {
      // Exiting item
      if (!anchor.anchorItemId) {
        // No visible anchor - default to previous behavior
        plan.push({
          itemId: oldItem.id,
          action: "slide-out",
          direction: i < (oldItems.length - 1) / 2 ? "top" : "bottom",
          isVisible,
          // Only animate visible items; off-viewport items snap instantly
          shouldAnimate: isVisible,
        });
      } else {
        // Find anchor index
        const anchorIndex = oldItems.findIndex(
          (item) => item?.id === anchor.anchorItemId,
        );
        const direction = getDirectionRelativeToAnchor(i, anchorIndex);

        plan.push({
          itemId: oldItem.id,
          action: "slide-out",
          direction,
          isVisible,
          // Only animate visible items; off-viewport items snap instantly
          shouldAnimate: isVisible,
        });
      }
    }
  }

  // Plan for new items
  // Note: We don't know which NEW items will be visible in the viewport yet,
  // but we can make an educated guess based on their position relative to the anchor
  for (let i = 0; i < newItems.length; i++) {
    const newItem = newItems[i];
    if (!newItem) continue;

    if (!stayingItemIds.has(newItem.id)) {
      // Entering item
      // Heuristic: items near the anchor are more likely to be visible
      const anchorNewIndex = anchor.anchorItemId
        ? newItems.findIndex((item) => item?.id === anchor.anchorItemId)
        : -1;

      // Consider items within a reasonable range of the anchor as "likely visible"
      // This is a heuristic since we don't have actual viewport measurements yet
      const isLikelyVisible =
        anchorNewIndex !== -1 && Math.abs(i - anchorNewIndex) <= 3;

      if (!anchor.anchorItemId) {
        // No visible anchor - default
        plan.push({
          itemId: newItem.id,
          action: "slide-in",
          direction: i < (newItems.length - 1) / 2 ? "top" : "bottom",
          isVisible: false, // Unknown
          shouldAnimate: isLikelyVisible, // Animate if likely visible
        });
      } else {
        // Find anchor index in new list
        const anchorIndex = newItems.findIndex(
          (item) => item?.id === anchor.anchorItemId,
        );
        const direction = getDirectionRelativeToAnchor(i, anchorIndex);

        plan.push({
          itemId: newItem.id,
          action: "slide-in",
          direction,
          isVisible: false, // Unknown until after DOM update
          shouldAnimate: isLikelyVisible, // Animate if likely visible
        });
      }
    }
  }

  return { plan, anchor, flipItems, singleResultCase };
}
