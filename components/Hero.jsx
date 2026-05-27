"use client"

import Image from "next/image"
import { Search } from "lucide-react"

export default function Hero() {
  return (
    <section className="relative w-full overflow-hidden bg-[#FAFAFA] pt-6 px-4 sm:px-6">
      <div className="relative h-[480px] sm:h-[520px] md:h-[600px] max-w-7xl mx-auto rounded-[2.5rem] overflow-hidden shadow-2xl shadow-neutral-200/50">
        
        {/* Beautiful Static Background Image */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2000&auto=format&fit=crop"
            alt="Pessoas a aprender e partilhar conhecimento"
            fill
            className="object-cover"
            priority
          />
          {/* Gradient Overlays for Readability and Depth */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent sm:hidden" />
        </div>

        <div className="relative h-full px-6 sm:px-12 md:px-16 flex flex-col justify-center max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full w-fit">
            <span className="w-2 h-2 rounded-full bg-[#FF4500] animate-pulse" />
            O Marketplace dos Criadores
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-white leading-[1.05] tracking-tight drop-shadow-lg">
            Aprende o que <br /> <span className="text-[#FF4500]">realmente importa.</span>
          </h1>
          
          <p className="text-white/80 text-lg sm:text-xl font-medium max-w-xl leading-relaxed">
            Explora centenas de cursos, mentorias e e-books exclusivos criados pelos melhores especialistas do mercado.
          </p>

          <div className="pt-4">
            <form action="/marketplace" method="GET" className="relative flex items-center max-w-md">
              <input
                type="search"
                name="q"
                placeholder="O que queres aprender hoje?"
                className="w-full bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/50 focus:bg-white focus:text-black focus:placeholder-neutral-400 rounded-full pl-6 pr-14 py-4 text-base outline-none transition-all shadow-lg"
              />
              <button type="submit" className="absolute right-2 w-10 h-10 flex items-center justify-center bg-[#FF4500] hover:bg-[#e63e00] text-white rounded-full transition-colors">
                <Search className="w-5 h-5" />
              </button>
            </form>
          </div>

          <div className="flex items-center gap-6 pt-6 border-t border-white/10">
            <div className="flex -space-x-3">
              {[1,2,3,4].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-[#1a1a1a] bg-neutral-300 overflow-hidden">
                  <Image src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" width={40} height={40} />
                </div>
              ))}
            </div>
            <div className="text-sm font-medium text-white/80">
              Junta-te a mais de <span className="text-white font-bold">10.000 alunos</span><br />
              que já estão a aprender.
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
