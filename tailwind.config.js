/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        // Laranja da marca ABOVE — era escrito à mão como #FF4500 em centenas de sítios
        brand: {
          DEFAULT: "#FF4500",
          dark: "#E03E00",
          soft: "#FFF0EB",
          ring: "rgba(255,69,0,0.20)"
        },
        // Verde dos pagamentos (botão "Comprar agora" no checkout)
        pay: {
          DEFAULT: "#00A859",
          dark: "#009650",
          soft: "#E8F7EF"
        },
        // Teal dos painéis de afiliado
        teal: {
          DEFAULT: "#0E7C86",
          dark: "#0A626A"
        },
        // Pretos da marca (fundos escuros da landing e da página de features)
        ink: {
          900: "#0A0A0A",
          800: "#111111",
          700: "#1A1A1A",
          600: "#2B2B2B"
        },
        // Cinzentos de fundo usados nas áreas de trabalho
        surface: {
          50: "#FAFAFA",
          100: "#F8F7F5",
          200: "#F4F5F7"
        }
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "-apple-system", "Segoe UI", "sans-serif"]
      },
      boxShadow: {
        // Elevação suave dos cartões — substitui shadow-2xl usado a esmo
        card: "0 1px 2px rgba(17,17,17,0.04), 0 8px 24px -12px rgba(17,17,17,0.12)",
        float: "0 24px 60px -20px rgba(17,17,17,0.28)",
        frame: "0 40px 90px -30px rgba(17,17,17,0.45)",
        brand: "0 10px 30px -10px rgba(255,69,0,0.45)",
        pay: "0 10px 30px -10px rgba(0,168,89,0.45)"
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem"
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" }
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" }
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.55" }
        },
        "grow-bar": {
          "0%": { transform: "scaleY(0.05)" },
          "100%": { transform: "scaleY(1)" }
        }
      },
      animation: {
        marquee: "marquee 28s linear infinite",
        "fade-up": "fade-up .6s cubic-bezier(.16,1,.3,1) both",
        "float-slow": "float-slow 7s ease-in-out infinite",
        "pulse-soft": "pulse-soft 2.4s ease-in-out infinite",
        "grow-bar": "grow-bar .9s cubic-bezier(.16,1,.3,1) both"
      }
    }
  },
  plugins: []
}
