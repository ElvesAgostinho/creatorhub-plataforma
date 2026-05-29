"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import {
  ArrowLeft, Download, ChevronLeft, ChevronRight,
  ZoomIn, ZoomOut, Moon, Sun, Maximize2, BookOpen, Loader2
} from "lucide-react"

export default function EbookReaderClient({ product, pdfUrl }) {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const [pdfDoc, setPdfDoc] = useState(null)
  const [pageNum, setPageNum] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [scale, setScale] = useState(1.2)
  const [nightMode, setNightMode] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pageInput, setPageInput] = useState("1")
  const [renderTask, setRenderTask] = useState(null)
  const isRendering = useRef(false)

  // Load pdf.js from CDN
  useEffect(() => {
    const loadPdfJs = async () => {
      try {
        if (window.pdfjsLib) return

        // Load pdf.js
        await new Promise((resolve, reject) => {
          const script = document.createElement("script")
          script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"
          script.onload = resolve
          script.onerror = reject
          document.head.appendChild(script)
        })

        window.pdfjsLib.GlobalWorkerOptions.workerSrc =
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js"
      } catch (e) {
        setError("Erro ao carregar leitor de PDF. Tenta recarregar a página.")
        setIsLoading(false)
      }
    }

    loadPdfJs().then(() => {
      loadDocument()
    })
  }, [])

  const loadDocument = useCallback(async () => {
    if (!window.pdfjsLib) return
    setIsLoading(true)
    setError(null)
    try {
      const loadingTask = window.pdfjsLib.getDocument({
        url: pdfUrl,
        withCredentials: true,
        cMapUrl: "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/",
        cMapPacked: true,
      })
      const doc = await loadingTask.promise
      setPdfDoc(doc)
      setTotalPages(doc.numPages)
      setIsLoading(false)
    } catch (e) {
      console.error("[EbookReader] Erro ao carregar PDF:", e)
      setError(`Erro ao carregar o PDF: ${e.message}`)
      setIsLoading(false)
    }
  }, [pdfUrl])

  // Render page whenever pdfDoc, pageNum or scale changes
  useEffect(() => {
    if (!pdfDoc) return
    renderPage(pageNum)
  }, [pdfDoc, pageNum, scale, nightMode])

  const renderPage = useCallback(async (num) => {
    if (!pdfDoc || !canvasRef.current) return
    if (isRendering.current) return
    isRendering.current = true

    try {
      const page = await pdfDoc.getPage(num)
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")

      const viewport = page.getViewport({ scale })
      canvas.width = viewport.width
      canvas.height = viewport.height

      // Night mode background
      if (nightMode) {
        ctx.fillStyle = "#1a1a1a"
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }

      const task = page.render({
        canvasContext: ctx,
        viewport,
        background: nightMode ? "#1a1a1a" : "white"
      })

      await task.promise
      setPageInput(String(num))
    } catch (e) {
      if (e.name !== "RenderingCancelledException") {
        console.error("[EbookReader] Render error:", e)
      }
    } finally {
      isRendering.current = false
    }
  }, [pdfDoc, scale, nightMode])

  const goToPage = useCallback((n) => {
    const p = Math.max(1, Math.min(n, totalPages))
    setPageNum(p)
    setPageInput(String(p))
  }, [totalPages])

  const zoomIn = () => setScale(s => Math.min(s + 0.25, 3))
  const zoomOut = () => setScale(s => Math.max(s - 0.25, 0.5))

  const readProgress = totalPages > 0 ? Math.round((pageNum / totalPages) * 100) : 0

  return (
    <div
      className={`h-screen flex flex-col overflow-hidden transition-colors duration-300 ${nightMode ? "bg-[#0f0f0f]" : "bg-[#f0f0f0]"}`}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Top bar */}
      <header className={`h-14 flex items-center justify-between px-4 md:px-6 shrink-0 border-b z-20 transition-colors ${nightMode ? "bg-[#1a1a1a] border-white/10" : "bg-white border-neutral-200"}`}>
        {/* Left */}
        <div className="flex items-center gap-3">
          <Link
            href="/library"
            className={`w-9 h-9 rounded-full flex items-center justify-center transition ${nightMode ? "text-white/60 hover:text-white hover:bg-white/10" : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100"}`}
          >
            <ArrowLeft size={18} />
          </Link>
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${nightMode ? "bg-[#FF4500]/20 text-[#FF4500]" : "bg-[#FFF0EB] text-[#FF4500]"}`}>
              <BookOpen size={16} />
            </div>
            <div className="hidden sm:block">
              <p className={`text-xs font-bold leading-tight truncate max-w-[180px] ${nightMode ? "text-white" : "text-neutral-900"}`}>
                {product.title}
              </p>
              <p className={`text-[10px] ${nightMode ? "text-white/40" : "text-neutral-400"}`}>
                Leitura Online
              </p>
            </div>
          </div>
        </div>

        {/* Center — page navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => goToPage(pageNum - 1)}
            disabled={pageNum <= 1}
            className={`w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-30 transition ${nightMode ? "text-white/70 hover:bg-white/10" : "text-neutral-600 hover:bg-neutral-100"}`}
          >
            <ChevronLeft size={18} />
          </button>
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              min={1}
              max={totalPages}
              value={pageInput}
              onChange={e => setPageInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && goToPage(parseInt(pageInput) || 1)}
              onBlur={() => goToPage(parseInt(pageInput) || pageNum)}
              className={`w-12 text-center text-sm font-bold rounded-lg border py-1 px-1 transition ${nightMode ? "bg-white/10 border-white/20 text-white" : "bg-neutral-50 border-neutral-200 text-neutral-900"}`}
            />
            <span className={`text-sm ${nightMode ? "text-white/40" : "text-neutral-400"}`}>
              / {totalPages}
            </span>
          </div>
          <button
            onClick={() => goToPage(pageNum + 1)}
            disabled={pageNum >= totalPages}
            className={`w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-30 transition ${nightMode ? "text-white/70 hover:bg-white/10" : "text-neutral-600 hover:bg-neutral-100"}`}
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Right — tools */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={zoomOut}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition ${nightMode ? "text-white/60 hover:bg-white/10" : "text-neutral-500 hover:bg-neutral-100"}`}
          >
            <ZoomOut size={16} />
          </button>
          <span className={`text-xs font-bold w-10 text-center ${nightMode ? "text-white/60" : "text-neutral-500"}`}>
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={zoomIn}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition ${nightMode ? "text-white/60 hover:bg-white/10" : "text-neutral-500 hover:bg-neutral-100"}`}
          >
            <ZoomIn size={16} />
          </button>

          <div className={`w-px h-5 mx-1 ${nightMode ? "bg-white/10" : "bg-neutral-200"}`} />

          <button
            onClick={() => setNightMode(m => !m)}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition ${nightMode ? "text-amber-400 bg-amber-400/10 hover:bg-amber-400/20" : "text-neutral-500 hover:bg-neutral-100"}`}
          >
            {nightMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <a
            href={`${pdfUrl}?download=1`}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition ${nightMode ? "text-white/60 hover:bg-white/10" : "text-neutral-500 hover:bg-neutral-100"}`}
            title="Baixar PDF"
          >
            <Download size={16} />
          </a>
        </div>
      </header>

      {/* Reading progress bar */}
      <div className="h-0.5 shrink-0 bg-transparent relative">
        <div
          className="h-full bg-[#FF4500] transition-all duration-300"
          style={{ width: `${readProgress}%` }}
        />
      </div>

      {/* PDF Canvas area */}
      <main
        ref={containerRef}
        className={`flex-1 overflow-auto flex justify-center py-6 px-4 ${nightMode ? "bg-[#0f0f0f]" : "bg-[#e8e8e8]"}`}
      >
        {isLoading && (
          <div className="flex flex-col items-center justify-center gap-4 text-neutral-400">
            <Loader2 size={36} className="animate-spin text-[#FF4500]" />
            <p className="text-sm font-medium">A carregar o livro...</p>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center gap-4 max-w-sm text-center">
            <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center">
              <BookOpen size={28} className="text-red-400" />
            </div>
            <div>
              <p className="font-bold text-neutral-700 mb-1">Não foi possível carregar o livro</p>
              <p className="text-sm text-neutral-500">{error}</p>
            </div>
            <button
              onClick={loadDocument}
              className="bg-[#FF4500] hover:bg-[#e03e00] text-white font-bold px-6 py-2.5 rounded-lg transition"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {!isLoading && !error && (
          <canvas
            ref={canvasRef}
            className={`shadow-2xl max-w-full rounded select-none ${nightMode ? "border border-white/10" : ""}`}
            style={{
              filter: nightMode ? "invert(0.9) hue-rotate(180deg)" : "none",
              userSelect: "none",
            }}
          />
        )}
      </main>

      {/* Bottom navigation bar */}
      {!isLoading && !error && totalPages > 1 && (
        <div className={`h-14 shrink-0 flex items-center justify-between px-6 border-t transition-colors ${nightMode ? "bg-[#1a1a1a] border-white/10" : "bg-white border-neutral-200"}`}>
          <button
            onClick={() => goToPage(pageNum - 1)}
            disabled={pageNum <= 1}
            className="flex items-center gap-2 text-sm font-bold text-neutral-500 hover:text-[#FF4500] disabled:opacity-30 transition"
          >
            <ChevronLeft size={18} />
            <span className="hidden sm:inline">Página anterior</span>
          </button>

          <div className={`flex items-center gap-3 text-xs ${nightMode ? "text-white/40" : "text-neutral-400"}`}>
            <span className="font-bold text-[#FF4500]">{readProgress}%</span>
            <span>lido</span>
          </div>

          <button
            onClick={() => goToPage(pageNum + 1)}
            disabled={pageNum >= totalPages}
            className="flex items-center gap-2 text-sm font-bold text-neutral-500 hover:text-[#FF4500] disabled:opacity-30 transition"
          >
            <span className="hidden sm:inline">Próxima página</span>
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  )
}
