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
  Settings,
  Award,
  Plus,
  CreditCard,
  HardDrive,
  UserCircle
} from "lucide-react"

export default function AdminSidebar({ role = "creator" }) {
  const pathname = usePathname()

  const creatorLinks = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/products", label: "Meus Produtos", icon: Package },
    { href: "/admin/analytics", label: "Relatórios", icon: LineChart },
    { href: "/admin/finances", label: "Finanças e Saldo", icon: CreditCard },
    { href: "/admin/campaigns", label: "Campanhas", icon: Megaphone },
    { href: "/admin/certificates", label: "Certificados", icon: Award },
    { href: "/admin/integrations", label: "Integrações", icon: Plug },
    { href: "/admin/profile", label: "Minha Conta", icon: UserCircle },
  ]

  const adminLinks = [
    { href: "/admin/creators", label: "Candidaturas", icon: Users },
    { href: "/admin/storage", label: "Alojamento Mestre", icon: HardDrive },
    { href: "/admin/settings", label: "Definições Mestre", icon: Settings },
  ]

  const renderLinks = (links) => (
    links.map((link) => {
      const isActive = link.href === "/admin" 
        ? pathname === "/admin" 
        : pathname.startsWith(link.href)
      
      const Icon = link.icon

      return (
        <Link 
          key={link.href}
          href={link.href}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors text-[14px] ${
            isActive 
              ? "bg-[#FFF0EB] text-[#FF4500]" 
              : "text-neutral-600 hover:bg-neutral-100 hover:text-[#111827]"
          }`}
        >
          <Icon size={18} className={isActive ? "text-[#FF4500]" : "text-neutral-400"} />
          {link.label}
        </Link>
      )
    })
  )

  return (
    <aside className="w-[260px] bg-white border-r border-neutral-200 hidden md:flex flex-col min-h-screen sticky top-0 h-screen font-sans">
      <div className="p-6 pb-2">
        <a href="/admin" className="flex items-center gap-2">
          <span className="text-2xl font-black tracking-tight text-[#FF4500]">ABOVE</span>
          <span className="text-xs font-bold bg-[#FFF0EB] text-[#FF4500] px-2 py-0.5 rounded-md tracking-wider">CREATOR</span>
        </a>
      </div>
      
      <div className="px-5 pt-6 pb-4">
        <Link 
          href="/admin/products/new" 
          className="flex items-center justify-center gap-2 w-full bg-[#FF4500] hover:bg-[#E03E00] text-white font-bold py-3 rounded-xl transition shadow-sm"
        >
          <Plus size={18} />
          <span>Criar Produto</span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-4 custom-scrollbar">
        
        {/* Secção do Criador */}
        <div className="flex flex-col gap-1 mb-6">
          <div className="px-3 pb-2 text-xs font-black text-neutral-400 uppercase tracking-wider">O Teu Negócio</div>
          {renderLinks(creatorLinks)}
        </div>

        {/* Secção do Superadmin */}
        {role === "admin" && (
          <div className="flex flex-col gap-1 border-t border-neutral-100 pt-6">
            <div className="px-3 pb-2 text-xs font-black text-neutral-400 uppercase tracking-wider">Gestão da Plataforma</div>
            {renderLinks(adminLinks)}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-neutral-100 shrink-0">
        <Link 
          href="/" 
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold text-[14px] text-neutral-500 hover:text-[#111827] hover:bg-neutral-100 transition"
        >
          <span className="text-lg">🌍</span>
          Ver Site Público
        </Link>
      </div>
    </aside>
  )
}
