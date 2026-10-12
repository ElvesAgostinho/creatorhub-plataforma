import { Lock } from "lucide-react"

/**
 * Moldura de browser desenhada em CSS.
 *
 * Substitui as capturas de ecrã em PNG: fica nítida em qualquer densidade de
 * ecrã, pesa 0 KB e acompanha automaticamente as cores da marca. O conteúdo
 * passado em `children` é a interface real da plataforma, reproduzida em markup.
 */
export default function BrowserFrame({
  url = "above.ao/admin/analytics",
  children,
  className = "",
  tone = "light",
}) {
  const dark = tone === "dark"

  return (
    <div
      className={`overflow-hidden rounded-xl border ${
        dark ? "border-white/10 bg-ink-800" : "border-neutral-200 bg-white"
      } shadow-frame ${className}`}
    >
      {/* Barra do browser */}
      <div
        className={`flex items-center gap-3 border-b px-3 py-2.5 ${
          dark ? "border-white/10 bg-ink-700" : "border-neutral-200 bg-neutral-50"
        }`}
      >
        <div className="flex shrink-0 items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
        </div>

        <div
          className={`flex min-w-0 flex-1 items-center gap-1.5 rounded-md px-2.5 py-1 text-[10px] font-medium ${
            dark
              ? "bg-ink-900 text-neutral-400"
              : "bg-white text-neutral-500 ring-1 ring-neutral-200"
          }`}
        >
          <Lock size={9} className="shrink-0 text-pay" />
          <span className="truncate">{url}</span>
        </div>
      </div>

      {/* Conteúdo */}
      <div className={dark ? "bg-ink-800" : "bg-surface-100"}>{children}</div>
    </div>
  )
}
