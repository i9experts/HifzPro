import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#0D5C3A",
          light:   "#0F6E47",
          dark:    "#094A2F",
          deep:    "#071A10",
        },
        gold: {
          DEFAULT: "#C4882A",
          light:   "#E6A83C",
          dark:    "#A67020",
          50:      "#FDF8EE",
          100:     "#FAEFD0",
        },
        green: {
          50:  "#F0FAF5",
          100: "#D4F0E2",
          200: "#A9E0C5",
          300: "#6DC9A0",
          400: "#3AAD78",
          500: "#0D5C3A",
          600: "#0A4A2E",
          700: "#083A24",
          800: "#052D1A",
          900: "#071A10",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        heading: ["var(--font-heading)", "sans-serif"],
        body:    ["var(--font-body)", "sans-serif"],
        mono:    ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        sm:  "4px",
        md:  "8px",
        lg:  "12px",
        xl:  "16px",
        "2xl": "20px",
      },
      boxShadow: {
        sm:    "0 1px 3px rgba(0,0,0,0.08)",
        md:    "0 4px 12px rgba(0,0,0,0.10)",
        lg:    "0 8px 24px rgba(0,0,0,0.12)",
        xl:    "0 16px 48px rgba(0,0,0,0.16)",
        green: "0 8px 24px rgba(13,92,58,0.20)",
        gold:  "0 4px 20px rgba(196,136,42,0.35)",
      },
    },
  },
  plugins: [],
};

export default config;
