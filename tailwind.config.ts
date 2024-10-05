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
          "Rubik Variable",
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
            background: "#111927c2",
          },
        },
      },
    }),
  ],
} satisfies Config;
