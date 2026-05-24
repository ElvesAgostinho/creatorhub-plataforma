"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import dynamic from "next/dynamic"

// Dynamic import to prevent SSR hydration errors with ReactPlayer
// Dynamic import to prevent SSR hydration errors with ReactPlayer
const ReactPlayer = dynamic(() => import("react-player"), { ssr: false })
import { saveProgress, addXP } from "@/app/learn/[slug]/actions"

export default function CoursePlayer({ product, modules, lessons, academy, initialProgress = {} }) {
  const [currentLessonId, setCurrentLessonId] = useState(lessons[0]?.id || null)
  const [progressMap, setProgressMap] = useState(initialProgress)
  const [isMounted, setIsMounted] = useState(false)
  const [toast, setToast] = useState(null)
  const primaryColor = academy?.primary_color || "#FF4500"
  
  const lastSavedRef = useRef(0)
  const xpTriggeredRef = useRef({})
  const videoRef = useRef(null)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const currentLesson = lessons.find(l => l.id === currentLessonId)

  // Group lessons by module
  const lessonsByModule = modules.reduce((acc, m) => {
    acc[m.id] = lessons.filter(l => l.module_id === m.id).sort((a, b) => a.position - b.position)
    return acc
  }, {})

  // Calculate real progress percentage
  const playable = lessons || []
  const completion = playable.reduce((acc, l) => acc + (progressMap[l.id]?.completed ? 1 : 0), 0)
  const pct = playable.length > 0 ? Math.round((completion / playable.length) * 100) : 0

  // Reset progress tracker when lesson changes
  useEffect(() => {
    lastSavedRef.current = 0
  }, [currentLessonId])

  async function persist(seconds, completed = false) {
    if (!currentLesson) return
    try {
      const res = await saveProgress({
        lessonId: currentLesson.id,
        watchedSeconds: seconds,
        completed
      })
      if (res?.ok) {
        setProgressMap(m => ({
          ...m,
          [currentLesson.id]: { ...(m[currentLesson.id] || {}), watched_seconds: seconds, completed }
        }))
      }
    } catch(err) {
      console.error("Failed to save progress", err)
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
      
      // XP Logic (Gamification)
      if (currentLesson?.duration_seconds && !xpTriggeredRef.current[currentLesson.id]) {
        const pctWatched = t / currentLesson.duration_seconds
        if (pctWatched >= 0.9) {
          xpTriggeredRef.current[currentLesson.id] = true
          addXP({ academyId: product.academy_id, xpAmount: 10, actionType: "lesson_completed" })
            .then(res => {
              if(res?.ok) {
                setToast("🎉 +10 XP!")
                setTimeout(() => setToast(null), 4000)
              }
            })
        }
      }
    }
  }

  function onEnded() {
    persist(currentLesson?.duration_seconds || 0, true)
  }

  // Helper to render video player
  const renderVideo = () => {
    if (!isMounted) {
      return <div className="w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-neutral-800"></div>
    }

    if (!currentLesson) {
      return (
        <div className="w-full aspect-video bg-neutral-900 flex items-center justify-center border border-neutral-800 rounded-xl shadow-2xl">
          <p className="text-neutral-500 font-medium">Nenhuma aula disponível.</p>
        </div>
      )
    }

    const url = currentLesson.video_url
    if (!url) {
      return (
        <div className="w-full aspect-video bg-neutral-900 flex items-center justify-center border border-neutral-800 rounded-xl shadow-2xl">
          <p className="text-neutral-500 font-medium">Esta aula não contém vídeo.</p>
        </div>
      )
    }

    let finalUrl = url
    let isYoutube = false
    let youtubeId = null

    if (url.startsWith("storage:lessons/")) {
      finalUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/lessons/${url.replace("storage:lessons/", "")}`
    } else if (url.includes("youtube.com") || url.includes("youtu.be")) {
      isYoutube = true
      const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&]{11})/)
      if (match && match[1]) {
        youtubeId = match[1]
      }
    }

    if (isYoutube && youtubeId) {
      return (
        <div className="w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-neutral-800">
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${youtubeId}?rel=0`}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          ></iframe>
        </div>
      )
    }

    // Direct Upload or generic file (using native HTML5 video)
    return (
      <div className="w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-neutral-800 relative group">
        <video 
          src={finalUrl} 
          controls 
          controlsList="nodownload"
          className="w-full h-full object-contain"
          onTimeUpdate={onTimeUpdate}
          onEnded={onEnded}
          onError={(e) => console.error("Native Video Error:", e.target.error)}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans flex flex-col">
      {/* HEADER */}
      <header className="h-16 border-b border-neutral-800 bg-[#141414] flex items-center justify-between px-6 shrink-0 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link href="/library" className="text-neutral-400 hover:text-white transition flex items-center gap-2 text-sm font-medium">
            <span>←</span> Voltar à Biblioteca
          </Link>
          <div className="w-px h-6 bg-neutral-800 hidden md:block"></div>
          <h1 className="font-bold hidden md:block text-neutral-200">{product.title}</h1>
        </div>
        <div className="flex items-center gap-4">
             {toast && (
               <div className="bg-[#FF4500] text-white text-sm font-bold px-4 py-1.5 rounded-full animate-bounce shadow-[0_0_15px_rgba(255,69,0,0.5)]">
                 {toast}
               </div>
             )}
             
             {pct === 100 && (
               <a 
                 href={`/api/certificate?productId=${product.id}`}
                 target="_blank"
                 className="hidden md:flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-white text-sm font-bold px-4 py-2 rounded-full transition shadow-[0_0_15px_rgba(234,179,8,0.4)]"
               >
                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 15V3m0 12l-4-4m4 4l4-4M2 17l.621 2.485A2 2 0 0 0 4.561 21h14.878a2 2 0 0 0 1.94-1.515L22 17"></path></svg>
                 Certificado
               </a>
             )}

             <div className="flex items-center gap-2">
               <div className="w-24 h-1.5 bg-neutral-800 rounded-full overflow-hidden relative">
                 <div className="h-full absolute left-0 top-0 transition-all duration-500" style={{ backgroundColor: primaryColor, width: `${pct}%` }}></div>
               </div>
               <span className="text-xs font-bold text-neutral-400">{pct}%</span>
             </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* LEFT COLUMN: VIDEO & INFO */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8 scrollbar-hide">
          <div className="max-w-5xl mx-auto space-y-6">
            
            {/* VIDEO PLAYER */}
            {renderVideo()}

            {/* LESSON DETAILS & COMMUNITY */}
            {currentLesson && (
              <div className="bg-[#141414] border border-neutral-800 rounded-xl p-6 lg:p-8 shadow-xl">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                  <div className="flex-1">
                    <h2 className="text-2xl lg:text-3xl font-extrabold mb-2 text-neutral-100">{currentLesson.title}</h2>
                    {currentLesson.description ? (
                      <p className="text-neutral-400 leading-relaxed text-sm">{currentLesson.description}</p>
                    ) : (
                      <p className="text-neutral-600 text-sm italic">Sem descrição disponível.</p>
                    )}
                  </div>
                  
                  {/* COMMUNITY ACTION */}
                  {product.community_url && (
                    <div className="shrink-0 flex flex-col gap-3">
                      <a 
                        href={product.community_url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center justify-center gap-2 hover:opacity-90 text-white font-bold px-6 py-3.5 rounded-lg transition w-full md:w-auto"
                        style={{ backgroundColor: primaryColor, boxShadow: `0 0 20px ${primaryColor}40` }}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                        Aceder à Comunidade
                      </a>
                    </div>
                  )}
                </div>

                {/* MATERIALS */}
                {currentLesson.pdf_url && (
                  <div className="mt-8 border-t border-neutral-800 pt-6">
                    <h3 className="text-sm font-bold text-neutral-500 uppercase tracking-widest mb-4">Materiais da Aula</h3>
                    <a href={currentLesson.pdf_url} target="_blank" className="inline-flex items-center gap-3 bg-neutral-900 border border-neutral-800 hover:border-neutral-600 px-4 py-3 rounded-lg transition">
                      <span className="text-red-500">📄</span>
                      <span className="font-medium text-sm text-neutral-300">Material de Apoio (PDF)</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-neutral-500"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    </a>
                  </div>
                )}

                {/* Q&A */}
                <div className="mt-8 border-t border-neutral-800 pt-6">
                  <h3 className="text-sm font-bold text-neutral-500 uppercase tracking-widest mb-4">Dúvidas sobre a aula?</h3>
                  <p className="text-sm text-neutral-400 mb-6">A tua mensagem será enviada diretamente para a caixa de entrada do professor.</p>
                  <form 
                    onSubmit={async (e) => {
                      e.preventDefault()
                      if (!e.target.content.value.trim()) return
                      const btn = e.target.querySelector('button')
                      btn.disabled = true
                      btn.textContent = "A enviar..."
                      try {
                        const fd = new FormData()
                        // Ensure created_by is passed properly
                        fd.append("recipient_id", product.created_by)
                        fd.append("subject", `Dúvida: ${currentLesson.title}`)
                        fd.append("content", e.target.content.value)
                        fd.append("lesson_id", currentLesson.id)
                        fd.append("product_id", product.id)
                        
                        const { sendMessage } = await import("@/app/inbox/actions")
                        const res = await sendMessage(fd)
                        
                        if (res?.ok) {
                          e.target.reset()
                          alert("Mensagem enviada com sucesso! Vê as respostas na tua Caixa de Mensagens.")
                        } else {
                          alert("Erro ao enviar mensagem.")
                        }
                      } catch (err) {
                        alert(err.message || "Erro ao enviar mensagem.")
                      } finally {
                        btn.disabled = false
                        btn.textContent = "Enviar Dúvida"
                      }
                    }}
                    className="flex flex-col gap-4 max-w-2xl"
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
                        Enviar Dúvida
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: MODULES LIST */}
        <aside className="w-full lg:w-[400px] bg-[#111] border-l border-neutral-800 flex flex-col shrink-0 lg:h-[calc(100vh-64px)] z-10 shadow-[-10px_0_30px_rgba(0,0,0,0.5)]">
          <div className="p-5 border-b border-neutral-800 bg-[#1A1A1A]">
            <h3 className="font-bold text-lg mb-1">Conteúdo do Curso</h3>
            <p className="text-xs text-neutral-500 font-medium">{modules.length} módulos · {lessons.length} aulas</p>
          </div>
          
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-800 scrollbar-track-transparent">
            {modules.map((mod, idx) => {
              const modLessons = lessonsByModule[mod.id] || []
              const isOpen = modLessons.some(l => l.id === currentLessonId) || idx === 0 // Auto-open active module
              
              return (
                <details key={mod.id} className="group border-b border-neutral-800" open={isOpen}>
                  <summary className="p-4 cursor-pointer hover:bg-neutral-900 transition flex items-center justify-between select-none">
                    <div className="font-semibold text-sm text-neutral-300 group-open:text-white transition">
                      {mod.position}. {mod.title}
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-neutral-600 transition-transform group-open:rotate-180">
                      <path d="m6 9 6 6 6-6"/>
                    </svg>
                  </summary>
                  
                  <div className="bg-[#0A0A0A]">
                    {modLessons.map(lesson => {
                      const isActive = lesson.id === currentLessonId
                      const isCompleted = progressMap[lesson.id]?.completed
                      return (
                        <button
                          key={lesson.id}
                          onClick={() => setCurrentLessonId(lesson.id)}
                          className={`w-full text-left p-4 pl-6 flex items-start gap-4 transition-colors border-l-2 ${
                            isActive 
                              ? "bg-neutral-900" 
                              : "border-transparent hover:bg-neutral-900"
                          }`}
                          style={isActive ? { borderLeftColor: primaryColor } : {}}
                        >
                          <div 
                            className={`mt-0.5 shrink-0 w-6 h-6 rounded-full flex items-center justify-center border transition-colors ${isActive ? "" : "border-neutral-700 text-neutral-500"} ${isCompleted ? "bg-[#FF4500] border-[#FF4500] text-white" : ""}`}
                            style={isActive && !isCompleted ? { borderColor: primaryColor, color: primaryColor } : (isCompleted ? { backgroundColor: primaryColor, borderColor: primaryColor, color: "white" } : {})}
                          >
                            {isCompleted ? (
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            ) : (
                              <svg width="10" height="10" viewBox="0 0 24 24" fill={isActive ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><path d="M5 3l14 9-14 9V3z"/></svg>
                            )}
                          </div>
                          <div className="flex-1 min-w-0 pr-2">
                            <p className={`text-sm font-medium leading-snug ${isActive || isCompleted ? "text-white" : "text-neutral-400"}`}>
                              {lesson.title}
                            </p>
                            <p className="text-xs text-neutral-600 mt-1">{Math.floor((lesson.duration_seconds || 0)/60)}m</p>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </details>
              )
            })}
          </div>
        </aside>
      </main>
    </div>
  )
}
