"use client"

import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { X } from "lucide-react"

export default function Footer({ user }) {
  const pathname = usePathname()
  const isLearn = pathname.startsWith("/learn") || pathname.startsWith("/checkout")
  
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    // Only show banner to users who are NOT logged in
    const hideBanner = localStorage.getItem("hidePromoBanner")
    if (!hideBanner && !user) {
      setShowBanner(true)
    }
  }, [user])

  const closeBanner = () => {
    setShowBanner(false)
    localStorage.setItem("hidePromoBanner", "true")
  }

  if (isLearn) return null; // Não mostrar rodapé no player de aulas nem no checkout

  return (
    <footer className="bg-white text-neutral-600 border-t border-neutral-200 mt-20 pt-10 pb-32 relative text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 mb-16 text-neutral-500 font-medium text-sm">
          <a href="/" className="hover:text-neutral-900 transition">Início</a>
          <span className="text-neutral-300">/</span>
          <a href="/blog" className="hover:text-neutral-900 transition">Blog</a>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-20 font-medium">
          <ul className="space-y-4">
            <li><a href={user ? "/library" : "/signup"} className="hover:text-neutral-900 transition">{user ? "A minha Biblioteca" : "Cadastre-se gratuitamente"}</a></li>
            <li><a href="/blog" className="hover:text-neutral-900 transition">Materiais Educativos</a></li>
            <li><a href="/features" className="hover:text-neutral-900 transition">Como funciona?</a></li>
            <li><a href="/support" className="hover:text-neutral-900 transition">Suporte e Ajuda</a></li>
          </ul>
          <ul className="space-y-4">
            <li><a href={user ? "/affiliates" : "/login?next=/affiliates"} className="hover:text-neutral-900 transition">Afiliado</a></li>
            <li><a href="/features" className="hover:text-neutral-900 transition">Soluções da ABOVE</a></li>
            <li><a href="/blog" className="hover:text-neutral-900 transition">Marketing Digital</a></li>
            <li><a href={user ? "/become-creator" : "/login?next=/become-creator"} className="hover:text-neutral-900 transition">Capacitação para creators</a></li>
          </ul>
          <ul className="space-y-4">
            <li><a href="/marketplace" className="hover:text-neutral-900 transition">Venda mais (Marketplace)</a></li>
          </ul>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col lg:flex-row justify-between items-end gap-8 border-t border-neutral-100 pt-8">
          <div className="md:col-span-1">
            <a href="/" className="inline-block">
              <span className="text-2xl font-black italic tracking-tighter text-neutral-900 opacity-80 hover:opacity-100 transition-all">ABOVE</span>
            </a>
            {/* Social Icons */}
            <div className="flex gap-3 mt-4">
              {/* YOUTUBE */}
              <a href="https://www.youtube.com/@AbovedinheironaNET" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-600 hover:text-[#FF4500] hover:border-[#FF4500] transition group">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 transition-transform group-hover:scale-110">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
              {/* INSTAGRAM */}
              <a href="https://www.instagram.com/abovedinheironanet?igsh=MXJxcnc3dnQ5Z3pvMw%3D%3D&utm_source=qr" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-600 hover:text-[#FF4500] hover:border-[#FF4500] transition group">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 transition-transform group-hover:scale-110">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
              {/* FACEBOOK */}
              <a href="https://www.facebook.com/abovedinheironanet" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-600 hover:text-[#FF4500] hover:border-[#FF4500] transition group">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 transition-transform group-hover:scale-110">
                  <path d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14c-.326-.043-1.557-.14-2.857-.14C11.928 2 10 3.657 10 6.7v2.8H7.5v4H10v9.5h4v-9.5z" />
                </svg>
              </a>
              {/* TIKTOK */}
              <a href="https://www.tiktok.com/@abovedinheironanet7?_r=1&_t=ZS-96XxBGv5CLc" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-600 hover:text-[#FF4500] hover:border-[#FF4500] transition group">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 transition-transform group-hover:scale-110">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.12-3.44-3.17-3.64-5.46-.17-2.39.81-4.75 2.59-6.25 1.5-1.28 3.48-1.93 5.44-1.81.18.01.35.03.53.05v4.2c-.17-.03-.34-.05-.51-.06-.82-.06-1.66.08-2.39.46-.98.51-1.74 1.4-1.95 2.49-.24 1.25.13 2.56.98 3.43.76.78 1.86 1.15 2.94 1.05 1.34-.13 2.47-1.07 2.85-2.35.15-.51.21-1.05.21-1.58V.02z" />
                </svg>
              </a>
            </div>
            
            <div className="mt-6">
              <p className="text-xs text-neutral-400 font-medium uppercase tracking-wider mb-2">Suporte e Contacto</p>
              <a href="mailto:abovesuporte25@gmail.com" className="text-sm font-semibold hover:text-[#FF4500] transition">
                abovesuporte25@gmail.com
              </a>
            </div>
          </div>
          
          <div className="bg-[#F0F4F4] px-4 py-3 rounded-lg flex items-center justify-between min-w-[240px] text-neutral-800 font-semibold text-sm cursor-pointer hover:bg-[#e4ecec] transition">
            <div className="flex flex-col">
              <span className="text-[10px] text-neutral-500 font-normal">Idioma</span>
              Português - Angola
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
          </div>
        </div>
      </div>

      {/* Floating Orange Banner */}
      {showBanner && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#FF4500] text-white py-3 px-4 z-40 flex items-center justify-center font-bold text-sm sm:text-base animate-in slide-in-from-bottom-10">
          <div className="flex items-center justify-center gap-2 max-w-4xl w-full relative">
            <p>
              Criar um produto digital na internet não precisa ser um bicho de sete cabeças... 
              <a href="/signup" className="underline decoration-2 underline-offset-2 hover:text-neutral-200 transition ml-1">Clique aqui</a>
            </p>
            <button 
              onClick={closeBanner}
              className="absolute right-0 p-1 hover:bg-white/20 rounded-full transition"
              aria-label="Fechar banner"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}
    </footer>
  )
}

function SocialIcon({ icon }) {
  return (
    <a href="#" className="w-10 h-10 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-600 hover:text-[#FF4500] hover:border-[#FF4500] transition group">
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 transition-transform group-hover:scale-110">
        <path d={icon} />
      </svg>
    </a>
  )
}
