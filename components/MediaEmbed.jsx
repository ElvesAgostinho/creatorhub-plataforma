"use client"

import { useRef } from "react"
import { resolveMediaUrl } from "@/lib/media-utils"

/**
 * MediaEmbed — Universal media embed component.
 * Handles YouTube, Vimeo, Google Drive, direct video, HLS, and internal storage.
 * 
 * Props:
 *   src          — raw URL (youtube link, vimeo link, drive link, storage:..., or direct mp4)
 *   mediaSource  — optional hint: 'youtube'|'vimeo'|'google_drive'|'storage'|'direct'
 *   onTimeUpdate — called with {playedSeconds} or native event
 *   onEnded      — called when video ends
 *   className    — CSS class for the container
 *   type         — 'video' (default) | 'image'
 */
export default function MediaEmbed({
  src,
  mediaSource,
  onTimeUpdate,
  onEnded,
  className = "w-full h-full",
  type = "video",
}) {
  const videoRef = useRef(null)

  if (!src) {
    return (
      <div className={`${className} flex items-center justify-center bg-neutral-900`}>
        <div className="text-center text-neutral-500">
          <div className="text-4xl mb-2">🎬</div>
          <p className="text-sm">Nenhum vídeo disponível</p>
        </div>
      </div>
    )
  }

  const { embedUrl, source, isIframe } = resolveMediaUrl(src)

  // ── IMAGE ──────────────────────────────────────────────────────────────────
  if (type === "image") {
    if (!embedUrl) return null
    return (
      <img
        src={embedUrl}
        alt="Media"
        className={`${className} object-cover`}
        loading="lazy"
        referrerPolicy="no-referrer"
      />
    )
  }

  // ── IFRAME (YouTube, Vimeo, Google Drive) ──────────────────────────────────
  if (isIframe && embedUrl) {
    return (
      <iframe
        src={embedUrl}
        className={className}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
        style={{ border: "none" }}
        title="Video"
      />
    )
  }

  // ── HLS (.m3u8) ────────────────────────────────────────────────────────────
  if (embedUrl && embedUrl.includes(".m3u8")) {
    // Dynamically import HlsPlayer only when needed
    const HlsPlayerWrapper = require("@/components/HlsPlayer").default
    return (
      <HlsPlayerWrapper
        src={embedUrl}
        onTimeUpdate={onTimeUpdate}
        onEnded={onEnded}
        className={className}
      />
    )
  }

  // ── NATIVE VIDEO (MP4, storage, direct) ────────────────────────────────────
  return (
    <video
      ref={videoRef}
      src={embedUrl}
      controls
      playsInline
      className={`${className} object-contain bg-black`}
      controlsList="nodownload"
      onTimeUpdate={(e) => {
        if (onTimeUpdate) {
          onTimeUpdate({ playedSeconds: e.target.currentTime })
        }
      }}
      onEnded={onEnded}
    />
  )
}
