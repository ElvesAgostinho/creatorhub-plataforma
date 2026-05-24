"use client"

import { useState, useEffect } from "react"

export default function CarouselBackground() {
  const images = [
    "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2000&auto=format&fit=crop", // Pessoas reunidas / estudo
    "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2000&auto=format&fit=crop", // Reunião de equipa
    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2000&auto=format&fit=crop", // Colaboração criativa
    "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=2000&auto=format&fit=crop"  // Workshop / apresentação
  ]
  
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length)
    }, 5000) // Muda a cada 5 segundos
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="absolute inset-0 bg-black">
      {images.map((img, idx) => (
        <img
          key={idx}
          src={img}
          alt={`Fundo ${idx + 1}`}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
            current === idx ? "opacity-50" : "opacity-0"
          }`}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
    </div>
  )
}
