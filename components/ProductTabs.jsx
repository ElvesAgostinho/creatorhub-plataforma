"use client"
import { useState, useEffect } from "react"
import { BookOpen } from "lucide-react"

export default function ProductTabs({ advantagesList, lessons, description }) {
  const [activeTab, setActiveTab] = useState("")

  useEffect(() => {
    if (advantagesList?.length > 0) setActiveTab("advantages")
    else if (description) setActiveTab("details")
    else if (lessons?.length > 0) setActiveTab("content")
  }, [advantagesList, description, lessons])

  if (!activeTab) return null

  return (
    <div className="w-full">
      <div className="border-b border-neutral-200 flex gap-8 mb-8 overflow-x-auto no-scrollbar">
        {advantagesList && advantagesList.length > 0 && (
          <button 
            onClick={() => setActiveTab("advantages")}
            className={`pb-4 border-b-2 font-bold whitespace-nowrap text-[15px] transition-colors ${activeTab === "advantages" ? "border-[#00A859] text-[#00A859]" : "border-transparent text-neutral-500 hover:text-neutral-900"}`}
          >
            Vantagens
          </button>
        )}
        {description && (
          <button 
            onClick={() => setActiveTab("details")}
            className={`pb-4 border-b-2 font-bold whitespace-nowrap text-[15px] transition-colors ${activeTab === "details" ? "border-[#00A859] text-[#00A859]" : "border-transparent text-neutral-500 hover:text-neutral-900"}`}
          >
            Detalhes
          </button>
        )}
        {lessons && lessons.length > 0 && (
          <button 
            onClick={() => setActiveTab("content")}
            className={`pb-4 border-b-2 font-bold whitespace-nowrap text-[15px] transition-colors ${activeTab === "content" ? "border-[#00A859] text-[#00A859]" : "border-transparent text-neutral-500 hover:text-neutral-900"}`}
          >
            Conteúdo
          </button>
        )}
      </div>

      <div className="py-2">
        {activeTab === "advantages" && advantagesList && advantagesList.length > 0 && (
          <ul className="space-y-4">
            {advantagesList.map((adv, i) => (
              <li key={i} className="flex gap-3 text-neutral-700 text-[15px]">
                <span className="text-[#00A859] font-black shrink-0">✓</span>
                <span>{adv}</span>
              </li>
            ))}
          </ul>
        )}

        {activeTab === "details" && description && (
          <p className="text-neutral-600 leading-relaxed text-[15px] whitespace-pre-wrap">
            {description}
          </p>
        )}

        {activeTab === "content" && lessons && lessons.length > 0 && (
          <div className="border border-neutral-200 rounded-2xl overflow-hidden divide-y divide-neutral-200">
            {lessons.map((lesson, idx) => (
              <div key={lesson.id} className="p-4 flex items-start gap-4 hover:bg-neutral-50 transition-colors">
                <div className="mt-1 text-neutral-400"><BookOpen className="w-5 h-5" /></div>
                <div>
                  <h4 className="font-bold text-neutral-900 text-[15px]">Módulo {idx + 1}: {lesson.title}</h4>
                  {lesson.description && <p className="text-sm text-neutral-500 mt-1">{lesson.description}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
