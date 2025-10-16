import { useMemo } from "react";

import type { Domain } from "~/types";

import {
  DOMAIN_BORDERS_SUBTLE_HEX,
  DOMAIN_COLORS_HEX,
  DOMAIN_COLORS_HIGH_CONTRAST_HEX,
  FOCUS_COLOR_HEX,
  KLEIN_BLUE_HEX,
  NEUTRAL_INK_HEX,
  PRIMARY_COLOR_HEX,
} from "~/constants/colors";
import { useForcedColors } from "./use-forced-colors";
import { usePrefersContrast } from "./use-prefers-contrast";
import { usePrefersReducedMotion } from "./use-prefers-reduced-motion";

/**
 * Unified accessibility hook that provides adapted colors and settings
 * based on user preferences (reduced motion, high contrast, forced colors)
 */
export function useAccessibility() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const prefersContrast = usePrefersContrast();
  const forcedColors = useForcedColors();

  return useMemo(() => {
    // Determine which color palette to use
    // For SVG compatibility (especially iOS Safari), use hex fallbacks
    const domainColors =
      prefersContrast || forcedColors
        ? DOMAIN_COLORS_HIGH_CONTRAST_HEX
        : DOMAIN_COLORS_HEX;

    // Get color by domain
    const getDomainColor = (domain: Domain) => domainColors[domain];

    // Get border color with refined strategy:
    // - Default: subtle tinted border matching domain hue
    // - Active (hover/selected): full domain color
    // - Forced colors: system color
    const getBorderColor = (domain: Domain, isActive: boolean) => {
      if (forcedColors) return "CanvasText";
      if (prefersContrast) {
        // High contrast mode: always use saturated colors, but vary opacity
        return domainColors[domain];
      }
      // Normal mode: subtle tinted border for default, full color for active
      return isActive
        ? domainColors[domain]
        : DOMAIN_BORDERS_SUBTLE_HEX[domain];
    };

    // Get fill color
    const getFillColor = () => {
      if (forcedColors) return "Canvas";
      return "white";
    };

    // Get icon color and opacity
    // Enhanced contrast for selected/highlighted states per WCAG 2.2 guidelines
    // Balanced for aesthetics while maintaining accessibility
    const getIconStyle = (
      domain: Domain,
      state: "default" | "highlighted" | "selected",
    ) => {
      if (forcedColors) {
        return { color: "CanvasText", opacity: 1 };
      }

      switch (state) {
        case "selected":
          return {
            color: prefersContrast
              ? DOMAIN_COLORS_HIGH_CONTRAST_HEX[domain]
              : DOMAIN_COLORS_HEX[domain],
            opacity: 1, // Full opacity for selected - maximum visibility
          };
        case "highlighted":
          return {
            color: prefersContrast
              ? DOMAIN_COLORS_HIGH_CONTRAST_HEX[domain]
              : DOMAIN_COLORS_HEX[domain],
            opacity: 0.92, // High opacity for hover
          };
        default:
          return {
            color: prefersContrast ? NEUTRAL_INK_HEX : domainColors[domain],
            opacity: prefersContrast ? 1 : 0.65, // Reduced for stronger contrast with selected
          };
      }
    };

    // Get border width based on state
    // Subtle by default, progressively stronger for interaction states
    // Minimum 1.5px to ensure visibility on iOS Safari (1px strokes don't render reliably)
    // Selected state has strong border for a11y (3:1 contrast minimum)
    const getBorderWidth = (state: "default" | "highlighted" | "selected") => {
      if (prefersContrast) {
        // High contrast mode: thicker borders overall
        switch (state) {
          case "selected":
            return 3.5;
          case "highlighted":
            return 2.5;
          default:
            return 2;
        }
      }
      // Normal mode: subtle default, strong selected for a11y
      switch (state) {
        case "selected":
          return 3; // Increased from 2.5 for better a11y contrast (3:1 ratio)
        case "highlighted":
          return 2;
        default:
          return 1.5; // Minimum 1.5px for iOS Safari compatibility
      }
    };

    // Get focus indicator color
    const getFocusColor = () => {
      if (forcedColors) return "CanvasText";
      return FOCUS_COLOR_HEX;
    };

    // Get transition duration (0 if motion reduced)
    const getTransitionDuration = (durationMs = 300) => {
      return prefersReducedMotion ? 0 : durationMs;
    };

    // Should show glow effects
    const shouldShowGlow = !forcedColors;

    // Should show selection indicator (checkmark)
    const shouldShowSelectionIndicator = !forcedColors;

    // CSS class modifiers based on preferences
    const getStateClasses = (state: {
      selected?: boolean;
      highlighted?: boolean;
      focused?: boolean;
    }) => {
      const classes: string[] = [];
      if (state.selected) classes.push("is-selected");
      if (state.highlighted) classes.push("is-highlighted");
      if (state.focused) classes.push("is-focused");
      if (prefersReducedMotion) classes.push("prefers-reduced-motion");
      if (prefersContrast) classes.push("prefers-contrast");
      if (forcedColors) classes.push("forced-colors");
      return classes.join(" ");
    };

    return {
      // User preferences
      prefersReducedMotion,
      prefersContrast,
      forcedColors,

      // Color getters
      getDomainColor,
      getBorderColor,
      getFillColor,
      getIconStyle,
      getFocusColor,

      // Style getters
      getBorderWidth,
      getTransitionDuration,

      // Feature flags
      shouldShowGlow,
      shouldShowSelectionIndicator,

      // CSS helpers
      getStateClasses,

      // Direct color access (for when you need the raw value)
      colors: {
        primary: PRIMARY_COLOR_HEX,
        kleinBlue: KLEIN_BLUE_HEX,
        neutralInk: NEUTRAL_INK_HEX,
        focus: getFocusColor(),
        domain: domainColors,
      },
    };
  }, [prefersReducedMotion, prefersContrast, forcedColors]);
}
