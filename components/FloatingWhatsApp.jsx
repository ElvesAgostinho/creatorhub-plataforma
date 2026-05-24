"use client"

import { MessageCircle } from "lucide-react"
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
        className="w-14 h-14 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-full flex items-center justify-center shadow-[0_8px_30px_rgba(37,211,102,0.4)] hover:shadow-[0_8px_30px_rgba(37,211,102,0.6)] transition-all hover:scale-110 group pointer-events-auto"
      >
        <MessageCircle className="w-7 h-7 group-hover:animate-pulse" />
      </button>
    </div>
  )
}
