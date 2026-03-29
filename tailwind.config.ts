import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#e8f0fc",
          100: "#d1e1f9",
          200: "#a3c3f3",
          300: "#6b9be0",
          400: "#4478c8",
          500: "#2B4C7E",
          600: "#233d65",
          700: "#1b2f4c",
          800: "#132133",
          900: "#0b131f",
        },
        stadium: {
          dark: "#050a12",
          medium: "#0c1524",
          light: "#162038",
        },
        accent: {
          light: "#c8d9f0",
          DEFAULT: "#7ba1d4",
          dark: "#4478c8",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
