/**
 * Logótipo ABOVE.
 *
 * O anterior era a palavra em itálico muito encorpado, a laranja fluorescente —
 * lia-se como banner de promoção. Este é um wordmark direito, em peso firme,
 * com um símbolo simples: a seta para cima que dá nome à marca, dentro de um
 * quadrado arredondado. Desenhado em SVG/texto, por isso é nítido em qualquer
 * ecrã e acompanha a cor do contexto.
 */
export default function Logo({ variant = "dark", size = "md", withMark = true, className = "" }) {
  const onDark = variant === "light"

  const S = {
    sm: { mark: "h-6 w-6", radius: "rounded-md", text: "text-[15px]", gap: "gap-2" },
    md: { mark: "h-7 w-7", radius: "rounded-lg", text: "text-[17px]", gap: "gap-2.5" },
    lg: { mark: "h-9 w-9", radius: "rounded-xl", text: "text-[22px]", gap: "gap-3" },
  }[size]

  return (
    <span className={`inline-flex items-center ${S.gap} ${className}`}>
      {withMark && (
        <span
          className={`flex ${S.mark} ${S.radius} items-center justify-center bg-brand text-white`}
          aria-hidden="true"
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-[58%] w-[58%]">
            <path
              d="M12 4.5 20 19H4L12 4.5Z"
              stroke="currentColor"
              strokeWidth="2.6"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      )}
      <span
        className={`${S.text} font-extrabold tracking-[-0.03em] ${
          onDark ? "text-white" : "text-ink-800"
        }`}
      >
        ABOVE
      </span>
    </span>
  )
}
