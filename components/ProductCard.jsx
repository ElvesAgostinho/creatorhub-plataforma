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
  course: "bg-yellow-400/20 text-yellow-400 border border-yellow-400/30",
  book: "bg-emerald-400/20 text-emerald-400 border border-emerald-400/30",
  mentorship: "bg-fuchsia-400/20 text-fuchsia-400 border border-fuchsia-400/30",
  event: "bg-sky-400/20 text-sky-400 border border-sky-400/30"
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
    <div className="group relative bg-[#0A0A0A]/60 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:shadow-[0_0_40px_rgba(255,69,0,0.15)] hover:border-white/20 transition-all duration-500 flex flex-col text-white">
      <a href={href} className="relative block aspect-[16/9] overflow-hidden bg-neutral-900/50">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-neutral-600 text-xs font-medium">
            Sem capa
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />

        <div className="absolute top-3 left-3 flex gap-2 flex-wrap z-10">
          {item.bestSeller && (
            <span className="bg-[#FF4500] text-white text-[10px] uppercase font-black px-2 py-1 rounded-md tracking-wider shadow-lg">
              Pop
            </span>
          )}
          <span className={`text-[10px] font-bold px-2 py-1 rounded-md shadow-lg ${typeBadge[item.type] || "bg-white/20 text-white border border-white/30"}`}>
            {typeLabels[item.type]?.toUpperCase()}
          </span>
        </div>
      </a>

      <div className="p-5 flex flex-col gap-2 flex-1 relative z-10">
        <div className="flex items-center gap-2 text-[11px] font-medium text-neutral-400">
          <span>{item.instructor}</span>
        </div>
        
        <a href={href} className="font-bold text-[15px] leading-tight line-clamp-2 hover:text-[#FF4500] transition-colors">
          {item.title}
        </a>

        <div className="flex items-center gap-2 text-[11px] text-neutral-500 mt-1">
          <span className="flex items-center gap-1 text-yellow-500 font-bold">★ {item.reviewsPositive}%</span>
          <span>({fmt(item.reviewsCount)} avaliações)</span>
        </div>

        <div className="mt-auto pt-4 flex items-center justify-between gap-2">
          <div className="flex flex-col">
            {item.discount > 0 ? (
              <>
                <span className="line-through text-neutral-600 text-[10px] font-semibold">{fmt(item.originalPrice)} Kz</span>
                <span className="text-white font-black text-lg">{fmt(item.price)} Kz</span>
              </>
            ) : (
              <span className="text-white font-black text-lg">{fmt(item.price)} Kz</span>
            )}
          </div>

          <button 
            onClick={handleAddToCart}
            disabled={isAdded}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
              isAdded 
                ? "bg-emerald-500 text-white cursor-default" 
                : "bg-white/10 text-white hover:bg-[#FF4500] hover:scale-110 hover:shadow-[0_0_20px_rgba(255,69,0,0.4)]"
            }`}
          >
            {isAdded ? <Check className="w-5 h-5" /> : <ShoppingCart className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  )
}
