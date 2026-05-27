"use client"

import Image from "next/image"
import { Search } from "lucide-react"

export default function Hero() {
  return (
    <section className="relative w-full h-[500px] md:h-[600px] bg-white overflow-hidden">
      
      {/* Beautiful Static Background Image (Full Width/Extremities) */}
      <div className="absolute inset-0">
        <Image
          src="/hero-white.png"
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
        <div className="inline-flex items-center gap-2 bg-[#FF4500]/10 border border-[#FF4500]/20 text-[#FF4500] text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full w-fit">
          <span className="w-2 h-2 rounded-full bg-[#FF4500] animate-pulse" />
          O Marketplace dos Criadores
        </div>
        
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

        <div className="flex items-center gap-6 pt-6 border-t border-neutral-200">
          <div className="flex -space-x-3">
            {[1,2,3,4].map(i => (
              <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-neutral-300 overflow-hidden">
                <Image src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" width={40} height={40} />
              </div>
            ))}
          </div>
          <div className="text-sm font-medium text-neutral-600">
            Junta-te a mais de <span className="text-neutral-900 font-bold">10.000 alunos</span><br />
            que já estão a aprender.
          </div>
        </div>
      </div>

    </section>
  )
}
