"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Search, Filter } from "lucide-react"

export default function AffiliateFilter() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const currentStatus = searchParams.get("status") || "all"
  const currentSearch = searchParams.get("q") || ""

  const updateFilters = (key, value) => {
    const params = new URLSearchParams(searchParams)
    if (value && value !== "all") {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
      <div className="relative flex-1 w-full">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-neutral-400" />
        </div>
        <input
          type="text"
          placeholder="Pesquisar por nome..."
          defaultValue={currentSearch}
          onChange={(e) => updateFilters("q", e.target.value)}
          className="block w-full pl-10 pr-3 py-2.5 border border-neutral-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#FF4500]/50 focus:border-[#FF4500] transition shadow-sm"
        />
      </div>

      <div className="relative w-full sm:w-48 shrink-0">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Filter className="h-5 w-5 text-neutral-400" />
        </div>
        <select
          defaultValue={currentStatus}
          onChange={(e) => updateFilters("status", e.target.value)}
          className="block w-full pl-10 pr-3 py-2.5 border border-neutral-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#FF4500]/50 focus:border-[#FF4500] transition shadow-sm appearance-none cursor-pointer"
        >
          <option value="all">Todos os Status</option>
          <option value="pending">Pendentes</option>
          <option value="approved">Aprovados</option>
          <option value="rejected">Rejeitados</option>
        </select>
      </div>
    </div>
  )
}
