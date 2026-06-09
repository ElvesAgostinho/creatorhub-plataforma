"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, PlaySquare, Award, User, LayoutDashboard, Package, DollarSign, Users } from "lucide-react"

export default function MobileBottomNav({ role = "student" }) {
  const pathname = usePathname()

  const studentLinks = [
    { name: "Início", href: "/", icon: Home },
    { name: "Biblioteca", href: "/library", icon: PlaySquare },
    { name: "Certificados", href: "/library/certificates", icon: Award },
    { name: "Perfil", href: "/library/profile", icon: User },
  ]

  const creatorLinks = [
    { name: "Painel", href: "/dashboard", icon: LayoutDashboard },
    { name: "Produtos", href: "/product", icon: Package },
    { name: "Vendas", href: "/admin/finance", icon: DollarSign },
    { name: "Comunidade", href: "/inbox", icon: Users },
  ]

  const links = role === "creator" ? creatorLinks : studentLinks

  return (
    <>
      {/* Spacer para não esconder conteúdo debaixo da barra */}
      <div className="h-16 md:hidden w-full shrink-0"></div>
      
      {/* Barra de Navegação Inferior */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 flex items-center justify-around px-2 h-16 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        {links.map((link) => {
          const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))
          const Icon = link.icon
          return (
            <Link 
              key={link.name} 
              href={link.href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive ? 'text-[#FF4500]' : 'text-neutral-400 hover:text-neutral-600'}`}
            >
              <Icon size={22} className={isActive ? 'fill-[#FF4500]/10' : ''} />
              <span className="text-[10px] font-bold">{link.name}</span>
            </Link>
          )
        })}
      </div>
    </>
  )
}
