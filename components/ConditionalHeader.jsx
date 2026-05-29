"use client"

import { usePathname } from "next/navigation"

export default function ConditionalHeader({ children }) {
  const pathname = usePathname()

  // Rotas onde o cabeçalho principal NÃO deve aparecer
  const hiddenRoutes = [
    "/admin",
    "/library",
    "/dashboard",
    "/affiliate-panel",
    "/ebook",
    "/audiobook",
    "/learn",
    "/club"
  ]

  const shouldHide = hiddenRoutes.some(route => pathname?.startsWith(route))

  if (shouldHide) return null

  return <>{children}</>
}
