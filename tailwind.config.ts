import { nextui } from "@nextui-org/theme";
import type { Config } from "tailwindcss";

export default {
  content: [
    "./index.html",
    "./ui/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Rubik",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          '"Helvetica Neue"',
          "Arial",
          '"Noto Sans"',
          "sans-serif",
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"',
          '"Noto Color Emoji"',
        ],
      },
      screens: {
        xs: "475px",
      },
      backgroundImage: {
        radial:
          "radial-gradient(at 50% -10%, hsl(183.32deg 43.65% 44.06% / 34%) 5%, hsl(0deg 0% 0% / 45%) 90%)",
        "radial-1":
          "radial-gradient(at 90% 0%,hsl(183.32deg 43.65% 44.06% / 24%) 5%,hsl(0deg 0% 0% / 0%) 90%)",
      },
    },
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        xl: "2rem",
        "2xl": "3rem",
      },
    },
  },
  plugins: [
    nextui({
      addCommonColors: true,
      defaultTheme: "dark",
      defaultExtendTheme: "dark",
      themes: {
        dark: {
          colors: {
            primary: "#31797da3",
          },
        },
      },
    }),
  ],
} satisfies Config;
