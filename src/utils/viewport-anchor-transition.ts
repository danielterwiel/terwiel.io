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
  /** For entering/exiting: whether they're in the viewport boundary */
  isInViewportBoundary?: boolean;
}

/**
 * Analyzes current viewport state to find anchor items.
 * Returns the first staying item visible in the viewport, or null if none are visible.
 *
 * The anchor item is crucial because:
 * - Items above it should slide UP when removed, slide DOWN when entering
 * - Items below it should slide DOWN when removed, slide UP when entering
 * - The anchor item itself uses FLIP if its visual position changed
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

  // Find visible staying items in order
  const visibleStayingItems: { itemId: string; oldIndex: number }[] = [];
  for (let i = 0; i < oldItems.length; i++) {
    const item = oldItems[i];
    if (item && stayingItemIds.has(item.id) && visibleOldItemIds.has(item.id)) {
      visibleStayingItems.push({ itemId: item.id, oldIndex: i });
    }
  }

  // The anchor is the first visible staying item
  const anchorItemId = visibleStayingItems[0]?.itemId ?? null;

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
 * Plans viewport-aware transitions that prevent overlaps.
 *
 * Strategy:
 * 1. Find the anchor item (first visible staying item)
 * 2. For each old item:
 *    - If staying: mark for FLIP if viewport position changed
 *    - If exiting: determine direction relative to anchor
 * 3. For each new item:
 *    - If entering: determine direction relative to anchor
 *    - Wait for opposite-direction exits to complete
 */
export function planViewportAwareTransition(
  oldItems: Project[],
  newItems: Project[],
  visibleOldItemIds: Set<string>,
): {
  plan: ViewportAwareTransitionPlan[];
  anchor: ViewportAnchorInfo;
  flipItems: StayingItemFlipInfo[];
} {
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

    if (stayingItemIds.has(oldItem.id)) {
      // Staying item
      const flipInfo = flipItems.find((fi) => fi.itemId === oldItem.id);
      plan.push({
        itemId: oldItem.id,
        action: "stay",
        shouldFlip: flipInfo?.shouldFlip ?? false,
        isViewportAnchor: oldItem.id === anchor.anchorItemId,
      });
    } else {
      // Exiting item
      if (!anchor.anchorItemId) {
        // No visible anchor - default to previous behavior
        plan.push({
          itemId: oldItem.id,
          action: "slide-out",
          direction: i < (oldItems.length - 1) / 2 ? "top" : "bottom",
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
          isInViewportBoundary: anchor.visibleItemIds.has(oldItem.id),
        });
      }
    }
  }

  // Plan for new items
  for (let i = 0; i < newItems.length; i++) {
    const newItem = newItems[i];
    if (!newItem) continue;

    if (!stayingItemIds.has(newItem.id)) {
      // Entering item
      if (!anchor.anchorItemId) {
        // No visible anchor - default
        plan.push({
          itemId: newItem.id,
          action: "slide-in",
          direction: i < (newItems.length - 1) / 2 ? "top" : "bottom",
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
        });
      }
    }
  }

  return { plan, anchor, flipItems };
}
