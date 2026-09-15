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
        // Paleta PromptForge: dark cálido. Ámbar como acento principal y
        // violeta suave como secundario, solo para variar (nunca para acciones).
        background: "#0F0F0F",
        card: "#181818",
        border: "#2A2A2A",
        foreground: "#FAFAFA",
        muted: "#A1A1AA",
        accent: {
          DEFAULT: "#F59E0B",
          hover: "#D97706",
          subtle: "#78350F",
        },
        secondary: {
          DEFAULT: "#A78BFA",
          subtle: "#4C1D95",
        },
        // Estados. `warning` es naranja a propósito, no ámbar: el ámbar es el
        // acento, y un aviso no debe leerse del color de un botón principal.
        success: "#10B981",
        warning: "#FB923C",
        danger: "#F87171",
        // Dorado propio de las insignias Premium/Destacado. Es distinto de
        // `warning` a propósito: el ámbar de alerta no debe leerse como premio.
        premium: "#D4AF37",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        // Un único glow, tenue, del acento.
        glow: "0 0 24px rgba(245, 158, 11, 0.18)",
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
