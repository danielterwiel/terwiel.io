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
      },
      backdropBlur: {
        xs: "2px",
        sm: "4px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        "2xl": "20px",
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
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
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
      });
    },
  ],
} satisfies Config;
