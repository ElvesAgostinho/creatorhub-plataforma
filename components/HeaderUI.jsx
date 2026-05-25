"use client"

import { usePathname } from "next/navigation"
import { useState } from "react"
import { Book, Settings, Crown, LogOut, ShoppingCart, DollarSign, Mic } from "lucide-react"
import { categoryTree } from "@/lib/data/categories"
import { useCart } from "./CartContext"

export default function HeaderUI({ user, profile, unreadCount = 0 }) {
  const pathname = usePathname()
  const isMarketplace = pathname === "/marketplace" || pathname.startsWith("/marketplace/")
  const isLearn = pathname.startsWith("/learn") || pathname.startsWith("/checkout")
  const initial = user ? (user.email || "?").slice(0, 1).toUpperCase() : ""
  
  const { cart, setIsCartOpen, isMounted } = useCart()

  if (isLearn) return null;

  if (isMarketplace) {
    return (
      <header className="bg-white text-neutral-900 border-b border-neutral-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 py-3">
          
          <div className="flex items-center gap-6">
            <a href="/marketplace" className="flex items-center gap-1">
              <span className="text-2xl font-black italic tracking-tighter text-[#FF4500]">ABOVE</span>
              <span className="text-neutral-500 font-medium ml-2 border-l border-neutral-300 pl-2">Marketplace</span>
            </a>

            <div className="hidden md:block relative group">
              <button className="flex items-center gap-1 text-sm font-semibold hover:text-[#FF4500] transition h-full py-4">
                Categorias
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
              </button>
              
              <div className="absolute left-0 top-full opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="bg-white border border-neutral-200 rounded-xl shadow-xl py-2 min-w-[260px] flex flex-col">
                  {Object.keys(categoryTree).map(cat => (
                    <div key={cat} className="group/sub relative">
                      <a href={`/marketplace?category=${encodeURIComponent(cat)}`} className="px-4 py-2 hover:bg-neutral-50 text-sm font-medium flex justify-between items-center w-full text-left">
                        {cat}
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
                      </a>
                      {categoryTree[cat]?.length > 0 && (
                        <div className="absolute left-full top-0 opacity-0 invisible group-hover/sub:opacity-100 group-hover/sub:visible transition-all duration-200">
                          <div className="bg-white border border-neutral-200 rounded-xl shadow-xl py-2 min-w-[220px] ml-1 flex flex-col">
                            {categoryTree[cat].map(sub => (
                              <a key={sub} href={`/marketplace?category=${encodeURIComponent(sub)}`} className="px-4 py-2 hover:bg-neutral-50 text-sm font-medium">
                                {sub}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {/* FORMATOS (Cursos, Eventos, Mentorias) */}
                  <div className="group/sub relative border-t border-neutral-100">
                    <div className="px-4 py-2 hover:bg-neutral-50 text-sm font-medium flex justify-between items-center w-full text-left cursor-default">
                      Formações
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
                    </div>
                    <div className="absolute left-full bottom-0 opacity-0 invisible group-hover/sub:opacity-100 group-hover/sub:visible transition-all duration-200">
                      <div className="bg-white border border-neutral-200 rounded-xl shadow-xl py-2 min-w-[220px] ml-1 flex flex-col">
                        <a href="/marketplace?type=course" className="px-4 py-2 hover:bg-neutral-50 text-sm font-medium">Cursos</a>
                        <a href="/marketplace?type=event" className="px-4 py-2 hover:bg-neutral-50 text-sm font-medium">Eventos</a>
                        <a href="/marketplace?type=mentorship" className="px-4 py-2 hover:bg-neutral-50 text-sm font-medium">Mentorias</a>
                        <a href="/marketplace?type=book" className="px-4 py-2 hover:bg-neutral-50 text-sm font-medium">E-books / PDF</a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 max-w-xl mx-6 hidden md:block">
            <form method="GET" action="/marketplace" className="relative flex items-center">
              <input
                type="search"
                name="q"
                placeholder="Pesquisar por cursos ou mentorias"
                className="w-full bg-neutral-100 border border-transparent focus:border-neutral-300 focus:bg-white rounded-full pl-5 pr-12 py-2.5 text-sm outline-none transition"
              />
              <button type="submit" className="absolute right-1 w-8 h-8 flex items-center justify-center bg-[#2A2A2A] hover:bg-black text-white rounded-full transition">
                <SearchIcon />
              </button>
            </form>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative text-neutral-600 hover:text-[#FF4500] transition p-2"
            >
              <ShoppingCart className="w-5 h-5" />
              {isMounted && cart.length > 0 && (
                <span className="absolute top-0 right-0 bg-[#FF4500] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                  {cart.length}
                </span>
              )}
            </button>
            {user ? (
              <div className="flex items-center gap-4">
                <a href="/library" className="hidden sm:inline-block border border-[#FF4500] text-[#FF4500] hover:bg-[#FFF0EB] font-bold text-sm px-4 py-1.5 rounded-full transition">
                  Meus Cursos
                </a>
                <div className="relative group">
                  <button className="flex items-center gap-2 hover:opacity-80 focus:outline-none py-2">
                    <span className="w-9 h-9 rounded-full bg-[#FF4500] text-white flex items-center justify-center font-bold text-sm shadow-md">
                      {initial}
                    </span>
                  </button>
                  <div className="absolute right-0 top-full pt-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="bg-white border border-neutral-200 rounded-xl shadow-xl w-60 flex flex-col overflow-hidden">
                      <div className="px-4 py-3 bg-neutral-50 border-b border-neutral-100">
                        <p className="text-sm font-bold text-neutral-900 truncate">{user.email}</p>
                      </div>
                      <a href="/library" className="px-4 py-3 text-sm font-medium hover:bg-neutral-50 flex items-center gap-3">
                        <Book className="w-4 h-4 text-neutral-500" /> Biblioteca (Meus Cursos)
                      </a>
                      <a href="/affiliates" className="px-4 py-3 text-sm font-medium hover:bg-neutral-50 flex items-center gap-3 border-t border-neutral-100">
                        <DollarSign className="w-4 h-4 text-neutral-500" /> Afiliados
                      </a>
                      {(profile?.role === "admin" || profile?.role === "creator") ? (
                        <a href="/admin/products" className="px-4 py-3 text-sm font-medium hover:bg-neutral-50 flex items-center gap-3 border-t border-neutral-100">
                          <Settings className="w-4 h-4 text-neutral-500" /> Painel de Criador
                        </a>
                      ) : (
                        <a href="/become-creator" className="px-4 py-3 text-sm font-medium hover:bg-neutral-50 flex items-center gap-3 border-t border-neutral-100">
                          <Mic className="w-4 h-4 text-neutral-500" /> Tornar-se Criador
                        </a>
                      )}
                      {profile?.role === "admin" && (
                        <a href="/admin" className="px-4 py-3 text-sm font-medium hover:bg-neutral-50 flex items-center gap-3 border-t border-neutral-100 text-[#FF4500]">
                          <Crown className="w-4 h-4 text-[#FF4500]" /> Admin (Plataforma)
                        </a>
                      )}
                      <form action="/auth/logout" method="post" className="border-t border-neutral-100">
                        <button type="submit" className="w-full text-left px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-3">
                          <LogOut className="w-4 h-4 text-red-500" /> Terminar Sessão
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
              <div className="relative group hidden sm:block">
                <a href="/login" className="border border-neutral-300 text-neutral-700 hover:border-neutral-400 font-bold text-sm px-5 py-2 rounded-full transition flex items-center gap-1">
                  Entrar <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
                </a>
                <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="bg-white border border-neutral-200 rounded-xl shadow-xl w-56 flex flex-col overflow-hidden text-left py-2">
                    <a href="/login?next=/library" className="px-4 py-2.5 text-sm font-medium hover:bg-neutral-50 flex items-center gap-2">
                      <Book className="w-4 h-4 text-neutral-400" /> Aceder às minhas compras
                    </a>
                    <a href="/login?next=/become-creator" className="px-4 py-2.5 text-sm font-medium hover:bg-neutral-50 border-t border-neutral-100 flex items-center gap-2">
                      <Mic className="w-4 h-4 text-neutral-400" /> Tornar-se Criador / Vendedor
                    </a>
                  </div>
                </div>
              </div>
                <a href="/signup" className="bg-[#FF4500] hover:bg-[#e03d00] text-white font-bold text-sm px-5 py-2 rounded-full transition">
                  Criar um curso
                </a>
              </>
            )}
          </div>

        </div>
      </header>
    )
  }

  const isHome = pathname === "/"

  return (
    <header className={isHome 
      ? "fixed top-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-[1400px] bg-white text-neutral-900 rounded-full shadow-2xl z-50 border border-neutral-100"
      : "bg-white text-neutral-900 border-b border-neutral-200 sticky top-0 z-50"
    }>
      <div className={`flex items-center justify-between px-4 sm:px-8 py-3.5 mx-auto ${isHome ? "w-full" : "max-w-7xl"}`}>
        
        <div className="flex items-center gap-8 xl:gap-10">
          <a href="/" className="flex items-center gap-2">
            <span className="text-3xl font-black italic tracking-tighter text-[#FF4500]">ABOVE</span>
          </a>

          <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold text-neutral-700">
            <a href="/academies" className={`transition ${pathname.startsWith("/academies") ? "text-[#FF4500]" : "hover:text-[#FF4500]"}`}>Academias</a>
            <a href="/academy" className={`transition ${pathname.startsWith("/academy") ? "text-[#FF4500]" : "hover:text-[#FF4500]"}`}>Membros ABOVE</a>
            <a href="/blog" className={`transition ${pathname.startsWith("/blog") ? "text-[#FF4500]" : "hover:text-[#FF4500]"}`}>Blog</a>
            <a href="/features" className={`transition ${pathname.startsWith("/features") ? "text-[#FF4500]" : "hover:text-[#FF4500]"}`}>O que inclui?</a>
            <a href="/marketplace" className={`transition ${pathname.startsWith("/marketplace") ? "text-[#FF4500]" : "hover:text-[#FF4500]"}`}>Marketplace</a>
            <a href="/support" className={`transition ${pathname.startsWith("/support") ? "text-[#FF4500]" : "hover:text-[#FF4500]"}`}>Ajuda</a>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsCartOpen(true)}
            className="relative text-neutral-600 hover:text-[#FF4500] transition p-2 hidden sm:block"
          >
            <ShoppingCart className="w-5 h-5" />
            {isMounted && cart.length > 0 && (
              <span className="absolute top-0 right-0 bg-[#FF4500] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                {cart.length}
              </span>
            )}
          </button>
          {user ? (
             <div className="flex items-center gap-4">
               <a href="/inbox" className="relative text-neutral-600 hover:text-neutral-900 transition">
                 <InboxIcon />
                 {unreadCount > 0 && (
                   <span className="absolute -top-1.5 -right-2 bg-red-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                     {unreadCount > 9 ? "9+" : unreadCount}
                   </span>
                 )}
               </a>
               
               <div className="relative group">
                  <button className="flex items-center gap-2 hover:opacity-80 focus:outline-none py-2">
                    <span className="w-9 h-9 rounded-full bg-[#FF4500] text-white flex items-center justify-center font-bold text-sm shadow-md">
                      {initial}
                    </span>
                  </button>
                  <div className="absolute right-0 top-full pt-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="bg-white/80 backdrop-blur-xl border border-white/40 rounded-2xl shadow-2xl w-64 flex flex-col overflow-hidden text-left ring-1 ring-black/5">
                      <div className="px-5 py-4 bg-gradient-to-br from-neutral-50/80 to-neutral-100/80 border-b border-black/5">
                        <p className="text-sm font-extrabold text-neutral-900 truncate">{user.email}</p>
                        <p className="text-xs text-neutral-500 mt-0.5">Membro ABOVE</p>
                      </div>
                      <div className="p-2 space-y-1">
                        <a href="/library" className="px-3 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100/50 hover:text-black rounded-xl transition flex items-center gap-3">
                          <Book className="w-4 h-4 text-neutral-400" /> Biblioteca (Cursos)
                        </a>
                        <a href="/affiliates" className="px-3 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100/50 hover:text-black rounded-xl transition flex items-center gap-3">
                          <DollarSign className="w-4 h-4 text-neutral-400" /> Painel de Afiliado
                        </a>
                        {(profile?.role === "admin" || profile?.role === "creator") ? (
                          <a href="/admin/products" className="px-3 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100/50 hover:text-black rounded-xl transition flex items-center gap-3">
                            <Settings className="w-4 h-4 text-neutral-400" /> Painel de Criador
                          </a>
                        ) : (
                          <a href="/become-creator" className="px-3 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100/50 hover:text-black rounded-xl transition flex items-center gap-3">
                            <Mic className="w-4 h-4 text-neutral-400" /> Tornar-se Criador
                          </a>
                        )}
                        {profile?.role === "admin" && (
                          <a href="/admin" className="px-3 py-2.5 text-sm font-medium text-[#FF4500] hover:bg-[#FF4500]/10 rounded-xl transition flex items-center gap-3">
                            <Crown className="w-4 h-4" /> Admin Global
                          </a>
                        )}
                      </div>
                      <form action="/auth/logout" method="post" className="p-2 border-t border-black/5">
                        <button type="submit" className="w-full text-left px-3 py-2.5 text-sm font-medium text-neutral-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition flex items-center gap-3">
                          <LogOut className="w-4 h-4" /> Terminar Sessão
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
             </div>
          ) : (
            <>
              <div className="relative group hidden sm:block">
                <a href="/login" className="border border-neutral-300 text-neutral-700 hover:border-neutral-400 font-bold text-sm px-5 py-2 rounded-full transition flex items-center gap-1">
                  Entrar <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
                </a>
                <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="bg-white border border-neutral-200 rounded-xl shadow-xl w-56 flex flex-col overflow-hidden text-left py-2">
                    <a href="/login?next=/library" className="px-4 py-2.5 text-sm font-medium hover:bg-neutral-50 flex items-center gap-2">
                      <Book className="w-4 h-4 text-neutral-400" /> Aceder às minhas compras
                    </a>
                    <a href="/login?next=/become-creator" className="px-4 py-2.5 text-sm font-medium hover:bg-neutral-50 border-t border-neutral-100 flex items-center gap-2">
                      <Mic className="w-4 h-4 text-neutral-400" /> Tornar-se Criador / Vendedor
                    </a>
                  </div>
                </div>
              </div>
              <a href="/signup" className="bg-[#FF4500] hover:bg-[#e03d00] text-white font-bold text-sm px-5 py-2 rounded-full transition shadow-sm">
                Aderir grátis
              </a>
            </>
          )}
        </div>

      </div>
    </header>
  )
}

function InboxIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-3.5-3.5" />
    </svg>
  )
}
