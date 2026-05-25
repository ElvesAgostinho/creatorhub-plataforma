"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  Package, 
  LineChart, 
  Plug, 
  Users, 
  Megaphone, 
  GraduationCap, 
  BookOpen, 
  PlaySquare, 
  ArrowLeftRight,
  Settings,
  Award,
  ShieldCheck,
  Plus
} from "lucide-react"

export default function AdminSidebar() {
  const pathname = usePathname()

  const links = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/products", label: "Produtos", icon: Package },
    { href: "/admin/analytics", label: "Análises", icon: LineChart },
    { href: "/admin/integrations", label: "Integrações", icon: Plug },
    { href: "/admin/creators", label: "Candidaturas", icon: Users },
    { href: "/admin/broadcasts", label: "Avisos", icon: Megaphone },
    { href: "/admin/academy", label: "Academia", icon: GraduationCap },
    { href: "/admin/certificates", label: "Certificados", icon: Award },
    { href: "/admin/resources", label: "Blog & Recursos", icon: BookOpen },
    { href: "/admin/guide", label: "Guia de Aulas (Vídeo)", icon: PlaySquare },
    { href: "/admin/settings", label: "Definições", icon: Settings },
  ]

  return (
    <aside className="w-64 bg-white border-r border-neutral-200 hidden md:flex flex-col min-h-screen sticky top-0 h-screen">
      <div className="p-6">
        <a href="/admin" className="flex items-center gap-2">
          <span className="text-2xl font-black italic tracking-tighter text-[#FF4500]">ABOVE</span>
        </a>
      </div>
      
      <div className="px-4 pb-4">
        <Link 
          href="/admin/products/new" 
          className="flex items-center justify-center gap-2 w-full bg-[#FF4500] hover:bg-[#E03E00] text-white font-bold py-2.5 rounded-xl transition shadow-sm shadow-[#FF4500]/20"
        >
          <Plus size={18} />
          <span>Criar Produto</span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-2 px-3 flex flex-col gap-1">
        {links.map((link) => {
          const isActive = link.href === "/admin" 
            ? pathname === "/admin" 
            : pathname.startsWith(link.href)
          
          const Icon = link.icon

          return (
            <Link 
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors text-sm ${
                isActive 
                  ? "bg-[#FFF0EB] text-[#FF4500]" 
                  : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
              }`}
            >
              <Icon size={20} className={isActive ? "text-[#FF4500]" : "text-neutral-400"} />
              {link.label}
            </Link>
          )
        })}
      </div>

      <div className="p-4 border-t border-neutral-100 shrink-0">
        <Link 
          href="/" 
          className="flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-sm text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50 transition"
        >
          <span className="text-lg">🌍</span>
          Ver Site Público
        </Link>
      </div>
    </aside>
  )
}
