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
      <div
        className="bg-white px-4 py-2.5 rounded-2xl shadow-xl border border-neutral-100 text-sm font-semibold text-neutral-800 animate-fade-in pointer-events-auto cursor-pointer hover:shadow-2xl transition-shadow"
        onClick={handleOpenWhatsApp}
      >
        Precisas de ajuda? 👋
      </div>
      <div className="relative pointer-events-auto">
        <button
          onClick={() => setShow(false)}
          className="absolute -top-1 -right-1 bg-white text-neutral-400 hover:text-neutral-800 rounded-full w-5 h-5 flex items-center justify-center shadow-md border border-neutral-100 transition-colors z-10"
          aria-label="Fechar"
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        <button
          onClick={handleOpenWhatsApp}
          className="relative w-16 h-16 rounded-full flex items-center justify-center shadow-[0_8px_30px_rgba(37,211,102,0.4)] hover:shadow-[0_8px_40px_rgba(37,211,102,0.6)] transition-all hover:scale-110 ring-4 ring-white"
          style={{ background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)" }}
          aria-label="Falar no WhatsApp"
        >
          {/* Official WhatsApp SVG icon */}
          <svg viewBox="0 0 32 32" width="34" height="34" fill="white" xmlns="http://www.w3.org/2000/svg">
            <path d="M16.003 2.667C8.639 2.667 2.667 8.638 2.667 16c0 2.35.638 4.648 1.849 6.662L2.667 29.333l6.896-1.814A13.28 13.28 0 0 0 16.003 29.333C23.362 29.333 29.333 23.362 29.333 16c0-7.362-5.971-13.333-13.33-13.333zm0 24.267a11.023 11.023 0 0 1-5.636-1.546l-.404-.24-4.094 1.076 1.093-3.992-.263-.41A10.993 10.993 0 0 1 5.003 16C5.003 9.924 9.924 5.003 16.003 5.003S27.003 9.924 27.003 16c0 6.076-4.921 10.934-11 10.934zm6.06-8.194c-.332-.166-1.963-.967-2.267-1.078-.305-.11-.527-.166-.748.166-.222.332-.86 1.078-1.054 1.3-.193.222-.387.249-.72.083-.332-.166-1.404-.517-2.675-1.65-.988-.88-1.655-1.968-1.848-2.3-.194-.332-.021-.512.145-.677.15-.149.332-.387.499-.581.166-.194.222-.332.332-.554.111-.222.055-.415-.028-.581-.083-.166-.748-1.8-1.025-2.465-.27-.647-.545-.56-.748-.57-.193-.009-.415-.011-.637-.011s-.581.083-.886.415c-.304.332-1.164 1.138-1.164 2.772 0 1.634 1.192 3.213 1.358 3.435.166.222 2.347 3.583 5.686 5.024.794.343 1.414.548 1.897.701.797.253 1.523.218 2.097.132.64-.095 1.963-.803 2.24-1.578.276-.776.276-1.44.193-1.578-.083-.138-.305-.222-.637-.388z"/>
          </svg>
          {/* Online indicator */}
          <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-white border-2 border-[#25D366] rounded-full"></span>
        </button>
      </div>
    </div>
  )
}
