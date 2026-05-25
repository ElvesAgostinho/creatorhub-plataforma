"use client"

import { useState, useEffect } from "react"

export default function CarouselHero() {
  const slides = [
    {
      // Abstract dark waves - Premium tech vibe
      image: "https://images.unsplash.com/photo-1614850715649-1d0106293cb1?q=80&w=2000&auto=format&fit=crop", 
      title: "O Teu Império de Conhecimento",
      description: "Junta-te aos líderes que estão a moldar o futuro. Acede a conteúdos exclusivos, aulas de excelência e uma comunidade vibrante."
    },
    {
      // Dark cinematic creative space
      image: "https://images.unsplash.com/photo-1600861194942-f883de0dfe96?q=80&w=2000&auto=format&fit=crop",
      title: "Acelera a tua Carreira",
      description: "Aprende com os melhores profissionais. Conteúdo prático, masterclasses ao vivo e networking com quem já chegou onde queres estar."
    },
    {
      // Premium liquid dark aesthetic
      image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2000&auto=format&fit=crop", 
      title: "Domina a Tua Arte",
      description: "Do zero à mestria. O teu passe VIP para dezenas de cursos completos num único lugar, com acesso ilimitado."
    },
    {
      // Minimalist sleek dark architecture
      image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2000&auto=format&fit=crop",
      title: "Faz Parte da Elite",
      description: "Não caminhes sozinho. Debate ideias, partilha resultados e cresce de forma exponencial com mentes brilhantes."
    }
  ]
  
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length)
    }, 7000)
    return () => clearInterval(timer)
  }, [])

  return (
    <>
      {/* Background Images */}
      {slides.map((slide, idx) => (
        <div key={`bg-${idx}`} className={`absolute inset-0 transition-opacity duration-[1500ms] ease-in-out ${current === idx ? "opacity-100" : "opacity-0"}`}>
          <img
            src={slide.image}
            alt={`Fundo ${idx + 1}`}
            className="w-full h-full object-cover opacity-60"
          />
        </div>
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/80"></div>

      {/* Text Content */}
      <div className="relative z-10 w-full h-full flex items-center justify-center min-h-[450px]">
        {slides.map((slide, idx) => (
          <div 
            key={`txt-${idx}`} 
            className={`absolute w-full px-4 text-center transition-all duration-1000 transform flex flex-col items-center ${
              current === idx ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-95 pointer-events-none"
            }`}
          >
            <div className="max-w-5xl mx-auto flex flex-col items-center">
              <div className="mb-4 inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-sm font-bold uppercase tracking-widest shadow-lg shadow-black/20">
                Acesso Exclusivo
              </div>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-6 text-transparent bg-clip-text bg-gradient-to-b from-white to-neutral-400 drop-shadow-2xl leading-tight pb-2">
                {slide.title}
              </h1>
              <p className="text-lg md:text-2xl text-neutral-300 max-w-3xl mx-auto drop-shadow-xl font-medium leading-relaxed">
                {slide.description}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      {/* Dots Indicator */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-4 z-20">
        {slides.map((_, idx) => (
          <button 
            key={`dot-${idx}`}
            onClick={() => setCurrent(idx)}
            className={`h-2 rounded-full transition-all duration-500 ${current === idx ? "bg-[#FF4500] w-12 shadow-[0_0_10px_rgba(255,69,0,0.8)]" : "bg-white/30 w-3 hover:bg-white/60"}`}
            aria-label={`Ir para o slide ${idx + 1}`}
          />
        ))}
      </div>
    </>
  )
}
