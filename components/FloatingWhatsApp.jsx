"use client"

import { useState, useEffect } from "react"

export default function FloatingWhatsApp({ user }) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    // Only show for non-logged in users after a slight delay to avoid jarring pop-in
    if (!user) {
      const timer = setTimeout(() => setShow(true), 2000)
      return () => clearTimeout(timer)
    }
  }, [user])

  if (!show) return null

  const handleOpenWhatsApp = () => {
    const phone = "244900000000" // Replace with real platform number
    const msg = "Olá! Gostaria de saber mais sobre a plataforma e como aceder aos cursos."
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`
    window.open(url, "_blank")
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 pointer-events-none">
      <div className="bg-white px-4 py-2 rounded-2xl shadow-xl border border-neutral-100 text-sm font-semibold text-neutral-800 animate-fade-in pointer-events-auto cursor-pointer" onClick={handleOpenWhatsApp}>
        Precisas de ajuda? 👋
      </div>
      <button 
        onClick={handleOpenWhatsApp}
        className="relative w-16 h-16 rounded-full flex items-center justify-center shadow-[0_8px_30px_rgba(0,0,0,0.15)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.25)] transition-all hover:scale-105 group pointer-events-auto overflow-hidden ring-4 ring-white"
      >
        <img 
          src="/bot_avatar.png" 
          alt="Suporte Automático" 
          className="w-full h-full object-cover object-center"
        />
        {/* Green dot indicating online status */}
        <span className="absolute bottom-0 right-0 w-4 h-4 bg-[#25D366] border-2 border-white rounded-full"></span>
      </button>
    </div>
  )
}
