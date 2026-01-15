import type { StackName } from "./icon";
import type { Domain } from "./project";

/**
 * Represents a technology in the stack visualization.
 *
 * ## Data Structure Design
 *
 * This type is optimized for a CSS Grid-based visualization that replaced
 * the previous D3.js force-directed graph. The structure supports:
 *
 * 1. **Visual Grouping**: Stacks are grouped by `domain` for CSS Grid layout.
 *    The grid uses `auto-fit` with `minmax(140px, 1fr)` for responsive columns.
 *
 * 2. **Hierarchical Relationships**: The `parent` field links child technologies
 *    to their parent (e.g., "Tanstack Query" → "Tanstack"). The visualization
 *    merges children with parents, showing only the parent node.
 *
 * 3. **Accessibility**: Each stack renders as a 44x44px minimum touch target
 *    (WCAG 2.2 SC 2.5.8) with proper ARIA labels and keyboard navigation.
 *
 * ## Layout Strategy
 *
 * The CSS Grid layout uses browser-native auto-fit rather than explicit
 * grid positions. This approach was chosen for:
 * - Better responsive behavior (automatic column count adjustment)
 * - Simpler data structure (no positional metadata needed)
 * - Native performance (layout computed by CSS engine, not JavaScript)
 *
 * Domain groups are ordered by total experience (descending), computed from
 * project date ranges. See `calculateDomainExperiences()` for the algorithm.
 *
 * @see src/components/stack-cloud-css/stack-cloud-content.tsx - Main visualization
 * @see src/utils/extract-stacks.ts - Stack extraction and parent merging
 * @see src/utils/calculate-domain-size.ts - Domain experience calculation
 */
export type Stack = {
  /** Normalized URL-friendly slug (e.g., "react", "typescript", "tanstack-query") */
  id: string;

  /** Display name shown in the UI (e.g., "React", "TypeScript", "Tanstack Query") */
  name: StackName;

  /** Icon component key from src/data/icons.ts (e.g., "BrandReact") */
  iconKey: string;

  /** Hex color for the technology icon (e.g., "#61DAFB" for React blue) */
  color: string;

  /**
   * Domain category for visual grouping.
   * Stacks with the same domain are rendered together in the CSS Grid.
   * Valid values: "Front-end" | "Back-end" | "DevOps" | "Design" | "QA" | "AI"
   */
  domain: Domain;

  /**
   * Optional parent technology name for hierarchical grouping.
   * When set, this stack is merged with its parent in the visualization.
   *
   * Example hierarchies:
   * - Tanstack → Tanstack Query, Tanstack Router, Tanstack Start, Tanstack DB
   * - Redux → Redux-saga
   * - SQL → SQL Server
   * - React → Preact
   */
  parent?: string;
};

/**
 * Configuration for CSS Grid layout of domain groups.
 * Used by the visualization to determine grid behavior.
 *
 * Note: Explicit grid positions are NOT used. The CSS Grid auto-fit algorithm
 * handles column distribution automatically. This config documents the approach.
 */
export type StackGridConfig = {
  /**
   * Minimum column width in pixels.
   * Default: 140px (ensures readable stack items on mobile)
   */
  minColumnWidth: number;

  /**
   * Gap between grid items in pixels.
   * Mobile: 4px, Desktop (md+): 6px
   */
  gap: {
    mobile: number;
    desktop: number;
  };

  /**
   * Whether to use CSS Grid auto-fit (true) or explicit column count (false).
   * Currently always true for responsive behavior.
   */
  useAutoFit: boolean;
};

/**
 * Default grid configuration used by StackCloudContent.
 * Matches the CSS values in the component.
 */
export const DEFAULT_STACK_GRID_CONFIG: StackGridConfig = {
  minColumnWidth: 140,
  gap: { mobile: 4, desktop: 6 },
  useAutoFit: true,
};
