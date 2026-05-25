"use client"

import { useEffect, useState, useCallback } from "react"
import Image from "next/image"

const AUTO_MS = 5000

const typeLabels = {
  course: "Curso",
  book: "Livro",
  mentorship: "Mentoria",
  event: "Evento"
}

const typeBadgeColor = {
  course: "bg-yellow-300 text-black",
  book: "bg-emerald-300 text-emerald-950",
  mentorship: "bg-fuchsia-300 text-fuchsia-950",
  event: "bg-sky-300 text-sky-950"
}

export default function Hero({ slides = [] }) {
  const [i, setI] = useState(0)
  const [paused, setPaused] = useState(false)

  const next = useCallback(
    () => setI(p => (slides.length ? (p + 1) % slides.length : 0)),
    [slides.length]
  )
  const prev = useCallback(
    () => setI(p => (slides.length ? (p - 1 + slides.length) % slides.length : 0)),
    [slides.length]
  )

  useEffect(() => {
    if (paused || slides.length <= 1) return
    const id = setInterval(next, AUTO_MS)
    return () => clearInterval(id)
  }, [next, paused, slides.length])

  if (!slides.length) {
    return (
      <section className="bg-neutral-900 text-white py-16 text-center">
        <h2 className="text-2xl font-bold">Catálogo a chegar…</h2>
        <p className="text-white/70 mt-2 text-sm">Aplica a migração Supabase para ver os produtos.</p>
      </section>
    )
  }

  const current = slides[i]

  return (
  return (
    <section
      className="relative w-full overflow-hidden bg-[#FAFAFA] pt-6 px-4 sm:px-6"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative h-[480px] sm:h-[520px] md:h-[600px] max-w-7xl mx-auto rounded-[2rem] overflow-hidden shadow-2xl shadow-neutral-200/50">
        {slides.map((s, idx) => (
          <div
            key={s.id}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${idx === i ? "opacity-100 scale-100" : "opacity-0 scale-105 pointer-events-none"}`}
            aria-hidden={idx !== i}
          >
            {s.image ? (
              <Image
                src={s.image}
                alt={s.title}
                fill
                className="object-cover"
                priority={idx === 0}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-neutral-500 bg-neutral-200">
                Sem capa
              </div>
            )}
            {/* Premium Dark Gradient Overlay for Readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A]/95 via-[#0A0A0A]/70 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/80 via-transparent to-transparent sm:hidden" />
          </div>
        ))}

        <div className="relative h-full px-6 sm:px-12 md:px-16 flex items-center">
          <div className="max-w-2xl space-y-5 text-white">
            <div className="flex items-center gap-3">
              <span className={`text-[11px] font-extrabold uppercase tracking-wider px-3 py-1.5 rounded-lg shadow-lg ${typeBadgeColor[current.type] || "bg-white text-neutral-900"}`}>
                {typeLabels[current.type]}
              </span>
              {current.bestSeller && (
                <span className="text-[11px] font-extrabold bg-[#FF4500] text-white px-3 py-1.5 rounded-lg tracking-wider shadow-[0_0_15px_rgba(255,69,0,0.5)]">
                  BEST SELLER
                </span>
              )}
            </div>

            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black leading-[1.1] tracking-tight drop-shadow-lg">
              {current.title}
            </h2>

            <p className="text-white/90 text-sm sm:text-lg font-medium flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm text-sm">👤</span>
              <span>Por <span className="font-bold">{current.instructor}</span>{current.role ? ` · ${current.role}` : ""}</span>
            </p>

            <p className="text-white/70 text-sm sm:text-base max-w-xl leading-relaxed">
              {current.description}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-4">
              <a
                href={`/product/${current.slug}`}
                className="inline-flex items-center gap-3 bg-white text-neutral-900 hover:bg-[#FF4500] hover:text-white transition-all duration-300 px-8 py-4 rounded-2xl font-black text-lg shadow-[0_8px_30px_rgba(255,255,255,0.2)] hover:shadow-[0_8px_30px_rgba(255,69,0,0.4)] group"
              >
                <CartIcon />
                <span>Comprar agora por {current.price.toLocaleString("pt-PT")} Kz</span>
              </a>

              {current.discount > 0 && (
                <div className="flex flex-col bg-black/30 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
                  <span className="text-[#FF4500] font-black text-sm uppercase tracking-widest">{current.discount}% desc.</span>
                  <span className="line-through text-white/50 text-xs font-semibold">
                    {current.originalPrice.toLocaleString("pt-PT")} Kz
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-6 text-sm font-semibold text-white/80 pt-4 border-t border-white/10 w-max">
              <span className="flex items-center gap-2">
                <span className="text-yellow-400">★</span> 
                {current.reviewsPositive}% positivos ({current.reviewsCount})
              </span>
              <span className="flex items-center gap-2">
                👥 {current.students.toLocaleString("pt-PT")} alunos
              </span>
            </div>
          </div>
        </div>

        {slides.length > 1 && (
          <>
            <button
              onClick={prev}
              aria-label="Anterior"
              className="hidden sm:flex absolute left-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-black/20 hover:bg-[#FF4500] hover:scale-110 text-white backdrop-blur-md border border-white/10 items-center justify-center transition-all shadow-xl"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <button
              onClick={next}
              aria-label="Próximo"
              className="hidden sm:flex absolute right-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-black/20 hover:bg-[#FF4500] hover:scale-110 text-white backdrop-blur-md border border-white/10 items-center justify-center transition-all shadow-xl"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </button>

            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-3">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setI(idx)}
                  aria-label={`Slide ${idx + 1}`}
                  className={`h-2 rounded-full transition-all duration-500 ${idx === i ? "w-10 bg-[#FF4500] shadow-[0_0_10px_rgba(255,69,0,0.8)]" : "w-2 bg-white/40 hover:bg-white/80"}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  )
}

function CartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" />
    </svg>
  )
}
