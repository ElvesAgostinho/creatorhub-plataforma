"use client"

import Image from "next/image"
import { Search } from "lucide-react"

export default function Hero() {
  return (
    <section className="relative w-full h-[500px] md:h-[600px] bg-white overflow-hidden">
      
      {/* Beautiful Static Background Image (Full Width/Extremities) */}
      <div className="absolute inset-0">
        <Image
          src="/hero_mobile.png"
          alt="Pessoas a aprender num ambiente moderno e corporativo"
          fill
          className="object-cover object-[center_right]"
          priority
        />
        {/* Gradient Overlays for Readability against white */}
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent sm:hidden" />
      </div>

      <div className="relative h-full px-6 sm:px-12 md:px-16 flex flex-col justify-center max-w-7xl mx-auto space-y-6">
        {/* Badge removed per user request */}
        
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-neutral-900 leading-[1.05] tracking-tight">
          Aprende o que <br /> <span className="text-[#FF4500]">realmente importa.</span>
        </h1>
        
        <p className="text-neutral-600 text-lg sm:text-xl font-medium max-w-xl leading-relaxed">
          Explora centenas de cursos, mentorias e e-books exclusivos criados pelos melhores especialistas do mercado.
        </p>

        <div className="pt-4">
          <form action="/marketplace" method="GET" className="relative flex items-center max-w-md">
            <input
              type="search"
              name="q"
              placeholder="O que queres aprender hoje?"
              className="w-full bg-white border border-neutral-300 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#FF4500] focus:border-transparent rounded-full pl-6 pr-14 py-4 text-base transition-all shadow-md"
            />
            <button type="submit" className="absolute right-2 w-10 h-10 flex items-center justify-center bg-[#FF4500] hover:bg-[#e63e00] text-white rounded-full transition-colors">
              <Search className="w-5 h-5" />
            </button>
          </form>
        </div>

        {/* Removed social proof section per user request */}
      </div>

    </section>
  )
}
