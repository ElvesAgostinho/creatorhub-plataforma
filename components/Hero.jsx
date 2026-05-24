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
    <section
      className="relative w-full bg-neutral-900 text-white overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative h-[420px] sm:h-[480px] md:h-[560px]">
        {slides.map((s, idx) => (
          <div
            key={s.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${idx === i ? "opacity-100" : "opacity-0 pointer-events-none"}`}
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
              <div className="absolute inset-0 flex items-center justify-center text-neutral-500 bg-neutral-800">
                Sem capa
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/20" />
          </div>
        ))}

        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 flex items-center">
          <div className="max-w-xl space-y-4">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold px-2 py-1 rounded ${typeBadgeColor[current.type] || "bg-white text-black"}`}>
                {typeLabels[current.type]?.toUpperCase()}
              </span>
              {current.bestSeller && (
                <span className="text-xs font-bold bg-yellow-300 text-black px-2 py-1 rounded">
                  BEST SELLER
                </span>
              )}
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight">
              {current.title}
            </h2>

            <p className="text-white/85 text-sm sm:text-base">
              Com <span className="font-semibold">{current.instructor}</span>{current.role ? ` · ${current.role}` : ""}
            </p>

            <p className="text-white/75 text-sm sm:text-base max-w-md">
              {current.description}
            </p>

            <div className="flex items-center gap-4 pt-2">
              <a
                href={`/product/${current.slug}`}
                className="inline-flex items-center gap-2 bg-[#0E7C86] hover:bg-[#0a626a] transition px-6 py-3 rounded-lg font-bold shadow-lg"
              >
                <CartIcon />
                Comprar  {current.price.toLocaleString("pt-PT")} Kz
              </a>

              {current.discount > 0 && (
                <div className="text-sm">
                  <span className="text-yellow-300 font-bold">{current.discount}% desc.</span>
                  <span className="line-through opacity-70 ml-2">
                    {current.originalPrice.toLocaleString("pt-PT")} Kz
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4 text-xs text-white/80 pt-2">
              <span>👍 {current.reviewsPositive}% positivos ({current.reviewsCount})</span>
              <span>👤 {current.students.toLocaleString("pt-PT")} alunos</span>
            </div>
          </div>
        </div>

        {slides.length > 1 && (
          <>
            <button
              onClick={prev}
              aria-label="Anterior"
              className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur items-center justify-center"
            >
              ‹
            </button>
            <button
              onClick={next}
              aria-label="Próximo"
              className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur items-center justify-center"
            >
              ›
            </button>

            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setI(idx)}
                  aria-label={`Slide ${idx + 1}`}
                  className={`h-2 rounded-full transition-all ${idx === i ? "w-8 bg-white" : "w-2 bg-white/50 hover:bg-white/80"}`}
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
