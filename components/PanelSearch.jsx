"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Search } from "lucide-react"

export default function PanelSearch({ placeholder = "Pesquisar..." }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const currentSearch = searchParams.get("q") || ""

  const handleSearch = (value) => {
    const params = new URLSearchParams(searchParams)
    if (value) {
      params.set("q", value)
    } else {
      params.delete("q")
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="relative w-full max-w-md">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-neutral-400" />
      </div>
      <input
        type="text"
        placeholder={placeholder}
        defaultValue={currentSearch}
        onChange={(e) => handleSearch(e.target.value)}
        className="block w-full pl-10 pr-3 py-2.5 border border-neutral-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#FF4500]/50 focus:border-[#FF4500] transition shadow-sm"
      />
    </div>
  )
}
