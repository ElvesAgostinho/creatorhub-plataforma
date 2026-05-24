"use client"
import { usePathname } from "next/navigation"

export default function AdminNav() {
  const pathname = usePathname()
  
  const links = [
    { href: "/admin/products", label: "Produtos" },
    { href: "/admin", label: "Compras" },
    { href: "/admin/analytics", label: "Análises" },
    { href: "/admin/integrations", label: "Integrações" },
    { href: "/admin/creators", label: "Candidaturas" },
    { href: "/admin/broadcasts", label: "Avisos" },
    { href: "/admin/academy", label: "Academia" },
    { href: "/admin/resources", label: "Blog & Recursos" },
    { href: "/admin/settings", label: "Definições" }
  ]

  return (
    <nav className="flex gap-2 text-sm flex-wrap">
      {links.map(link => {
        const isActive = pathname === link.href
        return (
          <a 
            key={link.href} 
            href={link.href} 
            className={`px-3 py-1.5 rounded-md border transition-colors
              ${isActive ? "bg-neutral-800 text-white border-neutral-800" : "bg-white border-neutral-300 text-black hover:bg-neutral-50"}
            `}
          >
            {link.label}
          </a>
        )
      })}
    </nav>
  )
}
