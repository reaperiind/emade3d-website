import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary — deep industrial ink (near-black blue-charcoal)
        ink: {
          950: "#07090D",
          900: "#0B0E14",
          800: "#10141C",
          700: "#171C26",
          600: "#1F2530",
          500: "#2A3240",
        },
        // Accent — signal orange taken from the brand mark (adjust in /src/config/site.ts)
        accent: {
          DEFAULT: "#FF5A1F",
          soft: "#FF7A45",
          dim: "rgba(255, 90, 31, 0.12)",
        },
        // Neutrals
        steel: {
          100: "#F4F6F8",
          200: "#E7EBEF",
          300: "#CBD3DA",
          400: "#98A2AE",
          500: "#6B7684",
          600: "#4A525F",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "var(--font-arabic)", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "var(--font-arabic)", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        widest2: "0.22em",
      },
      boxShadow: {
        card: "0 1px 2px rgba(7, 9, 13, 0.04), 0 12px 32px -12px rgba(7, 9, 13, 0.18)",
        "card-lg": "0 2px 4px rgba(7, 9, 13, 0.05), 0 28px 64px -24px rgba(7, 9, 13, 0.35)",
        glow: "0 0 0 1px rgba(255, 90, 31, 0.35), 0 10px 40px -8px rgba(255, 90, 31, 0.45)",
      },
      backgroundImage: {
        "technical-grid":
          "linear-gradient(to right, rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.045) 1px, transparent 1px)",
      },
      backgroundSize: {
        "technical-grid": "48px 48px",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(18px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "pulse-line": {
          "0%, 100%": { opacity: "0.35" },
          "50%": { opacity: "1" },
        },
        "dash-move": {
          to: { strokeDashoffset: "-24" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) both",
        float: "float 6s ease-in-out infinite",
        "pulse-line": "pulse-line 3s ease-in-out infinite",
        "dash-move": "dash-move 1.2s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
