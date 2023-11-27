import { type Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

export default {
  content: ["./src/**/*.tsx"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
      },
      transitionDelay: {
        "400": "400ms",
        "600": "600ms",
        "800": "800ms",
        "900": "900ms",
      },
      transitionDuration: {
        "400": "400ms",
        "600": "600ms",
        "800": "800ms",
        "900": "900ms",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
} satisfies Config;
