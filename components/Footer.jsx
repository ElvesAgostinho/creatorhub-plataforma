"use client"

import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { X } from "lucide-react"

export default function Footer() {
  const pathname = usePathname()
  const isLearn = pathname.startsWith("/learn") || pathname.startsWith("/checkout")
  
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    const hideBanner = localStorage.getItem("hidePromoBanner")
    if (!hideBanner) {
      setShowBanner(true)
    }
  }, [])

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
            <li><a href="/signup" className="hover:text-neutral-900 transition">Cadastre-se gratuitamente</a></li>
            <li><a href="/blog" className="hover:text-neutral-900 transition">Materiais Educativos</a></li>
            <li><a href="/features" className="hover:text-neutral-900 transition">Como funciona?</a></li>
            <li><a href="/support" className="hover:text-neutral-900 transition">Suporte e Ajuda</a></li>
          </ul>
          <ul className="space-y-4">
            <li><a href="#affiliates" className="hover:text-neutral-900 transition">Afiliado</a></li>
            <li><a href="/features" className="hover:text-neutral-900 transition">Soluções da ABOVE</a></li>
            <li><a href="/blog" className="hover:text-neutral-900 transition">Marketing Digital</a></li>
            <li><a href="/academy" className="hover:text-neutral-900 transition">Capacitação para creators</a></li>
          </ul>
          <ul className="space-y-4">
            <li><a href="/features" className="hover:text-neutral-900 transition">Venda mais</a></li>
          </ul>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col lg:flex-row justify-between items-end gap-8 border-t border-neutral-100 pt-8">
          <div className="md:col-span-1">
            <a href="/" className="inline-block mb-4">
              <img src="/logo.png" alt="Plataforma Logo" className="h-6 w-auto object-contain grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all" />
            </a>
            {/* Social Icons */}
            <div className="flex gap-3">
              <SocialIcon icon="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              <SocialIcon icon="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              <SocialIcon icon="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.34 2.88 2.88 0 0 1 2.9-3.93h.28V9.63h-.26a6.33 6.33 0 0 0-6.1 6.15 6.33 6.33 0 0 0 6.3 6.3 6.33 6.33 0 0 0 6.27-6.22v-6.3a8.27 8.27 0 0 0 5.4 1.95v-3.41a5.06 5.06 0 0 1-2.37-.8z" />
              <SocialIcon icon="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              <SocialIcon icon="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              <SocialIcon icon="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
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
