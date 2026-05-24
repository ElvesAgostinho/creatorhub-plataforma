"use client"

import { useEffect, useRef, useState } from "react"
import { saveProgress } from "@/app/learn/[slug]/actions"
import dynamic from "next/dynamic"
import AIAssistant from "./AIAssistant"

const ReactPlayer = dynamic(() => import("react-player"), { ssr: false })

function fmtTime(secs) {
  const s = Math.floor(secs || 0)
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${m}:${String(r).padStart(2, "0")}`
}

export default function LessonPlayer({ lessons, initialProgress = {}, productId, creatorId, courseTitle }) {
  const playable = lessons || []
  const [currentIdx, setCurrentIdx] = useState(0)
  const current = playable[currentIdx]
  const videoRef = useRef(null)
  const [progressMap, setProgressMap] = useState(initialProgress)
  const lastSavedRef = useRef(0)
  
  const [activeTab, setActiveTab] = useState('overview') // 'overview', 'transcript', 'resources', 'qa'
  const [expandedModules, setExpandedModules] = useState({})

  useEffect(() => {
    lastSavedRef.current = 0
    const v = videoRef.current
    if (!v || !current) return
    const saved = progressMap[current.id]?.watched_seconds || 0
    if (saved > 5 && saved < (current.duration_seconds || 0) - 5) {
      try { 
        if (typeof v.seekTo === 'function') v.seekTo(saved, "seconds")
        else v.currentTime = saved 
      } catch {}
    }
  }, [currentIdx, current?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (current) {
      setExpandedModules(prev => ({ ...prev, [current.module_id]: true }))
    }
  }, [current])

  async function persist(seconds, completed = false) {
    if (!current) return
    const res = await saveProgress({
      lessonId: current.id,
      watchedSeconds: seconds,
      completed
    })
    if (res?.ok) {
      setProgressMap(m => ({
        ...m,
        [current.id]: { ...(m[current.id] || {}), watched_seconds: seconds, completed }
      }))
    }
  }

  function onTimeUpdate(e) {
    let t = 0
    if (e && typeof e.playedSeconds === 'number') {
      t = Math.floor(e.playedSeconds)
    } else if (e && e.target && typeof e.target.currentTime === 'number') {
      t = Math.floor(e.target.currentTime)
    }
    
    if (t - lastSavedRef.current >= 5) {
      lastSavedRef.current = t
      persist(t, false)
    }
  }

  function onEnded() {
    persist(current?.duration_seconds || 0, true)
  }

  function handleCompleteAndNext() {
    persist(current?.duration_seconds || 0, true)
    if (currentIdx < playable.length - 1) {
      setCurrentIdx(i => i + 1)
    }
  }

  if (!current) {
    return <div className="p-8 text-neutral-500">Este curso ainda não tem aulas.</div>
  }

  const completion = lessons.reduce((acc, l) => acc + (progressMap[l.id]?.completed ? 1 : 0), 0)
  const pct = Math.round((completion / playable.length) * 100) || 0

  // Group modules
  const modules = Array.from(
    playable.reduce((map, l) => {
      if (!map.has(l.module_id)) {
        map.set(l.module_id, {
          id: l.module_id,
          title: l.module_title,
          position: l.module_position,
          lessons: []
        })
      }
      map.get(l.module_id).lessons.push(l)
      return map
    }, new Map()).values()
  ).sort((a, b) => a.position - b.position)

  return (
    <div className="flex flex-col lg:flex-row h-full min-h-[800px] w-full text-white bg-[#0A0A0A]">
      {/* SIDEBAR */}
      <aside className="w-full lg:w-[360px] bg-[#111111] border-r border-neutral-800 flex flex-col shrink-0">
        
        {/* Header da Sidebar */}
        <div className="p-6 border-b border-neutral-800 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold leading-tight">{courseTitle || "Curso"}</h2>
            <div className="text-sm text-neutral-500 mt-1">{pct}% Concluído</div>
          </div>
          
          {/* Donut Chart Progress */}
          <div className="relative w-14 h-14 shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-neutral-800"
                strokeWidth="3"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-[#FF4500] transition-all duration-500"
                strokeWidth="3"
                strokeDasharray={`${pct}, 100`}
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">
              {pct}%
            </div>
          </div>
        </div>

        {/* Lista de Módulos */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {modules.map(m => {
            const isExpanded = expandedModules[m.id]
            const moduleDoneCount = m.lessons.reduce((acc, l) => acc + (progressMap[l.id]?.completed ? 1 : 0), 0)
            
            return (
              <div key={m.id} className="bg-[#1A1A1A] rounded-2xl overflow-hidden border border-neutral-800">
                <button 
                  onClick={() => setExpandedModules(prev => ({...prev, [m.id]: !isExpanded}))}
                  className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-neutral-800/50 transition"
                >
                  <div>
                    <div className="font-semibold text-sm">Módulo {m.position}:<br/>{m.title}</div>
                    <div className="text-xs text-neutral-500 mt-1">{moduleDoneCount}/{m.lessons.length} Aulas</div>
                  </div>
                  <svg className={`w-4 h-4 text-neutral-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {isExpanded && (
                  <ul className="pb-2">
                    {m.lessons.map(l => {
                      const idx = playable.findIndex(x => x.id === l.id)
                      const p = progressMap[l.id]
                      const done = !!p?.completed
                      const isCurrent = idx === currentIdx
                      
                      return (
                        <li key={l.id}>
                          <button
                            onClick={() => setCurrentIdx(idx)}
                            className={`w-full text-left px-5 py-3 flex gap-3 items-center transition
                              ${isCurrent ? "bg-[#222] border-l-2 border-[#FF4500]" : "hover:bg-neutral-800/30 border-l-2 border-transparent"}
                            `}
                          >
                            <div className={`w-5 h-5 rounded-full shrink-0 flex items-center justify-center border text-[10px]
                              ${done ? "bg-[#FF4500] border-[#FF4500] text-white" : "border-neutral-600 text-transparent"}
                            `}>
                              ✓
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className={`text-sm ${isCurrent ? "text-white font-medium" : "text-neutral-400"}`}>
                                {l.position}. {l.title}
                              </div>
                            </div>
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>
            )
          })}
        </div>
      </aside>

      {/* ÁREA PRINCIPAL DO VÍDEO */}
      <div className="flex-1 flex flex-col overflow-y-auto bg-[#0A0A0A]">
        
        {/* Cabeçalho do Vídeo */}
        <div className="px-8 pt-8 pb-4">
           <div className="text-sm text-neutral-500 mb-2 font-medium">
             Módulos &gt; Módulo {current.module_position} &gt; Aula {current.position}
           </div>
           <div className="flex items-start justify-between gap-4 flex-wrap">
             <h1 className="text-3xl font-extrabold flex-1 leading-tight">{current.position}. {current.title}</h1>
             <button 
               onClick={handleCompleteAndNext}
               className="bg-[#FF4500] hover:bg-[#E03E00] text-white font-bold px-6 py-2.5 rounded-xl text-sm transition flex items-center gap-2 shrink-0 shadow-lg shadow-[#FF4500]/20"
             >
               Completar & Seguinte <span className="text-lg leading-none">›</span>
             </button>
           </div>
        </div>
        
        {/* Vídeo */}
        <div className="px-8 py-4">
           <div className="aspect-video bg-black rounded-3xl relative shadow-[0_0_50px_rgba(255,69,0,0.1)] border border-neutral-800/50 overflow-hidden ring-1 ring-white/5">
             <ReactPlayer
               ref={videoRef}
               url={current.video_url}
               controls
               width="100%"
               height="100%"
               playsinline
               onProgress={onTimeUpdate}
               onEnded={onEnded}
               style={{ backgroundColor: 'black' }}
               config={{
                 file: {
                   attributes: {
                     preload: "metadata"
                   }
                 }
               }}
             />
             
             {/* Glow effect at the bottom simulating the reference image */}
             <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-3/4 h-20 bg-[#FF4500]/20 blur-3xl pointer-events-none rounded-full"></div>
           </div>
        </div>
        
        {/* Tabs e Conteúdo */}
        <div className="px-8 pb-12 mt-4 flex-1">
           <div className="flex gap-8 border-b border-neutral-800">
             {['overview', 'transcript', 'resources', 'qa'].map(tab => (
               <button 
                 key={tab}
                 onClick={() => setActiveTab(tab)}
                 className={`pb-3 text-sm font-bold capitalize transition-colors border-b-2 
                  ${activeTab === tab ? "border-[#FF4500] text-white" : "border-transparent text-neutral-500 hover:text-neutral-300"}
                 `}
               >
                 {tab === 'qa' ? 'Q&A' : tab}
               </button>
             ))}
           </div>
           
           <div className="pt-6">
             {activeTab === 'overview' && (
               <div className="max-w-3xl">
                 <h3 className="text-xl font-bold mb-4">Visão Geral</h3>
                 {current.description ? (
                   <p className="text-neutral-400 leading-relaxed">{current.description}</p>
                 ) : (
                   <p className="text-neutral-600">Nenhuma descrição disponível para esta aula.</p>
                 )}
               </div>
             )}

             {activeTab === 'transcript' && (
               <div className="max-w-3xl text-neutral-400">
                 A transcrição automática não está disponível neste momento.
               </div>
             )}

             {activeTab === 'resources' && (
               <div className="max-w-3xl text-neutral-400">
                 {current.pdf_url ? (
                   <a 
                     href={current.pdf_url.startsWith('http') ? current.pdf_url : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${current.pdf_url.replace('storage:', '')}`} 
                     target="_blank" 
                     rel="noopener noreferrer" 
                     className="inline-flex items-center gap-3 bg-[#1A1A1A] border border-neutral-800 hover:border-[#FF4500] hover:text-[#FF4500] transition-colors p-4 rounded-xl text-white font-bold"
                   >
                     <span className="text-2xl">📄</span>
                     Descarregar Material de Apoio (PDF)
                   </a>
                 ) : (
                   "Nenhum ficheiro ou recurso anexado a esta aula."
                 )}
               </div>
             )}

             {activeTab === 'qa' && (
               <div className="max-w-2xl bg-[#111] border border-neutral-800 p-6 rounded-2xl">
                 <h3 className="font-bold text-lg mb-2">Dúvidas sobre a aula?</h3>
                 <p className="text-sm text-neutral-500 mb-6">A tua mensagem será enviada diretamente para a caixa de entrada do professor e respondida o mais breve possível.</p>
                 <form 
                   onSubmit={async (e) => {
                     e.preventDefault()
                     if (!e.target.content.value.trim()) return
                     const btn = e.target.querySelector('button')
                     btn.disabled = true
                     btn.textContent = "A enviar..."
                     try {
                       const fd = new FormData()
                       fd.append("recipient_id", creatorId)
                       fd.append("subject", `Dúvida: ${current.title}`)
                       fd.append("content", e.target.content.value)
                       fd.append("lesson_id", current.id)
                       fd.append("product_id", productId)
                       
                       const { sendMessage } = await import("@/app/inbox/actions")
                       await sendMessage(fd)
                       
                       e.target.reset()
                       alert("Mensagem enviada com sucesso! Vê as respostas na tua Caixa de Mensagens.")
                     } catch (err) {
                       alert("Erro ao enviar mensagem.")
                     } finally {
                       btn.disabled = false
                       btn.textContent = "Enviar Dúvida"
                     }
                   }}
                   className="flex flex-col gap-4"
                 >
                   <textarea 
                     name="content"
                     required 
                     rows={4} 
                     className="w-full bg-[#1A1A1A] border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#FF4500] placeholder-neutral-600 resize-none"
                     placeholder="Escreve aqui a tua dúvida de forma clara..."
                   />
                   <div className="flex justify-end">
                     <button type="submit" className="bg-white hover:bg-neutral-200 text-black font-bold px-6 py-2.5 rounded-lg transition text-sm">
                       Enviar Mensagem
                     </button>
                   </div>
                 </form>
               </div>
             )}
           </div>
        </div>

      </div>

      {/* Assistente IA (Sacapuri) */}
      <AIAssistant courseTitle={courseTitle} lessonTitle={current.title} />
    </div>
  )
}
