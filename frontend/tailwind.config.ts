import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./context/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eef2ff",
          100: "#e0e7ff",
          300: "#a5b4fc",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          900: "#312e81",
        },
        accent: {
          500: "#22d3ee",
        },
      },
      backdropBlur: {
        xs: "2px",
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(31, 38, 135, 0.2)",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        pulseSlow: { "0%,100%": { opacity: "1" }, "50%": { opacity: "0.5" } },
      },
      animation: {
        fadeIn: "fadeIn 0.4s ease-in-out",
        pulseSlow: "pulseSlow 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
