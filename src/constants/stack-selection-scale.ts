/**
 * Stack node selection scale constant - single source of truth
 * When a stack node is selected, it scales to this multiplier (e.g., 1.1 = 10% larger)
 * Applied to both visual SVG transform and D3 physics collision detection
 */
export const STACK_SELECTION_SCALE = 1.1 as const;
