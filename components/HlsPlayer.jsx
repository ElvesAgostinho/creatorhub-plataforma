"use client"

import { useEffect, useRef, useState } from "react"
import Hls from "hls.js"

export default function HlsPlayer({ src, onTimeUpdate, onEnded, className, style }) {
  const videoRef = useRef(null)
  const hlsRef = useRef(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video || !src) return

    if (Hls.isSupported()) {
      const hls = new Hls({
        maxBufferLength: 30,
        maxMaxBufferLength: 600,
      })

      hls.loadSource(src)
      hls.attachMedia(video)

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              setError("Erro de Rede (CORS ou Servidor Indisponível)")
              hls.startLoad()
              break
            case Hls.ErrorTypes.MEDIA_ERROR:
              setError("Erro de Media")
              hls.recoverMediaError()
              break
            default:
              setError("Erro Desconhecido ao reproduzir o vídeo")
              hls.destroy()
              break
          }
        } else {
          console.error("HLS Error:", data)
        }
      })

      hlsRef.current = hls

      return () => {
        hls.destroy()
      }
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Para Safari (Native HLS)
      video.src = src
    }
  }, [src])

  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-black border border-red-500/30 rounded-xl p-8 text-center text-red-500">
        <svg className="w-12 h-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p className="font-bold text-lg mb-2">O vídeo foi bloqueado pelo Navegador</p>
        <p className="text-sm text-red-400/80">
          O Supabase bloqueou o acesso ao ficheiro de vídeo por falta de permissões CORS.<br/>
          Vai ao painel do Supabase ➔ Storage ➔ Configuration ➔ Policies/CORS e garante que a tua pasta tem permissão pública para o teu domínio.
        </p>
      </div>
    )
  }

  return (
    <video
      ref={videoRef}
      controls
      playsInline
      className={className || "w-full h-full object-contain bg-black"}
      style={style}
      controlsList="nodownload"
      onTimeUpdate={onTimeUpdate}
      onEnded={onEnded}
    />
  )
}
