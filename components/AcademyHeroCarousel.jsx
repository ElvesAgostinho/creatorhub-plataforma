"use client"

import { useState, useEffect } from "react"

export default function AcademyHeroCarousel() {
  const images = [
    "/academy_carousel_1.png",
    "/academy_carousel_2.png",
    "/academy_carousel_3.png",
    "/academy_carousel_4.png",
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
