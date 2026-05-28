"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"

export default function FloatingWhatsApp({ user }) {
  const [show, setShow] = useState(false)
  const pathname = usePathname()
  
  const isLearn = pathname?.startsWith("/learn") || pathname?.startsWith("/checkout")
  const isAuth = pathname?.startsWith("/login") || pathname?.startsWith("/signup")

  useEffect(() => {
    // Only show for non-logged in users after a slight delay to avoid jarring pop-in
    if (!user && !isLearn && !isAuth) {
      const timer = setTimeout(() => setShow(true), 2000)
      return () => clearTimeout(timer)
    }
  }, [user, isLearn, isAuth])

  if (!show || isLearn || isAuth) return null

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
      <div className="relative pointer-events-auto">
        <button 
          onClick={() => setShow(false)}
          className="absolute -top-1 -right-1 bg-white text-neutral-400 hover:text-neutral-800 rounded-full w-5 h-5 flex items-center justify-center shadow-md border border-neutral-100 transition-colors z-10"
          aria-label="Fechar assistente"
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
        <button 
          onClick={handleOpenWhatsApp}
          className="relative w-16 h-16 rounded-full flex items-center justify-center shadow-[0_8px_30px_rgba(0,0,0,0.15)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.25)] transition-all hover:scale-105 group overflow-hidden ring-4 ring-white"
        >
          <img 
            src="/whatsapp_icon_black.png" 
            alt="Suporte Automático" 
            className="w-full h-full object-cover object-top bg-white"
          />
          {/* Green dot indicating online status */}
          <span className="absolute bottom-0 right-0 w-4 h-4 bg-[#25D366] border-2 border-white rounded-full"></span>
        </button>
      </div>
    </div>
  )
}
