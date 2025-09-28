import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

import {
  generateIconSafelist,
  generateTailwindIconColors,
} from "./src/utils/icon-colors";

export default {
  content: ["./src/**/*.tsx"],
  safelist: [
    // Icon color classes for dynamic generation
    ...generateIconSafelist(),
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
      },
      colors: {
        klein: "#002FA7",
        // Icon brand colors (generated from ICON_COLORS)
        ...generateTailwindIconColors(),
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
} satisfies Config;
