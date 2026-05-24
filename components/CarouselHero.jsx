"use client"

import { useState, useEffect } from "react"

export default function CarouselHero() {
  const slides = [
    {
      // Cena de cinema - Mulher negra a liderar uma reunião de forma imponente
      image: "https://images.unsplash.com/photo-1573164574572-cb89e39749b4?q=80&w=2000&auto=format&fit=crop", 
      title: "O Teu Império de Conhecimento",
      description: "Junta-te aos líderes que estão a moldar o futuro. Acede a conteúdos exclusivos, aulas de excelência e uma comunidade vibrante."
    },
    {
      // Estúdio de som/vídeo premium - criatividade e profissionalismo
      image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2000&auto=format&fit=crop",
      title: "Acelera a tua Carreira",
      description: "Aprende com os melhores profissionais. Conteúdo prático, masterclasses ao vivo e networking com quem já chegou onde queres estar."
    },
    {
      // Homem negro em ambiente de luxo/sucesso focado
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=2000&auto=format&fit=crop", 
      title: "Domina a Tua Arte",
      description: "Do zero à mestria. O teu passe VIP para dezenas de cursos completos num único lugar, com acesso ilimitado."
    },
    {
      // Ambiente arquitetónico brutalista/tecnológico
      image: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2000&auto=format&fit=crop",
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
      <div className="relative z-10 w-full max-w-5xl mx-auto flex items-center justify-center min-h-[400px]">
        {slides.map((slide, idx) => (
          <div 
            key={`txt-${idx}`} 
            className={`absolute w-full px-4 text-center transition-all duration-1000 transform flex flex-col items-center ${
              current === idx ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8 pointer-events-none"
            }`}
          >
            <div className="bg-black/20 backdrop-blur-md border border-white/10 p-8 md:p-12 rounded-3xl max-w-4xl mx-auto shadow-2xl">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 text-white drop-shadow-2xl leading-tight">
                {slide.title}
              </h1>
              <p className="text-lg md:text-2xl text-neutral-200 max-w-2xl mx-auto drop-shadow-lg font-medium leading-relaxed">
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
