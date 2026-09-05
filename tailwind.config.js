/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Paleta PromptForge Pro
        background: "#0A0A0F",
        card: "#1A1A2E",
        primary: "#FF6B6B",
        secondary: "#4ECDC4",
        accent: "#C084FC",
        yellow: {
          brand: "#FFE66D",
        },
        muted: "#B8B8D0",
        border: "#2A2A3E",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 40px rgba(192, 132, 252, 0.25)",
        "glow-primary": "0 0 40px rgba(255, 107, 107, 0.35)",
        "glow-secondary": "0 0 40px rgba(78, 205, 196, 0.3)",
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "fade-in": "fadeIn 0.8s ease-out forwards",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-15px)" },
        },
        fadeIn: {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
