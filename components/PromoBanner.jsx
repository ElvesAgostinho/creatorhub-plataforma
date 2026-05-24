"use client"

import { useEffect, useState } from "react"

const TOTAL_SECONDS = 60 * 60 + 34 * 60 + 24

function formatPart(n) {
  return String(n).padStart(2, "0")
}

export default function PromoBanner() {
  const [secs, setSecs] = useState(TOTAL_SECONDS)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const id = setInterval(() => {
      setSecs(s => (s > 0 ? s - 1 : 0))
    }, 1000)
    return () => clearInterval(id)
  }, [])

  if (!visible) return null

  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  const s = secs % 60

  return (
    <div className="bg-[#FF3D00] text-white">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 py-3 gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <p className="font-semibold text-sm sm:text-base truncate">
            Este preço não vai durar muito…
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 font-bold tabular-nums">
            <Part value={formatPart(h)} label="horas" />
            <span className="opacity-80">·</span>
            <Part value={formatPart(m)} label="mins" />
            <span className="opacity-80">·</span>
            <Part value={formatPart(s)} label="secs" />
          </div>
          <button
            onClick={() => setVisible(false)}
            aria-label="Fechar"
            className="ml-2 text-white/90 hover:text-white text-xl leading-none"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  )
}

function Part({ value, label }) {
  return (
    <div className="flex flex-col items-center leading-none">
      <span className="text-xl sm:text-2xl font-extrabold">{value}</span>
      <span className="text-[10px] uppercase tracking-wider opacity-90">{label}</span>
    </div>
  )
}
