"use client"

import Image from "next/image"
import { useCart } from "./CartContext"
import { ShoppingCart, Check } from "lucide-react"

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

export default function ProductCard({ item }) {
  const { cart, addToCart } = useCart()
  const fmt = n => (n ?? 0).toLocaleString("pt-PT")
  const href = `/product/${item.slug}`
  
  const isAdded = cart.some(p => p.id === item.id)

  const handleAddToCart = (e) => {
    e.preventDefault() // Prevent navigation to product page
    e.stopPropagation()
    addToCart(item)
  }

  return (
    <div className="group relative bg-white border border-neutral-100 rounded-2xl overflow-hidden hover:shadow-[0_20px_40px_-15px_rgba(255,69,0,0.2)] hover:border-[#FF4500]/30 transition-all duration-500 flex flex-col text-neutral-900">
      <a href={href} className="relative block aspect-[16/9] overflow-hidden bg-neutral-100">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-neutral-400 text-xs font-medium">
            Sem capa
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-60 group-hover:opacity-30 transition-opacity duration-500" />

        <div className="absolute top-3 left-3 flex gap-2 flex-wrap z-10">
          {item.bestSeller && (
            <span className="bg-[#FF4500] text-white text-[10px] uppercase font-black px-2.5 py-1 rounded-md tracking-wider shadow-md">
              Pop
            </span>
          )}
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md shadow-md ${typeBadge[item.type] || "bg-white text-neutral-900 border border-neutral-200"}`}>
            {typeLabels[item.type]?.toUpperCase()}
          </span>
        </div>
      </a>

      <div className="p-6 flex flex-col gap-2 flex-1 relative z-10 bg-white">
        <div className="flex items-center gap-2 text-[12px] font-semibold text-neutral-500 tracking-wide uppercase">
          <span>{item.instructor}</span>
        </div>
        
        <a href={href} className="font-extrabold text-[16px] leading-snug line-clamp-2 text-neutral-900 group-hover:text-[#FF4500] transition-colors">
          {item.title}
        </a>

        <div className="flex items-center gap-2 text-[12px] text-neutral-600 mt-1 font-medium">
          <span className="flex items-center gap-1 text-yellow-500 font-bold">★ {item.reviewsPositive}%</span>
          <span>({fmt(item.reviewsCount)} avaliações)</span>
        </div>

        <div className="mt-auto pt-5 flex items-center justify-between gap-2 border-t border-neutral-100">
          <div className="flex flex-col">
            {item.discount > 0 ? (
              <>
                <span className="line-through text-neutral-400 text-[11px] font-bold">{fmt(item.originalPrice)} Kz</span>
                <span className="text-[#FF4500] font-black text-xl tracking-tight">{fmt(item.price)} Kz</span>
              </>
            ) : (
              <span className="text-neutral-900 font-black text-xl tracking-tight">{fmt(item.price)} Kz</span>
            )}
          </div>

          <button 
            onClick={handleAddToCart}
            disabled={isAdded}
            className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 ${
              isAdded 
                ? "bg-emerald-500 text-white cursor-default shadow-md shadow-emerald-500/20" 
                : "bg-neutral-100 text-neutral-600 hover:bg-[#FF4500] hover:text-white hover:scale-110 hover:shadow-[0_8px_20px_rgba(255,69,0,0.3)]"
            }`}
          >
            {isAdded ? <Check className="w-5 h-5" /> : <ShoppingCart className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  )
}
