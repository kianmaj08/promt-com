import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        accent: "#F5C518",
        "accent-hover": "#e6b800",
        "bg-dark": "#0a0a0a",
        "card-dark": "#1a1a1a",
        "border-dark": "#2a2a2a",
        "border-light": "#e5e5e5",
        "muted-light": "#6b7280",
        "muted-dark": "#9ca3af",
      },
      fontFamily: {
        sans: ["var(--font-sora)", "Sora", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      transitionDuration: {
        DEFAULT: "200ms",
      },
      boxShadow: {
        card: "0 2px 8px rgba(0,0,0,0.08)",
        "card-dark": "0 2px 8px rgba(0,0,0,0.4)",
      },
    },
  },
  plugins: [],
};

export default config;
