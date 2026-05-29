"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import dynamic from "next/dynamic"
import { Menu, X, ChevronLeft, ChevronRight, CheckCircle2, Circle, FileText, PlayCircle, Info, Download, Send, ArrowLeft, MessageSquare } from "lucide-react"

// Removed ReactPlayer
import { saveProgress, addXP } from "@/app/learn/[slug]/actions"
import HlsPlayer from "@/components/HlsPlayer"

export default function CoursePlayer({ product, modules, lessons, academy, initialProgress = {} }) {
  const [currentLessonId, setCurrentLessonId] = useState(lessons[0]?.id || null)
  const [progressMap, setProgressMap] = useState(initialProgress)
  const [isMounted, setIsMounted] = useState(false)
  const [toast, setToast] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('overview') // 'overview', 'materials', 'qa'
  
  const primaryColor = academy?.primary_color || "#FF4500"
  
  const lastSavedRef = useRef(0)
  const xpTriggeredRef = useRef({})

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const currentLessonIndex = lessons.findIndex(l => l.id === currentLessonId)
  const currentLesson = lessons[currentLessonIndex]
  const prevLesson = currentLessonIndex > 0 ? lessons[currentLessonIndex - 1] : null
  const nextLesson = currentLessonIndex < lessons.length - 1 ? lessons[currentLessonIndex + 1] : null

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
    setActiveTab('overview')
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
    // Removed auto-play next lesson based on user request
  }

  const renderVideo = () => {
    if (!isMounted) return <div className="w-full aspect-video bg-black rounded-lg"></div>

    if (!currentLesson) {
      return (
        <div className="w-full aspect-video bg-[#1A1A1A] flex items-center justify-center rounded-lg">
          <p className="text-neutral-500 font-medium">Nenhuma aula disponível.</p>
        </div>
      )
    }

    const isInternal = !currentLesson.media_source || currentLesson.media_source === 'internal'
    const url = isInternal ? currentLesson.video_url : currentLesson.external_media_url

    if (!url) {
      return (
        <div className="w-full aspect-video bg-[#1A1A1A] flex items-center justify-center rounded-lg">
          <p className="text-neutral-500 font-medium">Esta aula não contém vídeo.</p>
        </div>
      )
    }

    if (currentLesson.media_source === 'google_drive' || url.includes('drive.google.com')) {
      const driveUrl = url.replace('/view', '/preview')
      return (
        <div className="w-full aspect-video bg-black rounded-lg overflow-hidden shadow-lg border border-neutral-800">
          <iframe src={driveUrl} width="100%" height="100%" allow="autoplay" className="w-full h-full"></iframe>
        </div>
      )
    }

    if (currentLesson.media_source === 'vimeo' || url.includes('vimeo.com')) {
      const vimeoId = url.split('/').pop()
      return (
        <div className="w-full aspect-video bg-black rounded-lg overflow-hidden shadow-lg border border-neutral-800">
          <iframe src={`https://player.vimeo.com/video/${vimeoId}?title=0&byline=0&portrait=0`} width="100%" height="100%" frameBorder="0" allow="autoplay; fullscreen; picture-in-picture" className="w-full h-full"></iframe>
        </div>
      )
    }

    let finalUrl = url
    let isYoutube = currentLesson.media_source === 'youtube'
    let youtubeId = null

    if (url.startsWith("storage:lessons/")) {
      finalUrl = `/storage/lessons/${url.replace("storage:lessons/", "")}`
    } else if (url.includes("youtube.com") || url.includes("youtu.be")) {
      isYoutube = true
      const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&]{11})/)
      if (match && match[1]) {
        youtubeId = match[1]
      }
    }

    if (isYoutube && youtubeId) {
      return (
        <div className="w-full aspect-video bg-black rounded-lg overflow-hidden shadow-lg border border-neutral-800">
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

    if (finalUrl.includes('.m3u8')) {
      return (
        <div className="w-full aspect-video bg-black rounded-lg overflow-hidden shadow-lg border border-neutral-800 relative group">
          <HlsPlayer
            src={finalUrl}
            onTimeUpdate={onTimeUpdate}
            onEnded={onEnded}
            className="w-full h-full object-contain"
          />
        </div>
      )
    }

    return (
      <div className="w-full aspect-video bg-black rounded-lg overflow-hidden shadow-lg border border-neutral-800 relative group flex items-center justify-center">
        <video 
          src={finalUrl} 
          controls 
          className="w-full h-full object-contain"
          controlsList="nodownload"
          onTimeUpdate={onTimeUpdate}
          onEnded={onEnded}
        />
      </div>
    )
  }

  const getPdfUrl = () => {
    if (!currentLesson?.pdf_url) return null;
    return currentLesson.pdf_url.startsWith("storage:lessons/") 
      ? `/storage/lessons/${currentLesson.pdf_url.replace("storage:lessons/", "")}` 
      : currentLesson.pdf_url;
  }

  return (
    <div className="h-screen bg-[#F4F5F7] text-neutral-900 font-sans flex flex-col md:flex-row overflow-hidden">
      
      {/* MOBILE HEADER */}
      <div className="md:hidden h-14 bg-white border-b border-neutral-200 flex items-center justify-between px-4 shrink-0 z-50">
        <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2 text-neutral-600">
          <Menu size={24} />
        </button>
        <div className="font-bold text-sm truncate max-w-[200px]">{product.title}</div>
        <Link href="/library" className="p-2 -mr-2 text-neutral-600">
          <X size={24} />
        </Link>
      </div>

      {/* LEFT SIDEBAR - MODULES (HOTMART STYLE) */}
      <aside className={`fixed md:relative z-50 md:z-10 w-80 h-full bg-white border-r border-neutral-200 flex flex-col shrink-0 transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        {/* Sidebar Header */}
        <div className="h-16 md:h-20 border-b border-neutral-200 flex items-center justify-between px-6 bg-white shrink-0">
          <Link href="/library" className="flex items-center gap-2 text-neutral-500 hover:text-neutral-900 transition font-bold text-sm">
            <ArrowLeft size={16} />
            Voltar
          </Link>
          <button className="md:hidden text-neutral-500" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {/* Course Progress Area */}
        <div className="px-6 py-6 border-b border-neutral-100 bg-[#FAFAFA]">
          <h2 className="font-black text-lg text-neutral-900 leading-tight mb-4">{product.title}</h2>
          <div className="flex items-center justify-between text-xs font-bold text-neutral-500 mb-2">
            <span>O teu progresso</span>
            <span style={{ color: primaryColor }}>{pct}%</span>
          </div>
          <div className="w-full h-1.5 bg-neutral-200 rounded-full overflow-hidden">
            <div className="h-full transition-all duration-500" style={{ backgroundColor: primaryColor, width: `${pct}%` }}></div>
          </div>
          
          {pct === 100 && (
            <a 
              href={`/api/certificate?productId=${product.id}`}
              target="_blank"
              className="mt-4 flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-white text-xs font-bold px-4 py-2.5 rounded-lg transition shadow-sm w-full"
            >
              <CheckCircle2 size={14} />
              Emitir Certificado
            </a>
          )}
        </div>

        {/* Modules Accordion */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
          {modules.map((mod, idx) => {
            const modLessons = lessonsByModule[mod.id] || []
            const isOpen = modLessons.some(l => l.id === currentLessonId) || idx === 0
            const modCompleted = modLessons.filter(l => progressMap[l.id]?.completed).length
            
            return (
              <details key={mod.id} className="group border-b border-neutral-100" open={isOpen}>
                <summary className="p-5 cursor-pointer hover:bg-neutral-50 transition flex items-start justify-between select-none">
                  <span className="pr-4 block">
                    <span className="font-bold text-sm text-neutral-800 group-hover:text-neutral-900 transition block">
                      Módulo {mod.position}
                    </span>
                    <span className="text-xs text-neutral-500 mt-1 font-medium line-clamp-1 block">{mod.title}</span>
                  </span>
                  <span className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-[10px] font-bold text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-md">
                      {modCompleted}/{modLessons.length}
                    </span>
                  </span>
                </summary>
                
                <div className="bg-[#FAFAFA] border-t border-neutral-100">
                  {modLessons.map(lesson => {
                    const isActive = lesson.id === currentLessonId
                    const isCompleted = progressMap[lesson.id]?.completed
                    return (
                      <button
                        key={lesson.id}
                        onClick={() => {
                          setCurrentLessonId(lesson.id)
                          setSidebarOpen(false)
                        }}
                        className={`w-full text-left py-3.5 px-5 flex items-center gap-3 transition-colors ${
                          isActive ? "bg-white" : "hover:bg-neutral-100"
                        }`}
                      >
                        <div className="shrink-0 flex items-center justify-center">
                          {isCompleted ? (
                            <CheckCircle2 size={18} className="text-green-500 fill-green-50" />
                          ) : isActive ? (
                            <PlayCircle size={18} style={{ color: primaryColor }} className="fill-orange-50" />
                          ) : (
                            <Circle size={18} className="text-neutral-300" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0 pr-2">
                          <p className={`text-sm font-medium leading-snug line-clamp-2 ${isActive ? "text-neutral-900" : "text-neutral-600"}`}>
                            {lesson.title}
                          </p>
                        </div>
                        {lesson.duration_seconds > 0 && (
                          <div className="text-[10px] font-bold text-neutral-400 shrink-0">
                            {Math.floor(lesson.duration_seconds / 60)}m
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </details>
            )
          })}
        </div>
      </aside>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* RIGHT COLUMN - VIDEO & CONTENT */}
      <main className="flex-1 flex flex-col h-full overflow-y-auto bg-[#F4F5F7] relative">
        
        {/* Toast */}
        {toast && (
          <div className="absolute top-6 right-6 z-50 bg-[#FF4500] text-white text-sm font-bold px-6 py-3 rounded-full animate-bounce shadow-xl border border-white/20">
            {toast}
          </div>
        )}

        {/* Video Area */}
        <div className="w-full bg-[#1A1A1A] lg:p-8 p-0 shrink-0 border-b border-neutral-200">
          <div className="max-w-5xl mx-auto">
            {renderVideo()}
            
            {/* Player Controls (Prev / Next) */}
            <div className="flex items-center justify-between mt-4 px-4 lg:px-0">
              <button 
                onClick={() => prevLesson && setCurrentLessonId(prevLesson.id)}
                disabled={!prevLesson}
                className="flex items-center gap-2 text-sm font-bold text-neutral-400 hover:text-white disabled:opacity-30 disabled:hover:text-neutral-400 transition"
              >
                <ChevronLeft size={18} />
                <span className="hidden sm:inline">Aula Anterior</span>
              </button>

              <button
                onClick={() => {
                  if (currentLesson) persist(currentLesson.duration_seconds || 0, true)
                }}
                className="flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-full border border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-white transition"
              >
                <CheckCircle2 size={16} className={progressMap[currentLesson?.id]?.completed ? "text-green-500" : ""} />
                Marcar como concluída
              </button>

              <button 
                onClick={() => nextLesson && setCurrentLessonId(nextLesson.id)}
                disabled={!nextLesson}
                className="flex items-center gap-2 text-sm font-bold text-white hover:text-white disabled:opacity-30 transition"
                style={nextLesson ? { color: primaryColor } : {}}
              >
                <span className="hidden sm:inline">Próxima Aula</span>
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 w-full max-w-5xl mx-auto px-4 lg:px-0 py-8">
          {currentLesson && (
            <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden mb-12">
              
              {/* Content Header */}
              <div className="p-6 md:p-8 border-b border-neutral-100">
                <h1 className="text-2xl md:text-3xl font-black text-neutral-900 tracking-tight mb-2">
                  {currentLesson.title}
                </h1>
                <div className="flex items-center gap-4 text-sm font-medium text-neutral-500">
                  {currentLesson.duration_seconds > 0 && (
                    <span className="flex items-center gap-1.5 bg-neutral-100 px-3 py-1 rounded-full">
                      <PlayCircle size={14} />
                      {Math.floor(currentLesson.duration_seconds / 60)} min
                    </span>
                  )}
                  {getPdfUrl() && (
                    <span className="flex items-center gap-1.5 bg-neutral-100 px-3 py-1 rounded-full">
                      <FileText size={14} />
                      1 Arquivo
                    </span>
                  )}
                </div>
              </div>

              {/* Tabs Navigation */}
              <div className="flex items-center px-6 md:px-8 border-b border-neutral-200 bg-[#FAFAFA]">
                <button 
                  onClick={() => setActiveTab('overview')}
                  className={`flex items-center gap-2 py-4 px-2 text-sm font-bold border-b-2 transition-colors mr-6 ${activeTab === 'overview' ? 'text-neutral-900' : 'text-neutral-500 hover:text-neutral-700 border-transparent'}`}
                  style={activeTab === 'overview' ? { borderBottomColor: primaryColor } : {}}
                >
                  <Info size={16} />
                  Visão Geral
                </button>
                <button 
                  onClick={() => setActiveTab('materials')}
                  className={`flex items-center gap-2 py-4 px-2 text-sm font-bold border-b-2 transition-colors mr-6 ${activeTab === 'materials' ? 'text-neutral-900' : 'text-neutral-500 hover:text-neutral-700 border-transparent'}`}
                  style={activeTab === 'materials' ? { borderBottomColor: primaryColor } : {}}
                >
                  <FileText size={16} />
                  Materiais
                </button>
                <button 
                  onClick={() => setActiveTab('qa')}
                  className={`flex items-center gap-2 py-4 px-2 text-sm font-bold border-b-2 transition-colors ${activeTab === 'qa' ? 'text-neutral-900' : 'text-neutral-500 hover:text-neutral-700 border-transparent'}`}
                  style={activeTab === 'qa' ? { borderBottomColor: primaryColor } : {}}
                >
                  <MessageSquare size={16} />
                  Dúvidas
                </button>
              </div>

              {/* Tabs Content */}
              <div className="p-6 md:p-8">
                
                {/* OVERVIEW TAB */}
                {activeTab === 'overview' && (
                  <div className="prose prose-neutral max-w-none">
                    {currentLesson.description ? (
                      <p className="text-neutral-600 whitespace-pre-wrap leading-relaxed">{currentLesson.description}</p>
                    ) : (
                      <p className="text-neutral-400 italic">Sem descrição adicional para esta aula.</p>
                    )}
                    
                    {product.community_url && (
                      <div className="mt-8">
                        <a 
                          href={product.community_url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="inline-flex items-center justify-center gap-2 text-white font-bold px-6 py-3 rounded-lg transition hover:opacity-90"
                          style={{ backgroundColor: primaryColor }}
                        >
                          <MessageSquare size={18} />
                          Participar da Comunidade
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {/* MATERIALS TAB */}
                {activeTab === 'materials' && (
                  <div className="space-y-4">
                    {getPdfUrl() ? (
                      <>
                        <p className="text-sm font-medium text-neutral-500 mb-2">Arquivos disponíveis para esta aula:</p>
                        <a 
                          href={getPdfUrl()} 
                          target="_blank" 
                          download
                          className="group flex items-center justify-between p-4 rounded-xl border border-neutral-200 bg-white hover:border-[#FF4500] hover:shadow-md transition-all cursor-pointer"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-red-50 text-red-500 flex items-center justify-center shrink-0">
                              <FileText size={24} />
                            </div>
                            <div>
                              <h4 className="font-bold text-neutral-900 group-hover:text-[#FF4500] transition-colors">Material de Apoio (PDF)</h4>
                              <p className="text-xs text-neutral-500 mt-0.5">Clique para baixar ou visualizar</p>
                            </div>
                          </div>
                          <div className="w-10 h-10 rounded-full bg-neutral-50 text-neutral-400 flex items-center justify-center group-hover:bg-[#FFF0EB] group-hover:text-[#FF4500] transition-colors">
                            <Download size={18} />
                          </div>
                        </a>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="w-14 h-14 rounded-2xl bg-neutral-100 text-neutral-300 flex items-center justify-center mb-4">
                          <FileText size={28} />
                        </div>
                        <p className="text-sm font-bold text-neutral-500">Sem materiais para esta aula</p>
                        <p className="text-xs text-neutral-400 mt-1">O criador não adicionou materiais de apoio a esta aula.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* QA TAB */}
                {activeTab === 'qa' && (
                  <div className="max-w-2xl">
                    <p className="text-sm text-neutral-500 mb-6">A tua dúvida será enviada diretamente para a caixa de mensagens do criador deste curso.</p>
                    <form 
                      onSubmit={async (e) => {
                        e.preventDefault()
                        if (!e.target.content.value.trim()) return
                        const btn = e.target.querySelector('button[type="submit"]')
                        btn.disabled = true
                        const originalText = btn.innerHTML
                        btn.innerHTML = "A enviar..."
                        try {
                          const fd = new FormData()
                          fd.append("recipient_id", product.created_by)
                          fd.append("subject", `Dúvida: ${currentLesson.title}`)
                          fd.append("content", e.target.content.value)
                          fd.append("lesson_id", currentLesson.id)
                          fd.append("product_id", product.id)
                          
                          const { sendMessage } = await import("@/app/inbox/actions")
                          const res = await sendMessage(fd)
                          
                          if (res?.ok) {
                            e.target.reset()
                            alert("Mensagem enviada com sucesso! O criador responderá na tua caixa de mensagens.")
                          } else {
                            alert("Erro ao enviar mensagem.")
                          }
                        } catch (err) {
                          alert(err.message || "Erro ao enviar mensagem.")
                        } finally {
                          btn.disabled = false
                          btn.innerHTML = originalText
                        }
                      }}
                      className="space-y-4"
                    >
                      <textarea 
                        name="content"
                        required 
                        rows={4} 
                        className="w-full bg-[#FAFAFA] border border-neutral-200 rounded-xl px-4 py-3 text-sm text-neutral-900 focus:outline-none focus:border-[#FF4500] focus:ring-1 focus:ring-[#FF4500] placeholder-neutral-400 resize-none transition-all"
                        placeholder="Escreve aqui a tua dúvida de forma detalhada..."
                      />
                      <div className="flex justify-end">
                        <button type="submit" className="flex items-center gap-2 text-white font-bold px-6 py-2.5 rounded-lg transition" style={{ backgroundColor: primaryColor }}>
                          <Send size={16} />
                          Enviar Dúvida
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
