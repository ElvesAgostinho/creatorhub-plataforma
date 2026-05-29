"use client"

import { useState } from "react"
import Link from "next/link"
import { Search } from "lucide-react"

export default function LibraryClientView({ items, progressMap }) {
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  const tabs = [
    { id: "all", label: "Todos" },
    { id: "course", label: "Cursos" },
    { id: "book", label: "E-books" },
    { id: "mentorship", label: "Mentorias" },
  ]

  // Filter items based on active tab and search query
  const filteredItems = (items || []).filter(it => {
    if (!it || !it.product) return false;
    const matchesTab = activeTab === "all" || it.product.type === activeTab
    const matchesSearch = (it.product.title || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (it.product.instructor || "").toLowerCase().includes(searchQuery.toLowerCase())
    return matchesTab && matchesSearch
  })

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto w-full">
      {/* HEADER SECTION */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-neutral-900 tracking-tight mb-6">Minhas Compras</h1>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* TABS */}
          <div className="flex items-center overflow-x-auto custom-scrollbar border-b border-neutral-200">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap px-4 py-3 text-sm font-bold border-b-2 transition-colors ${
                  activeTab === tab.id 
                    ? "border-[#FF4500] text-[#FF4500]" 
                    : "border-transparent text-neutral-500 hover:text-neutral-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* SEARCH BAR */}
          <div className="relative w-full md:w-72 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Pesquisar nas tuas compras..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-neutral-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#FF4500] focus:ring-1 focus:ring-[#FF4500] transition-shadow shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* GRID */}
      {filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white border border-neutral-200 rounded-2xl shadow-sm">
          <p className="text-neutral-500 text-lg font-medium mb-4">Nenhum produto encontrado.</p>
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery("")}
              className="text-[#FF4500] font-bold hover:underline"
            >
              Limpar pesquisa
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map(it => {
            const hrefByType = {
              course: `/learn/${it.product.slug}`,
              book: `/ebook/${it.product.slug}`,
              mentorship: `/book/${it.product.slug}`
            }
            const href = hrefByType[it.product.type] || `/product/${it.product.slug}`
            const target = undefined
            
            const progress = (progressMap || {})[it.product.id] || 0
            const isCourse = it.product.type === "course"

            return (
              <a
                key={it.purchaseId}
                href={href}
                target={target}
                className="group flex flex-col bg-white border border-neutral-200 rounded-2xl overflow-hidden hover:shadow-md hover:border-[#FF4500]/40 transition-all duration-300"
              >
                {/* THUMBNAIL */}
                <div className="relative aspect-video overflow-hidden bg-neutral-100">
                  <img 
                    src={it.product.image} 
                    alt={it.product.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  
                  {/* PROGRESS BAR OVERLAY (ONLY FOR COURSES) */}
                  {isCourse && (
                    <div className="absolute bottom-0 left-0 w-full h-1.5 bg-black/20">
                      <div 
                        className="h-full bg-[#00C853] transition-all duration-1000"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  )}
                </div>

                {/* DETAILS */}
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-bold text-neutral-900 text-[15px] leading-tight line-clamp-2 mb-1 group-hover:text-[#FF4500] transition-colors">
                    {it.product.title}
                  </h3>
                  <p className="text-xs font-medium text-neutral-500 mb-4 line-clamp-1">
                    {it.product.instructor}
                  </p>

                  <div className="mt-auto">
                    {isCourse && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-neutral-400">Progresso</span>
                        <span className="text-xs font-bold text-[#00C853]">{progress}%</span>
                      </div>
                    )}
                    {!isCourse && (
                      <div className="flex justify-end">
                        <span className="text-[10px] font-bold text-neutral-400 uppercase bg-neutral-100 px-2 py-0.5 rounded">
                          {it.product.type === "book" ? "E-book" : "Mentoria"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </a>
            )
          })}
        </div>
      )}
    </div>
  )
}
