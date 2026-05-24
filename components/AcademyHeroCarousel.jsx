"use client"

import { useState, useEffect } from "react"

export default function AcademyHeroCarousel() {
  const images = [
    "https://images.unsplash.com/photo-1573164713988-8665fc963095?q=80&w=1200&auto=format&fit=crop", // Black man on device
    "https://images.unsplash.com/photo-1573164574472-797cdf4a583a?q=80&w=1200&auto=format&fit=crop", // Black woman smiling on laptop
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200&auto=format&fit=crop", // Mixed group/person working
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop", // Asian woman on laptop
  ]

  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="absolute inset-0 w-full h-full bg-neutral-900">
      {images.map((src, idx) => (
        <img
          key={idx}
          src={src}
          alt={`Estudante ${idx + 1}`}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
            current === idx ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
      {/* Overlay opcional para garantir bom contraste se necessário, ou apenas deixar as fotos puras */}
      <div className="absolute inset-0 bg-black/10"></div>
    </div>
  )
}
