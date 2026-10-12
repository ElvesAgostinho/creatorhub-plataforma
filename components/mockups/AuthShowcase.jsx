import BrowserFrame from "./BrowserFrame"
import MembersAreaMock from "./MembersAreaMock"

/**
 * Painel lateral das páginas de login e registo.
 * Substitui a fotografia de banco de imagens pela área de membros real,
 * sobre fundo escuro com a grelha e o halo da marca.
 */
export default function AuthShowcase({ title, subtitle, badges = [] }) {
  return (
    <div className="relative hidden overflow-hidden bg-ink-800 lg:flex lg:w-1/2">
      <div aria-hidden="true" className="bg-grid pointer-events-none absolute inset-0 opacity-70" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 top-1/4 h-96 w-96 rounded-full bg-brand/25 blur-[120px]"
      />

      {/* A plataforma, inclinada ao fundo */}
      <div className="absolute -right-16 top-24 w-[85%] rotate-[-6deg] opacity-95">
        <BrowserFrame url="above.ao/learn/marketing-digital">
          <MembersAreaMock />
        </BrowserFrame>
      </div>

      <div className="relative z-20 flex flex-col justify-end bg-gradient-to-t from-ink-800 via-ink-800/85 to-transparent p-16 pb-20 text-white">
        {badges.length > 0 && (
          <div className="mb-8 flex flex-wrap gap-3">
            {badges.map((b) => (
              <span
                key={b}
                className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm"
              >
                {b}
              </span>
            ))}
          </div>
        )}

        <h2 className="mb-4 text-4xl font-extrabold leading-tight">{title}</h2>
        <p className="max-w-md text-base leading-relaxed text-neutral-300">{subtitle}</p>
      </div>
    </div>
  )
}
