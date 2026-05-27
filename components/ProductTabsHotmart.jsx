"use client"

import { useState } from "react"
import { CheckCircle2, ChevronDown, ChevronUp, Play, FileText } from "lucide-react"

export default function ProductTabsHotmart({ moduleList, advantagesList, lessons, totalStudents, level, type, category }) {
  const [activeTab, setActiveTab] = useState("conteudo")
  const [expandedModules, setExpandedModules] = useState({})

  const toggleModule = (idx) => {
    setExpandedModules(prev => ({ ...prev, [idx]: !prev[idx] }))
  }

  const tabs = [
    { id: "conteudo", label: "Conteúdo" },
    { id: "vantagens", label: "Vantagens" },
    { id: "detalhes", label: "Detalhes" },
  ]

  return (
    <div>
      {/* Tab bar */}
      <div className="flex border-b border-neutral-200 mb-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-3 text-sm font-semibold border-b-2 -mb-px transition-colors ${
              activeTab === tab.id
                ? "border-[#FF4500] text-[#FF4500]"
                : "border-transparent text-neutral-500 hover:text-neutral-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* CONTEÚDO */}
      {activeTab === "conteudo" && (
        <div>
          {moduleList.length === 0 ? (
            <p className="text-sm text-neutral-500 italic">Conteúdo ainda não disponível.</p>
          ) : (
            <div className="space-y-2">
              {moduleList.map((mod, idx) => (
                <div key={idx} className="border border-neutral-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => toggleModule(idx)}
                    className="w-full flex items-center justify-between px-5 py-4 bg-neutral-50 hover:bg-neutral-100 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-lg bg-white border border-neutral-200 flex items-center justify-center text-xs text-neutral-500 font-bold shrink-0">{idx + 1}</span>
                      <span className="text-sm font-bold text-neutral-800">{mod.title}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-neutral-500 shrink-0 ml-4">
                      <span>{mod.lessons.length} {mod.lessons.length === 1 ? "aula" : "aulas"}</span>
                      {expandedModules[idx] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>

                  {expandedModules[idx] && (
                    <div className="divide-y divide-neutral-100">
                      {mod.lessons.map((lesson, lIdx) => (
                        <div key={lIdx} className="flex items-center gap-3 px-5 py-3">
                          {lesson.video_url ? (
                            <Play className="w-4 h-4 text-neutral-400 shrink-0" />
                          ) : (
                            <FileText className="w-4 h-4 text-neutral-400 shrink-0" />
                          )}
                          <span className="text-sm text-neutral-700 flex-1">{lesson.title}</span>
                          {lesson.is_preview && (
                            <span className="text-[10px] bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full uppercase">Grátis</span>
                          )}
                          {lesson.duration_seconds > 0 && (
                            <span className="text-xs text-neutral-400 shrink-0">
                              {Math.floor(lesson.duration_seconds / 60)}min
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VANTAGENS */}
      {activeTab === "vantagens" && (
        <div>
          {advantagesList.length === 0 ? (
            <p className="text-sm text-neutral-500 italic">Sem vantagens listadas.</p>
          ) : (
            <ul className="space-y-3">
              {advantagesList.map((adv, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-neutral-700">
                  <CheckCircle2 className="w-5 h-5 text-[#00A859] shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{adv}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* DETALHES */}
      {activeTab === "detalhes" && (
        <div className="space-y-3 text-sm">
          {[
            { label: "Tipo", value: type === "course" ? "Curso Online" : type === "book" ? "Livro Digital" : type === "mentorship" ? "Mentoria" : type },
            { label: "Categoria", value: category || "—" },
            { label: "Nível", value: level || "Todos os níveis" },
            { label: "Acesso", value: "Vitalício após compra" },
            { label: "Dispositivos", value: "PC, Tablet e Telemóvel" },
            { label: "Idioma", value: "Português" },
            { label: "Certificado", value: type === "course" ? "Incluído" : "—" },
            { label: "Aulas", value: lessons.length > 0 ? `${lessons.length} aulas` : "—" },
          ].map(({ label, value }) => value && value !== "—" ? (
            <div key={label} className="flex gap-4 py-2.5 border-b border-neutral-100 last:border-none">
              <span className="text-neutral-500 font-medium w-28 shrink-0">{label}</span>
              <span className="text-neutral-800 font-semibold">{value}</span>
            </div>
          ) : null)}
        </div>
      )}
    </div>
  )
}
