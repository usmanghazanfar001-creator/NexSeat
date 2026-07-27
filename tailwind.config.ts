import type { Config } from "tailwindcss";

// NexSeat design tokens
// Palette: deep space-violet base, electric violet -> teal gradient accent.
// This intentionally avoids the "cream + terracotta" and "black + acid-green"
// defaults; the subject (pooled subscriptions / seats) is represented by the
// gradient acting like a "meter filling up".
const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        teal: {
          400: "#34D9C9",
          500: "#1FB8AA",
        },
        violet: {
          400: "#8B7CF9",
          500: "#7C6CF6",
          600: "#6653E3",
        },
      },
      fontFamily: {
        display: ["var(--font-sora)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
      },
      backgroundImage: {
        "meter-gradient": "linear-gradient(90deg, #7C6CF6 0%, #34D9C9 100%)",
        "hero-glow":
          "radial-gradient(60% 60% at 50% 0%, rgba(124,108,246,0.25) 0%, rgba(11,11,20,0) 70%)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "fill-meter": {
          from: { width: "0%" },
          to: { width: "var(--fill-to)" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fill-meter": "fill-meter 1.1s cubic-bezier(0.16,1,0.3,1) forwards",
        "fade-up": "fade-up 0.6s cubic-bezier(0.16,1,0.3,1) forwards",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
