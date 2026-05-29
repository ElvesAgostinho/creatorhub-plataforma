"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Package, Award, MessageSquare, UserCircle, Menu, X, LogOut, ChevronRight } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function LibrarySidebar({ userProfile, children }) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const supabase = createClient()

  const links = [
    { href: "/library", label: "Minhas Compras", icon: Package },
    { href: "/library/certificates", label: "Certificados", icon: Award },
    { href: "/library/communities", label: "Comunidades", icon: MessageSquare },
    { href: "/library/profile", label: "Perfil", icon: UserCircle },
  ]

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = "/login"
  }

  return (
    <div className="min-h-screen bg-[#F4F5F7] flex flex-col md:flex-row font-sans">
      
      {/* MOBILE HEADER */}
      <div className="md:hidden h-14 bg-white border-b border-neutral-200 flex items-center justify-between px-4 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <button onClick={() => setIsOpen(true)} className="p-2 -ml-2 text-neutral-600">
            <Menu size={24} />
          </button>
          <span className="font-black text-[#FF4500] text-xl tracking-tighter">ABOVE</span>
        </div>
        <div className="w-8 h-8 rounded-full bg-neutral-200 overflow-hidden flex items-center justify-center text-xs font-bold text-neutral-500">
          {userProfile?.full_name?.charAt(0) || "U"}
        </div>
      </div>

      {/* OVERLAY */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside className={`fixed md:sticky top-0 z-50 md:z-10 w-72 h-[100dvh] bg-white border-r border-neutral-200 flex flex-col shrink-0 transition-transform duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        
        {/* LOGO */}
        <div className="h-20 border-b border-neutral-100 flex items-center justify-between px-6 shrink-0">
          <Link href="/library" className="flex items-center gap-2">
            <span className="font-black text-[#FF4500] text-2xl tracking-tighter">ABOVE</span>
          </Link>
          <button className="md:hidden text-neutral-500" onClick={() => setIsOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {/* USER PROFILE SNIPPET */}
        <div className="p-6 border-b border-neutral-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#FFF0EB] border border-[#FF4500]/20 flex items-center justify-center text-lg font-bold text-[#FF4500] shrink-0">
              {userProfile?.full_name?.charAt(0) || "U"}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-neutral-900 truncate">{userProfile?.full_name || "Utilizador"}</p>
              <p className="text-xs text-neutral-500 truncate">{userProfile?.email}</p>
            </div>
          </div>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          {links.map(link => {
            const isActive = link.href === "/library"
              ? pathname === "/library"
              : pathname === link.href || pathname.startsWith(link.href + "/")
            const Icon = link.icon
            
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${
                  isActive 
                    ? "bg-[#FFF0EB] text-[#FF4500]" 
                    : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                }`}
              >
                <Icon size={18} className={isActive ? "text-[#FF4500]" : "text-neutral-400"} />
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* FOOTER */}
        <div className="p-4 border-t border-neutral-100">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-neutral-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut size={18} className="text-neutral-400" />
            Terminar Sessão
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 w-full min-h-screen relative overflow-x-hidden">
        {children}
      </main>

    </div>
  )
}
