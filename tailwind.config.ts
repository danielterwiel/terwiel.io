import type { Config } from "tailwindcss";

import { DOMAIN_COLORS, KLEIN_BLUE } from "./src/constants/colors";
import {
  generateIconSafelist,
  generateTailwindIconColors,
} from "./src/utils/icon-colors";

export default {
  content: ["./src/**/*.tsx"],
  safelist: [
    ...generateIconSafelist(),
    "magnetic-base",
    "magnetic-rounded-lg",
    "magnetic-rounded-full",
    "magnetic-hover",
    "magnetic-active",
    "magnetic-selected",
    "magnetic-ring",
    "magnetic-node",
    "magnetic-input",
    "magnetic-card",
    "magnetic-button",
    "magnetic-no-ring",
    "magnetic-with-ring",
  ],
  theme: {
    extend: {
      screens: {
        // Mobile landscape detection for devices like iPhone 11 and newer
        // Uses aspect-ratio to detect when height < width on small screens
        // This keeps the vertical layout on mobile landscape
        "landscape-mobile": {
          raw: "(max-width: 1024px) and (max-height: 500px) and (orientation: landscape)",
        },
        // Ultra-wide screen breakpoints for large displays
        // 3xl: Standard large monitor (1920x1080 and wider monitors)
        // 4k: 4K displays (2560px width)
        // 5k: 5K displays and ultra-wide curved monitors (3200px+ width)
        "3xl": "1600px",
        "4k": "2560px",
        "5k": "3200px",
      },
      fontFamily: {
        sans: [
          "Bahnschrift",
          "DIN Alternate",
          "Franklin Gothic Medium",
          "Nimbus Sans Narrow",
          "sans-serif-condensed",
          "sans-serif",
        ],
      },
      colors: {
        klein: KLEIN_BLUE, // OKLCH format
        ...generateTailwindIconColors(),
        // Domain colors - OKLCH palette for perceptually uniform colors
        domain: {
          devops: DOMAIN_COLORS.DevOps,
          backend: DOMAIN_COLORS["Back-end"],
          frontend: DOMAIN_COLORS["Front-end"],
          design: DOMAIN_COLORS.Design,
        },
      },
      animation: {
        "magnetic-ring": "magnetic-ring 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        "magnetic-bounce":
          "magnetic-bounce 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "magnetic-pulse": "magnetic-pulse 2s ease-in-out infinite",
        "float-subtle": "float-subtle 4s ease-in-out infinite",
        "fade-in": "animationFadeIn 1s ease-out forwards",
        "slide-down": "animation-slide-down 0.5s ease-in-out forwards",
      },
      backdropBlur: {
        xs: "2px",
        sm: "4px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        "2xl": "20px",
      },
      zIndex: {
        /* Z-index hierarchy:
           0: Default layer (body, containers)
           10: Projects/main content
           20: View transitions for projects (above projects, below header)
           40: View transitions for header (Chrome only, below sticky header)
           50: Sticky header, dropdowns, sticky UI elements
           100: Maximum z-index for edge cases (no items should use this)
        */
        "0": "0",
        "10": "10",
        "20": "20",
        "40": "40",
        "50": "50",
        "100": "100",
      },
      keyframes: {
        "magnetic-ring": {
          "0%": {
            transform: "translate(-50%, -50%) scale(0.8)",
            opacity: "0",
          },
          "100%": {
            transform: "translate(-50%, -50%) scale(1)",
            opacity: "1",
          },
        },
        "magnetic-bounce": {
          "0%": {
            transform: "scale(1)",
          },
          "50%": {
            transform: "scale(1.05)",
          },
          "100%": {
            transform: "scale(1)",
          },
        },
        "magnetic-pulse": {
          "0%, 100%": {
            transform: "scale(1)",
            boxShadow: "0 0 0 0 rgba(0, 47, 167, 0.3)",
          },
          "50%": {
            transform: "scale(1.05)",
            boxShadow: "0 0 0 8px rgba(0, 47, 167, 0)",
          },
        },
        "float-subtle": {
          "0%, 100%": {
            transform: "translateY(0px)",
          },
          "50%": {
            transform: "translateY(-2px)",
          },
        },
        animationFadeIn: {
          from: {
            opacity: "0",
          },
          to: {
            opacity: "1",
          },
        },
        "animation-slide-down": {
          from: {
            transform: "translateY(-100%)",
            opacity: "0",
          },
          to: {
            transform: "translateY(0)",
            opacity: "1",
          },
        },
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    // Custom hover-hover: variant for hover styles that should only apply on hover-capable devices
    // This prevents hover states from triggering on touch devices (mobile/tablet)
    ({
      addVariant,
    }: {
      addVariant: (name: string, definition: string) => void;
    }) => {
      addVariant("hover-hover", "@media (hover: hover) { &:hover }");
      addVariant(
        "group-hover-hover",
        "@media (hover: hover) { :merge(.group):hover & }",
      );
    },
    ({
      addComponents,
      theme,
    }: {
      addComponents: (styles: Record<string, Record<string, unknown>>) => void;
      theme: (path: string) => string;
    }) => {
      addComponents({
        // Base magnetic effect - no pseudo-elements for maximum flexibility
        // Using OKLCH for better perceptual uniformity and depth
        ".magnetic-base": {
          position: "relative",
          background: `linear-gradient(135deg, oklch(100% 0 0 / 0.08), oklch(37.85% 0.1954 263.23 / 0.03))`,
          boxShadow: "0 2px 12px oklch(0% 0 0 / 0.08)",
          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        },

        // Ring effect addon - only applied when explicitly requested
        ".magnetic-with-ring::after": {
          content: '""',
          position: "absolute",
          top: "50%",
          left: "50%",
          width: "calc(100% + 16px)",
          height: "calc(100% + 16px)",
          border: `2px solid oklch(37.85% 0.1954 263.23 / 0.3)`,
          opacity: "0",
          transform: "translate(-50%, -50%) scale(0.8)",
          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          zIndex: "-1",
          pointerEvents: "none",
        },

        // Component-specific base styles
        ".magnetic-node": {
          // Node-specific optimizations (circular components)
        },

        ".magnetic-input": {
          // Input-specific optimizations (no conflicting borders)
          border: "2px solid transparent",
          background: `linear-gradient(135deg, oklch(100% 0 0 / 0.05), oklch(37.85% 0.1954 263.23 / 0.02))`,
          boxShadow: "0 1px 8px oklch(0% 0 0 / 0.06)",
        },

        ".magnetic-card": {
          // Card-specific optimizations
          background: `linear-gradient(135deg, oklch(100% 0 0 / 0.1), oklch(37.85% 0.1954 263.23 / 0.04))`,
          boxShadow: "0 4px 16px oklch(0% 0 0 / 0.1)",
        },

        ".magnetic-button": {
          // Button-specific optimizations
          background: `linear-gradient(135deg, oklch(100% 0 0 / 0.12), oklch(37.85% 0.1954 263.23 / 0.05))`,
          boxShadow: "0 2px 12px oklch(0% 0 0 / 0.08)",
        },
        // Shape variants
        ".magnetic-rounded-lg": {
          borderRadius: theme("borderRadius.lg"),
        },
        ".magnetic-rounded-lg.magnetic-with-ring::after": {
          borderRadius: theme("borderRadius.lg"),
        },
        ".magnetic-rounded-full": {
          borderRadius: theme("borderRadius.full"),
        },
        ".magnetic-rounded-full.magnetic-with-ring::after": {
          borderRadius: theme("borderRadius.full"),
        },

        ".magnetic-active": {
          transform: "scale(0.98)",
          boxShadow: "0 4px 16px oklch(37.85% 0.1954 263.23 / 0.3)",
          background: `linear-gradient(135deg, oklch(100% 0 0 / 0.12), oklch(37.85% 0.1954 263.23 / 0.06))`,
        },
        ".magnetic-active.magnetic-with-ring::after": {
          opacity: "0.8",
          transform: "translate(-50%, -50%) scale(0.95)",
          borderColor: "oklch(37.85% 0.1954 263.23 / 0.7)",
        },

        ".magnetic-selected": {
          background: `linear-gradient(135deg, oklch(37.85% 0.1954 263.23 / 0.12), oklch(37.85% 0.1954 263.23 / 0.06))`,
          boxShadow: "0 4px 16px oklch(37.85% 0.1954 263.23 / 0.2)",
        },
        ".magnetic-selected.magnetic-with-ring::after": {
          opacity: "0.7",
          transform: "translate(-50%, -50%) scale(0.9)",
          borderColor: "oklch(37.85% 0.1954 263.23 / 0.5)",
        },

        ".magnetic-input.magnetic-selected": {
          borderColor: "oklch(37.85% 0.1954 263.23 / 0.6)",
          background: `linear-gradient(135deg, oklch(100% 0 0 / 0.08), oklch(37.85% 0.1954 263.23 / 0.04))`,
        },
        ".magnetic-input.magnetic-active": {
          borderColor: "oklch(37.85% 0.1954 263.23 / 0.5)",
          transform: "scale(0.995)", // Very subtle scale for inputs
        },

        // Field sizing utility - allows form inputs to resize based on content
        ".field-sizing-content": {
          fieldSizing: "content",
        },
      });
    },
  ],
} satisfies Config;
