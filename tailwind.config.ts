import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

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
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
      },
      colors: {
        klein: KLEIN_BLUE,
        ...generateTailwindIconColors(),
        // Domain colors - muted glassmorphic palette harmonizing with Klein Blue
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
        ".magnetic-base": {
          position: "relative",
          background: `linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(0, 47, 167, 0.03))`,
          boxShadow: "0 2px 12px rgba(0, 0, 0, 0.08)",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        },

        // Ring effect addon - only applied when explicitly requested
        ".magnetic-with-ring::after": {
          content: '""',
          position: "absolute",
          top: "50%",
          left: "50%",
          width: "calc(100% + 16px)",
          height: "calc(100% + 16px)",
          border: `2px solid rgba(0, 47, 167, 0.3)`,
          opacity: "0",
          transform: "translate(-50%, -50%) scale(0.8)",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
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
          background: `linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(0, 47, 167, 0.02))`,
          boxShadow: "0 1px 8px rgba(0, 0, 0, 0.06)",
        },

        ".magnetic-card": {
          // Card-specific optimizations
          background: `linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(0, 47, 167, 0.04))`,
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
        },

        ".magnetic-button": {
          // Button-specific optimizations
          background: `linear-gradient(135deg, rgba(255, 255, 255, 0.12), rgba(0, 47, 167, 0.05))`,
          boxShadow: "0 2px 12px rgba(0, 0, 0, 0.08)",
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

        // Universal state variants - work with all component types
        // Hover effects only apply when NOT selected to prevent conflicts
        ".magnetic-hover:not(.magnetic-selected)": {
          transform: "scale(1.02)",
          boxShadow: "0 8px 25px rgba(0, 47, 167, 0.25)",
          background: `linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(0, 47, 167, 0.08))`,
        },
        ".magnetic-hover:not(.magnetic-selected).magnetic-with-ring::after": {
          opacity: "1",
          transform: "translate(-50%, -50%) scale(1)",
          borderColor: "rgba(0, 47, 167, 0.6)",
        },

        ".magnetic-active": {
          transform: "scale(0.98)",
          boxShadow: "0 4px 16px rgba(0, 47, 167, 0.3)",
          background: `linear-gradient(135deg, rgba(255, 255, 255, 0.12), rgba(0, 47, 167, 0.06))`,
        },
        ".magnetic-active.magnetic-with-ring::after": {
          opacity: "0.8",
          transform: "translate(-50%, -50%) scale(0.95)",
          borderColor: "rgba(0, 47, 167, 0.7)",
        },

        ".magnetic-selected": {
          background: `linear-gradient(135deg, rgba(0, 47, 167, 0.12), rgba(0, 47, 167, 0.06))`,
          boxShadow: "0 4px 16px rgba(0, 47, 167, 0.2)",
        },
        ".magnetic-selected.magnetic-with-ring::after": {
          opacity: "0.7",
          transform: "translate(-50%, -50%) scale(0.9)",
          borderColor: "rgba(0, 47, 167, 0.5)",
        },

        // Input-specific state overrides
        // Input hover only applies when NOT selected
        ".magnetic-input.magnetic-hover:not(.magnetic-selected)": {
          borderColor: "rgba(0, 47, 167, 0.4)",
          transform: "scale(1.01)", // Gentler scale for inputs
        },
        ".magnetic-input.magnetic-selected": {
          borderColor: "rgba(0, 47, 167, 0.6)",
          background: `linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(0, 47, 167, 0.04))`,
        },
        ".magnetic-input.magnetic-active": {
          borderColor: "rgba(0, 47, 167, 0.5)",
          transform: "scale(0.995)", // Very subtle scale for inputs
        },
      });
    },
  ],
} satisfies Config;
