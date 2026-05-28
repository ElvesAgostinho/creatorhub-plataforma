"use client"

import { useState, useRef, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import * as tus from "tus-js-client"
import { HardDrive, Lock, VideoOff, ImageOff } from "lucide-react"

/**
 * Uploader — File upload component with paywall gate.
 *
 * Props:
 *   bucket          — Supabase storage bucket name
 *   pathPrefix      — Path prefix inside the bucket
 *   accept          — Accepted MIME types
 *   label           — Display label
 *   onSuccess       — Callback(path, file) on successful upload
 *   onError         — Callback(error) on failure
 *   isResumable     — Use TUS resumable upload (for large videos)
 *   maxSizeMB       — Max file size in MB (0 = no limit)
 *   isStorageActive — Whether this creator has an active storage plan
 *   uploadType      — 'video' | 'photo' | 'file' — used for paywall messaging
 *   platformEnabled — Whether this upload type is globally enabled by superadmin
 */
export default function Uploader({
  bucket,
  pathPrefix = "",
  accept,
  label,
  onSuccess,
  onError,
  isResumable = false,
  maxSizeMB = 0,
  isStorageActive = true,
  uploadType = "file",
  platformEnabled = true,
}) {
  const [file, setFile] = useState(null)
  const [progress, setProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [errorMsg, setErrorMsg] = useState(null)
  const [uploadUrl, setUploadUrl] = useState(null)
  const inputRef = useRef(null)

  // ── Paywall: Creator has no storage plan ─────────────────────────────────
  if (!isStorageActive) {
    return <StoragePaywall uploadType={uploadType} />
  }

  // ── Superadmin disabled this upload type globally ─────────────────────────
  if (!platformEnabled) {
    return <UploadDisabledByAdmin uploadType={uploadType} />
  }

  // ── Normal Upload Logic ───────────────────────────────────────────────────
  const handleUpload = async () => {
    if (!file) return

    if (maxSizeMB > 0 && file.size > maxSizeMB * 1024 * 1024) {
      setErrorMsg(`O ficheiro é demasiado grande. O limite máximo é de ${maxSizeMB}MB.`)
      return
    }

    setIsUploading(true)
    setErrorMsg(null)
    setProgress(0)

    let ext = file.name.split(".").pop()
    if (!ext || ext === file.name) {
      if (file.type.includes("video")) ext = "mp4"
      else if (file.type.includes("pdf")) ext = "pdf"
      else ext = "bin"
    }
    const filename = `${pathPrefix}${crypto.randomUUID()}.${ext}`
    const finalContentType = file.type || (ext === "mp4" ? "video/mp4" : "application/octet-stream")

    try {
      const supabase = createClient()
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData?.session?.access_token

      if (!token) throw new Error("Não autenticado")

      if (isResumable) {
        // TUS resumable upload for large videos
        const upload = new tus.Upload(file, {
          endpoint: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/upload/resumable`,
          retryDelays: [0, 3000, 5000, 10000, 20000],
          headers: {
            Authorization: `Bearer ${token}`,
            "x-upsert": "true",
          },
          uploadDataDuringCreation: true,
          removeFingerprintOnSuccess: true,
          metadata: {
            bucketName: bucket,
            objectName: filename,
            contentType: finalContentType,
            cacheControl: "3600",
          },
          chunkSize: 6 * 1024 * 1024, // 6MB chunks
          onError: (error) => {
            setIsUploading(false)
            setErrorMsg("Falha no upload: " + error.message)
            if (onError) onError(error)
          },
          onProgress: (bytesUploaded, bytesTotal) => {
            const pct = Math.floor((bytesUploaded / bytesTotal) * 100)
            setProgress(pct)
          },
          onSuccess: () => {
            setIsUploading(false)
            setProgress(100)
            setUploadUrl(`storage:${bucket}/${filename}`)
            if (onSuccess) onSuccess(`storage:${bucket}/${filename}`, file)
          },
        })

        upload.findPreviousUploads().then((previousUploads) => {
          if (previousUploads.length) {
            upload.resumeFromPreviousUpload(previousUploads[0])
          }
          upload.start()
        }).catch(() => {
          upload.start()
        })
      } else {
        // Standard upload for images/PDFs
        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(filename, file, {
            cacheControl: "3600",
            upsert: false,
          })

        if (uploadError) throw uploadError

        setIsUploading(false)
        setProgress(100)

        let finalPath = filename
        if (bucket === "images") {
          const { data } = supabase.storage.from("images").getPublicUrl(filename)
          finalPath = data.publicUrl
        } else {
          finalPath = `storage:${bucket}/${filename}`
        }

        setUploadUrl(finalPath)
        if (onSuccess) onSuccess(finalPath, file)
      }
    } catch (err) {
      setIsUploading(false)
      setErrorMsg("Erro: " + err.message)
      if (onError) onError(err)
    }
  }

  return (
    <div className="p-4 border border-neutral-200 bg-neutral-50 rounded-lg w-full">
      <label className="text-sm font-bold text-neutral-800 block mb-2">{label || "Selecionar Ficheiro"}</label>

      {!uploadUrl ? (
        <>
          <input
            type="file"
            ref={inputRef}
            accept={accept}
            onChange={(e) => setFile(e.target.files[0])}
            disabled={isUploading}
            className="w-full text-sm mb-3"
          />

          {file && !isUploading && (
            <button
              type="button"
              onClick={handleUpload}
              className="bg-[#0E7C86] hover:bg-[#0a626a] text-white font-bold py-1.5 px-4 text-sm rounded-md"
            >
              Iniciar Upload
            </button>
          )}

          {isUploading && (
            <div className="mt-2">
              <div className="text-xs text-neutral-500 font-bold mb-1">A carregar... {progress}%</div>
              <div className="w-full bg-neutral-200 rounded-full h-2.5">
                <div
                  className="bg-[#0E7C86] h-2.5 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {errorMsg && <p className="text-red-500 text-xs mt-2 font-bold">{errorMsg}</p>}
        </>
      ) : (
        <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 p-2 rounded text-sm font-semibold">
          <span>✓</span> Upload Concluído!
        </div>
      )}
    </div>
  )
}

// ─── Paywall Gate ─────────────────────────────────────────────────────────────

function StoragePaywall({ uploadType }) {
  const isVideo = uploadType === "video"
  const label = isVideo ? "vídeos" : uploadType === "photo" ? "fotografias" : "ficheiros"
  const Icon = isVideo ? VideoOff : ImageOff

  return (
    <div className="rounded-xl border-2 border-dashed border-[#FF4500]/30 bg-gradient-to-br from-orange-50 to-red-50 p-6 text-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-[#FF4500]/10 flex items-center justify-center">
          <Lock className="text-[#FF4500]" size={22} />
        </div>
        <div>
          <p className="font-bold text-neutral-800 text-sm">
            Upload de {label} requer subscrição
          </p>
          <p className="text-xs text-neutral-500 mt-1 max-w-xs mx-auto">
            Para fazer upload de {label} diretamente para a plataforma, ativa o <strong>Plano Pro Storage</strong>.
            Em alternativa, usa links do YouTube, Vimeo ou Google Drive — são gratuitos!
          </p>
        </div>
        <div className="flex gap-2 flex-wrap justify-center mt-1">
          <a
            href="/admin/storage"
            className="inline-flex items-center gap-1.5 bg-[#FF4500] hover:bg-[#E03E00] text-white font-bold text-xs px-4 py-2 rounded-lg transition"
          >
            <HardDrive size={14} />
            Ver Plano Pro Storage
          </a>
          <a
            href="#external-link"
            className="inline-flex items-center gap-1.5 border border-neutral-300 text-neutral-700 hover:bg-neutral-100 font-bold text-xs px-4 py-2 rounded-lg transition"
          >
            Usar Link Externo ↓
          </a>
        </div>
      </div>
    </div>
  )
}

// ─── Admin Disabled Gate ──────────────────────────────────────────────────────

function UploadDisabledByAdmin({ uploadType }) {
  const isVideo = uploadType === "video"
  const label = isVideo ? "vídeos" : "fotografias"
  const Icon = isVideo ? VideoOff : ImageOff

  return (
    <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-5 text-center">
      <div className="flex flex-col items-center gap-2">
        <Icon className="text-neutral-400" size={24} />
        <p className="font-semibold text-neutral-600 text-sm">
          Upload de {label} temporariamente desativado
        </p>
        <p className="text-xs text-neutral-400">
          O administrador da plataforma desativou o upload de {label}. 
          Usa links externos (YouTube, Vimeo, Google Drive) enquanto isso.
        </p>
      </div>
    </div>
  )
}
