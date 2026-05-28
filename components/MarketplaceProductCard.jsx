/**
 * MarketplaceProductCard
 * Card usado na listagem do marketplace para afiliados/público.
 * Mostra badge de comissão e link para /marketplace/product/[slug]
 */
import { TrendingUp } from "lucide-react"

const typeLabels = {
  course: "Curso",
  book: "Livro",
  mentorship: "Mentoria",
  event: "Evento"
}

const typeBadge = {
  course: "bg-[#FFF8E7] text-yellow-700 border border-yellow-200",
  book: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  mentorship: "bg-fuchsia-50 text-fuchsia-700 border border-fuchsia-200",
  event: "bg-sky-50 text-sky-700 border border-sky-200"
}

export default function MarketplaceProductCard({ item, commissionPct = 20 }) {
  const fmt = n => (n ?? 0).toLocaleString("pt-PT")
  const href = `/marketplace/product/${item.slug}`
  const commValue = Math.round((item.price * commissionPct) / 100)

  return (
    <a
      href={href}
      className="group relative bg-white border border-neutral-100 rounded-[2rem] overflow-hidden hover:shadow-[0_20px_40px_-15px_rgba(255,69,0,0.2)] hover:border-[#FF4500]/30 transition-all duration-500 flex flex-col text-neutral-900"
    >
      {/* Image */}
      <div className="relative block aspect-[16/9] overflow-hidden bg-neutral-100">
        {item.image ? (
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-neutral-400 text-xs font-medium">
            Sem capa
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-60 group-hover:opacity-30 transition-opacity duration-500" />

        {/* Type badge */}
        <div className="absolute top-3 left-3 flex gap-2 flex-wrap z-10">
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md shadow-md ${typeBadge[item.type] || "bg-white text-neutral-900 border border-neutral-200"}`}>
            {typeLabels[item.type]?.toUpperCase()}
          </span>
        </div>

        {/* Commission badge */}
        <div className="absolute top-3 right-3 z-10">
          <span className="flex items-center gap-1 text-[10px] font-black bg-[#00A859] text-white px-2 py-1 rounded-md shadow-md">
            <TrendingUp size={9} />
            {commissionPct}% com.
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col gap-2 flex-1">
        <div className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wide truncate">
          {item.instructor}
        </div>

        <h3 className="font-extrabold text-[16px] leading-snug line-clamp-2 text-neutral-900 group-hover:text-[#FF4500] transition-colors">
          {item.title}
        </h3>

        <div className="mt-auto pt-4 flex items-center justify-between gap-2 border-t border-neutral-100">
          <div className="flex flex-col">
            <span className="text-neutral-900 font-black text-lg tracking-tight">{fmt(item.price)} Kz</span>
            <span className="text-[10px] font-bold text-[#00A859] flex items-center gap-0.5 mt-0.5">
              <TrendingUp size={9} />
              Ganhas {fmt(commValue)} Kz/venda
            </span>
          </div>

          <div className="shrink-0 text-sm font-bold text-[#FF4500] group-hover:bg-[#FF4500] group-hover:text-white border border-[#FF4500]/30 px-3 py-2 rounded-xl transition-all duration-300">
            Promover →
          </div>
        </div>
      </div>
    </a>
  )
}
