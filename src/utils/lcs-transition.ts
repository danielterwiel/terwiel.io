import type { Project } from "~/types";

interface LCSResult {
  commonItems: string[];
  oldIndices: number[];
  newIndices: number[];
}

interface TransitionPlan {
  item: string;
  project: Project;
  action: "stay" | "slide-out" | "slide-in" | "fade";
  oldIndex?: number;
  newIndex?: number;
  direction?: "top" | "bottom";
}

/**
 * Longest Common Subsequence algorithm using Dynamic Programming
 * Time complexity: O(n×m) where n and m are the lengths of the two arrays
 */
export function computeLCS(
  oldItems: Project[],
  newItems: Project[],
): LCSResult {
  const m = oldItems.length;
  const n = newItems.length;

  const dp = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0));

  // Build the LCS table
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const row = dp[i];
      const prevRow = dp[i - 1];
      if (!row || !prevRow) continue;

      if (oldItems[i - 1]?.id === newItems[j - 1]?.id) {
        row[j] = (prevRow[j - 1] ?? 0) + 1;
      } else {
        row[j] = Math.max(prevRow[j] ?? 0, row[j - 1] ?? 0);
      }
    }
  }

  // Reconstruct the LCS
  const commonItems: string[] = [];
  const oldIndices: number[] = [];
  const newIndices: number[] = [];

  let i = m;
  let j = n;
  while (i > 0 && j > 0) {
    const oldItem = oldItems[i - 1];
    const newItem = newItems[j - 1];

    if (oldItem?.id === newItem?.id && oldItem?.id) {
      commonItems.unshift(oldItem.id);
      oldIndices.unshift(i - 1);
      newIndices.unshift(j - 1);
      i--;
      j--;
    } else if ((dp[i - 1]?.[j] ?? 0) > (dp[i]?.[j - 1] ?? 0)) {
      i--;
    } else {
      j--;
    }
  }

  return { commonItems, oldIndices, newIndices };
}

/**
 * Determine the relative position of a target index compared to staying items
 * Returns: "above" | "below" | "between-then-below" | "between-then-above" | "none"
 *
 * For items between staying items, we need to know which direction they should slide:
 * - "between-then-below": There are staying items after, so slide UP from below
 * - "between-then-above": There are staying items before, so slide DOWN from above
 */
function getRelativePosition(
  targetIndex: number,
  stayingIndices: number[],
): "above" | "below" | "between-then-below" | "between-then-above" | "none" {
  if (stayingIndices.length === 0) return "none";

  const before = stayingIndices.filter((idx) => idx < targetIndex);
  const after = stayingIndices.filter((idx) => idx > targetIndex);

  const hasBefore = before.length > 0;
  const hasAfter = after.length > 0;

  if (hasBefore && hasAfter) {
    // Item is between two staying items
    // If there are more staying items after, it's in a "below" gap (slide up)
    // If there are more staying items before, it's in an "above" gap (slide down)
    // Return the direction to closest staying item
    const closestBeforeIdx = before[before.length - 1] ?? -Infinity;
    const closestAfterIdx = after[0] ?? Infinity;
    const distToBefore = targetIndex - closestBeforeIdx;
    const distToAfter = closestAfterIdx - targetIndex;

    if (distToAfter < distToBefore) {
      // Closer to the item after → slide UP from bottom to fill gap
      return "between-then-below";
    } else {
      // Closer to item before → slide DOWN from top to fill gap
      return "between-then-above";
    }
  }
  if (hasBefore) {
    return "below"; // Below the last staying item
  }
  if (hasAfter) {
    return "above"; // Above the first staying item
  }

  return "none";
}

/**
 * Plan the transition animation for each item with intelligent directional sliding
 *
 * Directional Logic:
 * ==================
 * Given a staying item (★), items slide away from/towards it:
 *
 * OLD LIST SLIDE-OUT:
 *   Item A  ↑ (slides UP to top)
 *   Item B  ↑ (slides UP to top)
 *   Item C  ★ (stays - bump animation or FLIP)
 *   Item D  ↓ (slides DOWN to bottom)
 *   Item E  ↓ (slides DOWN to bottom)
 *
 * NEW LIST SLIDE-IN:
 *   Item X  ↓ (slides DOWN from top)
 *   Item Y  ↓ (slides DOWN from top)
 *   Item C  ★ (stays - already in position)
 *   Item Z  ↑ (slides UP from bottom)
 *   Item W  ↑ (slides UP from bottom)
 */
export function planTransition(
  oldItems: Project[],
  newItems: Project[],
): {
  oldPlan: TransitionPlan[];
  newPlan: TransitionPlan[];
  stayingItems: Set<string>;
} {
  const { commonItems, oldIndices, newIndices } = computeLCS(
    oldItems,
    newItems,
  );

  const oldPlan: TransitionPlan[] = [];
  const newPlan: TransitionPlan[] = [];

  const stayingItems = new Set(commonItems);

  // Debug logging
  console.log(
    "%c[LCS] Transition Plan",
    "color: #FF6B6B; font-weight: bold; font-size: 12px",
  );
  console.log(
    "%cOld items: %O",
    "color: #FF8C42",
    oldItems.map((p) => p.id),
  );
  console.log(
    "%cNew items: %O",
    "color: #2ECE71",
    newItems.map((p) => p.id),
  );
  console.log("%cCommon (staying): %O", "color: #4D96FF", commonItems);
  console.log(
    "%cOld indices: %O, New indices: %O",
    "color: #A29BFE",
    oldIndices,
    newIndices,
  );

  // Plan for old items (items to remove or keep)
  for (let i = 0; i < oldItems.length; i++) {
    const commonIndex = oldIndices.indexOf(i);
    const project = oldItems[i];

    if (!project) continue;

    if (commonIndex !== -1) {
      // Item stays
      oldPlan.push({
        item: project.id,
        project,
        action: "stay",
        oldIndex: i,
        newIndex: newIndices[commonIndex],
      });
    } else {
      // Item is removed - determine action and direction
      const position = getRelativePosition(i, oldIndices);

      if (
        position === "between-then-below" ||
        position === "between-then-above"
      ) {
        // Fade items between two staying items
        oldPlan.push({
          item: project.id,
          project,
          action: "fade",
          oldIndex: i,
        });
      } else {
        // Slide items above/below staying items
        // Items above staying items slide UP (to top)
        // Items below staying items slide DOWN (to bottom)
        const direction = position === "above" ? "top" : "bottom";

        oldPlan.push({
          item: project.id,
          project,
          action: "slide-out",
          oldIndex: i,
          direction,
        });
      }
    }
  }

  // Plan for new items (items to add)
  const stayingNewIndices = newIndices.slice();

  for (let j = 0; j < newItems.length; j++) {
    const project = newItems[j];
    if (!project) continue;

    if (!stayingItems.has(project.id)) {
      // Item is new - determine slide direction
      const position = getRelativePosition(j, stayingNewIndices);

      // Determine slide direction based on position
      let direction: "top" | "bottom";

      if (position === "above") {
        direction = "top"; // Slide in from top (downward)
      } else if (position === "below") {
        direction = "bottom"; // Slide in from bottom (upward)
      } else if (position === "between-then-above") {
        // Closer to item before → slide DOWN from top to fill gap
        direction = "top";
      } else if (position === "between-then-below") {
        // Closer to item after → slide UP from bottom to fill gap
        direction = "bottom";
      } else {
        // No staying items - default to top
        direction = "top";
      }

      newPlan.push({
        item: project.id,
        project,
        action: "slide-in",
        newIndex: j,
        direction,
      });
    }
  }

  // Log transition details
  console.log(
    "%c[LCS] Old Plan (slide-out/fade/stay): %O",
    "color: #FF8C42",
    oldPlan,
  );
  console.log(
    "%c[LCS] New Plan (slide-in/stay): %O",
    "color: #2ECE71",
    newPlan,
  );
  console.log(
    "%c[LCS] Staying items count: %d, Entering items: %d, Exiting items: %d",
    "color: #4D96FF",
    stayingItems.size,
    newPlan.filter((p) => p.action === "slide-in").length,
    oldPlan.filter((p) => p.action === "slide-out" || p.action === "fade")
      .length,
  );

  return { oldPlan, newPlan, stayingItems };
}
