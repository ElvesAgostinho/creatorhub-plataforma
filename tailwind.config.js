const colors = require("tailwindcss/colors")

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        // Cinzentos com ponta de azul (slate) em vez de cinzento neutro:
        // é o que faz o conjunto ler-se como azul-tinta e não como cinzento sujo.
        neutral: colors.slate,

        // Índigo da marca — uma só cor de ação em toda a plataforma
        brand: {
          DEFAULT: "#4F46E5",
          dark: "#4338CA",
          deep: "#312E81",
          light: "#A5B4FC",
          soft: "#EEF2FF",
          ring: "rgba(79,70,229,0.20)"
        },
        // Pagamento: deixou de ser verde. Uma só cor de ação em toda a
        // plataforma, para o checkout não parecer de outra marca.
        pay: {
          DEFAULT: "#4F46E5",
          dark: "#4338CA",
          soft: "#EEF2FF"
        },
        // Dourado contido: valores positivos, receita e marcas de distinção.
        // Substitui o verde-menta; em fundo escuro lê-se como prémio, não como app.
        accent: {
          DEFAULT: "#D4A53A",
          dark: "#A8801F",
          light: "#E8C97A",
          soft: "#FBF5E6"
        },
        // Mantido para compatibilidade: aponta para a mesma família da marca
        teal: {
          DEFAULT: "#4F46E5",
          dark: "#4338CA"
        },
        // Azul-tinta: títulos, fundos escuros e barras laterais
        ink: {
          900: "#020617",
          800: "#0F172A",
          700: "#1E293B",
          600: "#334155"
        },
        surface: {
          50: "#F8FAFC",
          100: "#F1F5F9",
          200: "#EEF2F6"
        }
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "-apple-system", "Segoe UI", "sans-serif"]
      },
      fontSize: {
        // Escala de títulos: cresce com o ecrã mas nunca passa dos limites.
        // Antes os h1 ficavam em 60–72px e esmagavam a página.
        "display-xl": ["clamp(2rem, 3.4vw, 2.875rem)", { lineHeight: "1.08", letterSpacing: "-0.028em", fontWeight: "800" }],
        "display-lg": ["clamp(1.625rem, 2.6vw, 2.125rem)", { lineHeight: "1.12", letterSpacing: "-0.024em", fontWeight: "800" }],
        "display-md": ["clamp(1.5rem, 2.4vw, 1.875rem)", { lineHeight: "1.18", letterSpacing: "-0.02em", fontWeight: "700" }],
        "display-sm": ["clamp(1.25rem, 1.8vw, 1.5rem)", { lineHeight: "1.25", letterSpacing: "-0.015em", fontWeight: "700" }],
        lead: ["1.0625rem", { lineHeight: "1.65" }]
      },
      maxWidth: {
        // Medida de leitura confortável para parágrafos de apoio
        prose: "62ch",
        measure: "46ch"
      },
      boxShadow: {
        card: "0 1px 2px rgba(15,23,42,0.04), 0 8px 24px -12px rgba(15,23,42,0.12)",
        float: "0 24px 60px -20px rgba(15,23,42,0.28)",
        frame: "0 40px 90px -30px rgba(15,23,42,0.45)",
        brand: "0 10px 30px -10px rgba(79,70,229,0.45)",
        pay: "0 10px 30px -10px rgba(79,70,229,0.45)",
        header: "0 1px 0 0 rgba(15,23,42,0.06)"
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
          "0%": { transform: "scaleY(0.04)" },
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
