"use client"

import { useState } from "react"
import { addLesson } from "@/app/admin/products/actions"
import Uploader from "@/components/Uploader"
import MediaLinkInput from "@/components/MediaLinkInput"
import { Link2, HardDrive, Youtube, Video } from "lucide-react"

export default function AddLessonForm({
  productId,
  userId,
  moduleId,
  modulePosition,
  isStorageActive,
  platformVideoEnabled = true,
  platformPhotoEnabled = true,
}) {
  const [videoUrl, setVideoUrl] = useState("")
  const [pdfUrl, setPdfUrl] = useState("")
  const [mediaSource, setMediaSource] = useState("youtube") // default to youtube (free)

  const showExternal = mediaSource !== "internal"
  const showInternal = mediaSource === "internal"

  return (
    <form action={addLesson} className="mb-6 grid sm:grid-cols-2 gap-4 bg-white border border-neutral-100 p-4 rounded-lg shadow-sm">
      <input type="hidden" name="module_id" value={moduleId} />
      <input type="hidden" name="product_id" value={productId} />

      <div>
        <label className="text-sm font-medium">Título da aula</label>
        <input
          type="text"
          name="title"
          required
          className="mt-1 w-full border border-neutral-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0E7C86]"
        />
      </div>
      <div>
        <label className="text-sm font-medium">Duração (segundos)</label>
        <input
          type="number"
          name="duration_seconds"
          defaultValue="0"
          className="mt-1 w-full border border-neutral-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0E7C86]"
        />
      </div>

      <div className="sm:col-span-2">
        <label className="text-sm font-medium">Descrição (opcional)</label>
        <textarea
          name="description"
          rows={2}
          className="mt-1 w-full border border-neutral-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0E7C86]"
        />
      </div>

      {/* ── Media Source Selector ── */}
      <div className="sm:col-span-2">
        <label className="text-sm font-semibold text-neutral-800 block mb-2">Fonte do Vídeo</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { value: "youtube", label: "YouTube", icon: "▶", color: "#FF0000", free: true },
            { value: "vimeo", label: "Vimeo", icon: "▶", color: "#1AB7EA", free: true },
            { value: "google_drive", label: "Google Drive", icon: "📁", color: "#4285F4", free: true },
            { value: "external_link", label: "Link MP4", icon: "🔗", color: "#6B7280", free: true },
            { value: "internal", label: isStorageActive ? "Storage Interno" : "Storage (Requer Plano)", icon: "🔒", color: "#10B981", free: false, disabled: !isStorageActive },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => !opt.disabled && setMediaSource(opt.value)}
              disabled={opt.disabled}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition text-xs font-bold
                ${mediaSource === opt.value
                  ? "border-current text-current bg-white shadow-sm"
                  : "border-neutral-200 text-neutral-500 hover:border-neutral-300 hover:text-neutral-700 bg-neutral-50"
                }
                ${opt.disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
              `}
              style={mediaSource === opt.value ? { borderColor: opt.color, color: opt.color } : {}}
              title={opt.disabled ? "Requer Plano Pro Storage" : opt.label}
            >
              <span className="text-lg">{opt.icon}</span>
              <span>{opt.label}</span>
              {opt.free && <span className="text-[9px] font-normal text-green-600 bg-green-50 px-1.5 rounded-full">grátis</span>}
              {!opt.free && !opt.disabled && <span className="text-[9px] font-normal text-orange-500 bg-orange-50 px-1.5 rounded-full">pago</span>}
            </button>
          ))}
        </div>
        {/* Hidden field for media_source */}
        <input type="hidden" name="media_source" value={mediaSource} />
      </div>

      {/* ── External Link Input (YouTube, Vimeo, Drive, MP4) ── */}
      {showExternal && (
        <div className="sm:col-span-2" id="external-link">
          <MediaLinkInput
            name="external_media_url"
            label={
              mediaSource === "youtube" ? "Link do YouTube" :
              mediaSource === "vimeo" ? "Link do Vimeo" :
              mediaSource === "google_drive" ? "Link do Google Drive" :
              "URL do Vídeo (MP4 direto)"
            }
            placeholder={
              mediaSource === "youtube" ? "https://youtube.com/watch?v=..." :
              mediaSource === "vimeo" ? "https://vimeo.com/..." :
              mediaSource === "google_drive" ? "https://drive.google.com/file/d/..." :
              "https://cdn.exemplo.com/video.mp4"
            }
            helper={
              mediaSource === "youtube" ? "Cola o URL do YouTube. Podes usar vídeos não listados para privacidade." :
              mediaSource === "vimeo" ? "Cola o URL do Vimeo. Configura o vídeo como 'Only me' + 'Allow embeds' nas definições do Vimeo." :
              mediaSource === "google_drive" ? "Cola o URL de partilha do Google Drive. O ficheiro deve estar partilhado como 'Qualquer pessoa com o link'." :
              "URL direto para um ficheiro .mp4 ou .webm."
            }
            type="video"
          />
        </div>
      )}

      {/* ── Internal Storage Upload ── */}
      {showInternal && (
        <div className="sm:col-span-2">
          <Uploader
            bucket="lessons"
            pathPrefix={`${userId}/`}
            accept="video/mp4,video/quicktime,video/webm"
            label="Ficheiro vídeo (MP4) — Máximo 100MB"
            isResumable={true}
            maxSizeMB={100}
            onSuccess={(path) => setVideoUrl(path)}
            isStorageActive={isStorageActive}
            uploadType="video"
            platformEnabled={platformVideoEnabled}
          />
          <input type="hidden" name="uploaded_video_path" value={videoUrl} />
          {isStorageActive && (
            <p className="text-xs text-neutral-500 mt-2 flex items-center gap-1">
              <HardDrive size={12} /> Recomendamos vídeos comprimidos abaixo de 100MB. Para vídeos maiores, usa YouTube ou Vimeo.
            </p>
          )}
        </div>
      )}

      {/* ── PDF Support Material ── */}
      <div className="sm:col-span-2 p-4 border border-neutral-200 bg-neutral-50 rounded-lg">
        <label className="text-sm font-bold text-neutral-800">Material de Apoio (PDF) — Opcional</label>
        <p className="text-xs text-neutral-500 mb-3">Anexa um ficheiro PDF para os alunos descarregarem.</p>
        <Uploader
          bucket="lessons"
          pathPrefix={`${userId}/pdf/`}
          accept="application/pdf"
          label="Selecionar PDF"
          onSuccess={(path) => setPdfUrl(path)}
          isStorageActive={isStorageActive}
          uploadType="file"
          platformEnabled={true}
        />
        <input type="hidden" name="pdf_url" value={pdfUrl} />
      </div>

      <label className="flex items-center gap-2 text-sm sm:col-span-2 mt-2">
        <input type="checkbox" name="is_preview" /> Pré-visualização (grátis)
      </label>

      <button
        type="submit"
        className="sm:col-span-2 bg-[#0E7C86] hover:bg-[#0a626a] text-white font-bold py-2.5 rounded-md mt-2"
      >
        Guardar Aula {modulePosition ? `(Módulo ${modulePosition})` : ""}
      </button>
    </form>
  )
}
