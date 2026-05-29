"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import Link from "next/link"
import {
  ArrowLeft, Play, Pause, SkipBack, SkipForward,
  Volume2, VolumeX, Download, Headphones
} from "lucide-react"

function formatTime(s) {
  if (!s || isNaN(s)) return "0:00"
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, "0")}`
}

export default function AudiobookPlayer({ product, streamUrl }) {
  const audioRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [buffered, setBuffered] = useState(0)

  const speeds = [0.75, 1, 1.25, 1.5, 1.75, 2]

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const onLoaded = () => { setIsLoading(false); setDuration(audio.duration) }
    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
      if (audio.buffered.length > 0) {
        setBuffered(audio.buffered.end(audio.buffered.length - 1))
      }
    }
    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)
    const onEnded = () => setIsPlaying(false)
    const onWaiting = () => setIsLoading(true)
    const onCanPlay = () => setIsLoading(false)

    audio.addEventListener("loadedmetadata", onLoaded)
    audio.addEventListener("timeupdate", onTimeUpdate)
    audio.addEventListener("play", onPlay)
    audio.addEventListener("pause", onPause)
    audio.addEventListener("ended", onEnded)
    audio.addEventListener("waiting", onWaiting)
    audio.addEventListener("canplay", onCanPlay)

    return () => {
      audio.removeEventListener("loadedmetadata", onLoaded)
      audio.removeEventListener("timeupdate", onTimeUpdate)
      audio.removeEventListener("play", onPlay)
      audio.removeEventListener("pause", onPause)
      audio.removeEventListener("ended", onEnded)
      audio.removeEventListener("waiting", onWaiting)
      audio.removeEventListener("canplay", onCanPlay)
    }
  }, [])

  const togglePlay = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    if (isPlaying) audio.pause()
    else audio.play().catch(console.error)
  }, [isPlaying])

  const seek = useCallback((e) => {
    const audio = audioRef.current
    if (!audio || !duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = (e.clientX - rect.left) / rect.width
    audio.currentTime = ratio * duration
  }, [duration])

  const skip = useCallback((seconds) => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = Math.max(0, Math.min(audio.currentTime + seconds, duration))
  }, [duration])

  const changeSpeed = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    const idx = speeds.indexOf(speed)
    const next = speeds[(idx + 1) % speeds.length]
    audio.playbackRate = next
    setSpeed(next)
  }, [speed, speeds])

  const toggleMute = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.muted = !isMuted
    setIsMuted(!isMuted)
  }, [isMuted])

  const changeVolume = useCallback((e) => {
    const audio = audioRef.current
    if (!audio) return
    const v = parseFloat(e.target.value)
    audio.volume = v
    setVolume(v)
    setIsMuted(v === 0)
  }, [])

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0
  const bufferedPct = duration > 0 ? (buffered / duration) * 100 : 0

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === "INPUT") return
      if (e.code === "Space") { e.preventDefault(); togglePlay() }
      if (e.code === "ArrowLeft") skip(-15)
      if (e.code === "ArrowRight") skip(15)
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [togglePlay, skip])

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f0f] via-[#1a1a1a] to-[#111] flex flex-col font-sans">
      {/* Hidden audio element */}
      <audio ref={audioRef} src={streamUrl} preload="metadata" />

      {/* Header */}
      <header className="flex items-center gap-4 px-6 py-5 border-b border-white/10">
        <Link href="/library" className="w-10 h-10 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex items-center gap-2">
          <Headphones size={18} className="text-[#FF4500]" />
          <span className="text-white/50 text-sm font-medium">A Ouvir Audiobook</span>
        </div>
      </header>

      {/* Main player area */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">

          {/* Cover Art */}
          <div className="relative mx-auto w-64 h-64 mb-10">
            <div className="absolute inset-0 rounded-3xl bg-[#FF4500]/20 blur-3xl scale-110" />
            {product.image ? (
              <img
                src={product.image}
                alt={product.title}
                className={`relative w-full h-full object-cover rounded-3xl shadow-2xl border border-white/10 transition-all duration-500 ${isPlaying ? "scale-105" : "scale-100"}`}
              />
            ) : (
              <div className="relative w-full h-full rounded-3xl bg-gradient-to-br from-[#FF4500] to-[#ff6b35] flex items-center justify-center shadow-2xl">
                <Headphones size={64} className="text-white/80" />
              </div>
            )}
            {/* Pulse animation when playing */}
            {isPlaying && (
              <div className="absolute inset-0 rounded-3xl border-2 border-[#FF4500]/50 animate-ping" />
            )}
          </div>

          {/* Track info */}
          <div className="text-center mb-8">
            <h1 className="text-white font-black text-xl leading-tight mb-1">{product.title}</h1>
            <p className="text-white/50 text-sm font-medium">{product.instructor}</p>
          </div>

          {/* Progress bar */}
          <div className="mb-4 space-y-2">
            <div
              className="relative w-full h-1.5 bg-white/10 rounded-full cursor-pointer group"
              onClick={seek}
            >
              {/* Buffered */}
              <div
                className="absolute top-0 left-0 h-full bg-white/20 rounded-full"
                style={{ width: `${bufferedPct}%` }}
              />
              {/* Played */}
              <div
                className="absolute top-0 left-0 h-full bg-[#FF4500] rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
              {/* Thumb */}
              <div
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ left: `calc(${progress}% - 6px)` }}
              />
            </div>
            <div className="flex justify-between text-xs font-medium text-white/40">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-6 mb-8">
            {/* Speed */}
            <button
              onClick={changeSpeed}
              className="text-white/50 hover:text-white transition text-xs font-black bg-white/10 hover:bg-white/20 px-2.5 py-1.5 rounded-lg min-w-[44px] text-center"
            >
              {speed}x
            </button>

            {/* -15s */}
            <button
              onClick={() => skip(-15)}
              className="w-11 h-11 flex flex-col items-center justify-center text-white/70 hover:text-white transition"
            >
              <SkipBack size={22} />
              <span className="text-[9px] font-bold -mt-0.5">15</span>
            </button>

            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              disabled={isLoading}
              className="w-16 h-16 rounded-full bg-[#FF4500] hover:bg-[#e03e00] flex items-center justify-center text-white shadow-lg shadow-[#FF4500]/30 hover:shadow-[#FF4500]/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : isPlaying ? (
                <Pause size={26} fill="white" />
              ) : (
                <Play size={26} fill="white" className="ml-1" />
              )}
            </button>

            {/* +15s */}
            <button
              onClick={() => skip(15)}
              className="w-11 h-11 flex flex-col items-center justify-center text-white/70 hover:text-white transition"
            >
              <SkipForward size={22} />
              <span className="text-[9px] font-bold -mt-0.5">15</span>
            </button>

            {/* Mute */}
            <button
              onClick={toggleMute}
              className="w-9 h-9 flex items-center justify-center text-white/50 hover:text-white transition"
            >
              {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
          </div>

          {/* Volume slider */}
          <div className="flex items-center gap-3 mb-6">
            <VolumeX size={14} className="text-white/30 shrink-0" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={changeVolume}
              className="flex-1 h-1 accent-[#FF4500] cursor-pointer"
            />
            <Volume2 size={14} className="text-white/30 shrink-0" />
          </div>

          {/* Download */}
          <a
            href={`${streamUrl}&download=1`}
            className="w-full flex items-center justify-center gap-2 text-white/50 hover:text-white text-sm font-bold py-3 rounded-xl border border-white/10 hover:border-white/30 transition"
          >
            <Download size={15} />
            Baixar Áudio
          </a>
        </div>
      </main>

      {/* Keyboard shortcuts hint */}
      <div className="text-center pb-6 text-white/20 text-xs">
        Espaço — Play/Pause · ← -15s · → +15s
      </div>
    </div>
  )
}
