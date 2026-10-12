import { Star } from "lucide-react"
import CoverFallback from "./CoverFallback"

/**
 * Amostra do catálogo com os quatro tipos de produto da plataforma
 * (curso, livro, mentoria, evento), usando os mesmos cartões do marketplace real.
 * Serve de visual para os heróis das páginas "O que inclui" e "Marketplace".
 */

const ITEMS = [
  { title: "Marketing Digital na Prática", type: "course", instructor: "Hélder Nascimento", price: "24 900", rating: 98 },
  { title: "Finanças Pessoais em Angola", type: "book", instructor: "Ana Cardoso", price: "7 500", rating: 96 },
  { title: "Mentoria de Vendas 1:1", type: "mentorship", instructor: "Paulo Satula", price: "45 000", rating: 99 },
  { title: "Workshop de Oratória", type: "event", instructor: "Lídia Moniz", price: "12 000", rating: 97 },
]

const TYPE_LABEL = { course: "CURSO", book: "LIVRO", mentorship: "MENTORIA", event: "EVENTO" }

const TYPE_BADGE = {
  course: "bg-white/90 text-brand-deep border-white/60",
  book: "bg-white/90 text-brand-700 border-white/60",
  mentorship: "bg-white/90 text-violet-700 border-white/60",
  event: "bg-white/90 text-sky-700 border-white/60",
}

export default function CatalogMock({ className = "" }) {
  return (
    <div className={`grid grid-cols-2 gap-3 sm:gap-4 ${className}`}>
      {ITEMS.map((item, i) => (
        <div
          key={item.title}
          className="flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white text-ink-800 shadow-card"
        >
          <div className="relative aspect-[16/9] overflow-hidden bg-neutral-100">
            <CoverFallback title={item.title} type={item.type} showLabel={false} />
            <div className="absolute left-2.5 top-2.5 z-10 flex flex-wrap gap-1.5">
              {item.best && (
                <span className="rounded-md bg-brand px-2 py-0.5 text-[8px] font-black uppercase tracking-wider text-white shadow-md">
                  Pop
                </span>
              )}
              <span
                className={`rounded-md border px-2 py-0.5 text-[8px] font-bold shadow-md ${TYPE_BADGE[item.type]}`}
              >
                {TYPE_LABEL[item.type]}
              </span>
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-1 p-3">
            <div className="truncate text-[8px] font-semibold uppercase tracking-wide text-neutral-500">
              {item.instructor}
            </div>
            <div className="line-clamp-2 text-[11px] font-extrabold leading-snug">{item.title}</div>
            <div className="flex items-center gap-1 text-[8px] font-medium text-neutral-500">
              <span className="flex items-center gap-0.5 font-bold text-accent-dark"><Star size={8} className="fill-accent text-accent" strokeWidth={0} /> {item.rating}%</span>
            </div>
            <div className="mt-auto flex items-center justify-between gap-2 border-t border-neutral-100 pt-2.5">
              <span className="text-[13px] font-black tracking-tight">{item.price} Kz</span>
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
