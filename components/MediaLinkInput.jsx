"use client"

import { useState, useEffect, useRef } from "react"
import { detectMediaSource, resolveMediaUrl, SOURCE_LABELS, getYouTubeThumbnail } from "@/lib/media-utils"

/**
 * MediaLinkInput — Smart input for external media links.
 * 
 * Features:
 * - Auto-detects source (YouTube, Vimeo, Google Drive, direct link, image)
 * - Shows inline preview/thumbnail after pasting
 * - Validates URL format
 * - Badge showing detected source
 * 
 * Props:
 *   name          — hidden input name for form submission
 *   sourceName    — hidden input name for media_source
 *   defaultValue  — initial URL value
 *   placeholder   — input placeholder text
 *   type          — 'video' (default) | 'image' | 'any'
 *   onChange      — callback(url, source)
 *   label         — field label
 *   helper        — helper text below label
 */
export default function MediaLinkInput({
  name,
  sourceName,
  defaultValue = "",
  placeholder = "Cole aqui o link do YouTube, Vimeo, Google Drive ou URL direto...",
  type = "video",
  onChange,
  label,
  helper,
}) {
  const [url, setUrl] = useState(defaultValue)
  const [source, setSource] = useState(detectMediaSource(defaultValue))
  const [preview, setPreview] = useState(null)
  const [validating, setValidating] = useState(false)
  const debounceRef = useRef(null)

  // Detect source whenever URL changes
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      const detected = detectMediaSource(url)
      setSource(detected)
      buildPreview(url, detected)
      if (onChange) onChange(url, detected)
    }, 400)
    return () => clearTimeout(debounceRef.current)
  }, [url]) // eslint-disable-line react-hooks/exhaustive-deps

  function buildPreview(rawUrl, detectedSource) {
    if (!rawUrl) { setPreview(null); return }
    const { embedUrl, thumbnail } = resolveMediaUrl(rawUrl)
    if (!embedUrl) { setPreview(null); return }
    setPreview({ embedUrl, thumbnail, source: detectedSource })
  }

  const sourceInfo = SOURCE_LABELS[source] || SOURCE_LABELS.unknown
  const hasValue = url.trim().length > 0
  const isValid = source !== "unknown" && hasValue

  const inputCls = `w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-all ${
    !hasValue
      ? "border-neutral-300 focus:ring-[#0E7C86]/50"
      : isValid
      ? "border-green-400 focus:ring-green-400/50 bg-green-50/30"
      : "border-orange-300 focus:ring-orange-300/50"
  }`

  return (
    <div className="w-full space-y-2">
      {label && (
        <div>
          <label className="text-sm font-semibold text-neutral-800">{label}</label>
          {helper && <p className="text-xs text-neutral-500 mt-0.5">{helper}</p>}
        </div>
      )}

      {/* Input Row */}
      <div className="relative">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder={placeholder}
          className={inputCls}
        />
        {/* Source Badge */}
        {hasValue && (
          <div
            className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-[11px] font-bold px-2 py-1 rounded-full"
            style={{
              backgroundColor: sourceInfo.color + "22",
              color: sourceInfo.color,
              border: `1px solid ${sourceInfo.color}44`,
            }}
          >
            <span>{sourceInfo.icon}</span>
            <span>{sourceInfo.label}</span>
            {isValid && <span className="text-green-600">✓</span>}
          </div>
        )}
      </div>

      {/* Hidden form fields */}
      {name && <input type="hidden" name={name} value={url} />}
      {sourceName && <input type="hidden" name={sourceName} value={source} />}

      {/* Source Hints */}
      {!hasValue && (
        <div className="flex flex-wrap gap-2 mt-1">
          {[
            { label: "▶ YouTube", example: "https://youtube.com/watch?v=..." },
            { label: "▶ Vimeo", example: "https://vimeo.com/..." },
            { label: "📁 Google Drive", example: "https://drive.google.com/file/d/..." },
            { label: "🔗 Link MP4", example: "https://cdn.example.com/video.mp4" },
          ].map((hint) => (
            <button
              key={hint.label}
              type="button"
              className="text-[11px] text-neutral-500 border border-neutral-200 rounded-full px-2.5 py-1 hover:bg-neutral-100 hover:text-neutral-800 transition"
              onClick={() => setUrl(hint.example)}
              title={hint.example}
            >
              {hint.label}
            </button>
          ))}
        </div>
      )}

      {/* Invalid URL Warning */}
      {hasValue && !isValid && (
        <p className="text-xs text-orange-600 font-medium flex items-center gap-1">
          ⚠ Link não reconhecido. Certifica-te que é um URL válido do YouTube, Vimeo, Google Drive ou link direto.
        </p>
      )}

      {/* Preview */}
      {preview && isValid && (
        <MediaPreview preview={preview} type={type} url={url} />
      )}
    </div>
  )
}

function MediaPreview({ preview, type, url }) {
  const [showEmbed, setShowEmbed] = useState(false)

  // YouTube thumbnail preview
  if (preview.source === "youtube" && preview.thumbnail) {
    return (
      <div className="mt-2 rounded-xl overflow-hidden border border-neutral-200 bg-black relative group">
        {!showEmbed ? (
          <div className="relative aspect-video cursor-pointer" onClick={() => setShowEmbed(true)}>
            <img
              src={preview.thumbnail}
              alt="YouTube preview"
              className="w-full h-full object-cover"
              onError={(e) => { e.target.style.display = "none" }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6 ml-1">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded">
              ▶ YouTube
            </div>
          </div>
        ) : (
          <div className="aspect-video">
            <iframe
              src={preview.embedUrl}
              className="w-full h-full"
              allow="autoplay; fullscreen"
              allowFullScreen
              title="YouTube preview"
            />
          </div>
        )}
      </div>
    )
  }

  // Vimeo / Google Drive — show embed button
  if (preview.source === "vimeo" || preview.source === "google_drive") {
    const label = preview.source === "vimeo" ? "Vimeo" : "Google Drive"
    const color = preview.source === "vimeo" ? "#1AB7EA" : "#4285F4"
    return (
      <div className="mt-2 rounded-xl overflow-hidden border border-neutral-200">
        {!showEmbed ? (
          <button
            type="button"
            className="w-full py-4 text-sm font-bold flex items-center justify-center gap-2 transition hover:opacity-90"
            style={{ backgroundColor: color + "18", color }}
            onClick={() => setShowEmbed(true)}
          >
            <span className="text-xl">▶</span>
            Pré-visualizar vídeo do {label}
          </button>
        ) : (
          <div className="aspect-video">
            <iframe
              src={preview.embedUrl}
              className="w-full h-full"
              allow="autoplay; fullscreen"
              allowFullScreen
              title={`${label} preview`}
              style={{ border: "none" }}
            />
          </div>
        )}
      </div>
    )
  }

  // Direct image
  if (preview.source === "direct_image") {
    return (
      <div className="mt-2 rounded-xl overflow-hidden border border-neutral-200 max-h-48">
        <img
          src={preview.embedUrl}
          alt="Image preview"
          className="w-full h-full object-cover max-h-48"
          onError={(e) => { e.target.parentElement.innerHTML = '<p class="p-3 text-xs text-orange-500">Não foi possível carregar a imagem.</p>' }}
        />
      </div>
    )
  }

  // Direct video / storage / unknown
  return (
    <div className="mt-2 p-3 rounded-xl border border-green-200 bg-green-50 text-sm text-green-800 flex items-center gap-2 font-medium">
      <span className="text-base">✓</span>
      Link direto detectado — será incorporado no player
    </div>
  )
}
