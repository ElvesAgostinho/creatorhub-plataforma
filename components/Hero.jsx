"use client"

import Image from "next/image"
import { Search } from "lucide-react"

export default function Hero() {
  return (
    <section className="relative w-full overflow-hidden bg-white pt-10 sm:pt-16 pb-0 md:h-[600px] flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 w-full h-full flex flex-col md:flex-row items-center justify-between gap-10">
        
        {/* Left Side Content */}
        <div className="w-full md:w-1/2 flex flex-col justify-center space-y-6 relative z-10 md:-mt-10">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[4.5rem] font-black text-neutral-900 leading-[1.05] tracking-tight">
            O que você quer <br />
            <span className="text-[#FF4500]">aprender</span> hoje?
          </h1>
          
          <p className="text-neutral-700 text-lg sm:text-xl font-medium max-w-md leading-relaxed">
            Pesquise um tema e escolha cursos perfeitos para você
          </p>

          <div className="pt-2">
            <form action="/marketplace" method="GET" className="relative flex items-center max-w-lg w-full">
              <input
                type="search"
                name="q"
                placeholder='Tente "marketing" ou "culinária"'
                className="w-full bg-[#f4f5f7] border border-transparent text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#FF4500] focus:border-transparent rounded-full pl-6 pr-14 py-4 text-base transition-all"
              />
              <button 
                type="submit" 
                className="absolute right-2 w-11 h-11 flex items-center justify-center bg-[#2b2b2b] hover:bg-[#1a1a1a] text-white rounded-full transition-colors"
                aria-label="Pesquisar"
              >
                <Search className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>

        {/* Right Side Graphic */}
        <div className="w-full md:w-1/2 relative h-[400px] md:h-full flex items-end justify-center md:justify-end">
          <div className="absolute inset-0 md:inset-y-0 right-0 w-full md:w-[120%] h-full">
            <Image
              src="/marketplace_hero_graphic.png?v=2"
              alt="Pessoa sorrindo e aprendendo"
              fill
              className="object-contain object-top md:object-right-top bg-white"
              priority
              unoptimized
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>

      </div>
    </section>
  )
}
