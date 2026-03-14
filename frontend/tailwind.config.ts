import type { Config } from "tailwindcss";

// Tailwind config maps to Figma-driven class usage in components.
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Space Grotesk", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
      colors: {
        "aeg-bg": "#0b0f14",
        "aeg-panel": "#111827",
        "aeg-border": "#1f2937",
        "aeg-accent": "#10b981"
      }
    }
  },
  plugins: []
} satisfies Config;
