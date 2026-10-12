"use client"

import { useState, useRef, useEffect } from "react"
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
      // 1. Pedir ao servidor um endereço assinado. É aí que se verifica a
      //    sessão, o contentor e se a pasta é mesmo deste utilizador.
      const resposta = await fetch("/api/storage/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentor: bucket, caminho: filename, contentType: finalContentType }),
      })

      const corpo = await resposta.json()
      if (!resposta.ok) throw new Error(corpo.error || "Não foi possível preparar o envio.")

      const { url, referencia, publico } = corpo.data

      // 2. Enviar o ficheiro diretamente para o armazenamento.
      //    XHR em vez de fetch porque é o único que dá progresso de envio.
      await new Promise((resolver, rejeitar) => {
        const pedido = new XMLHttpRequest()
        pedido.open("PUT", url, true)
        pedido.setRequestHeader("Content-Type", finalContentType)

        pedido.upload.onprogress = (evento) => {
          if (evento.lengthComputable) {
            setProgress(Math.floor((evento.loaded / evento.total) * 100))
          }
        }
        pedido.onload = () => {
          if (pedido.status >= 200 && pedido.status < 300) resolver()
          else rejeitar(new Error(`O armazenamento respondeu ${pedido.status}.`))
        }
        pedido.onerror = () => rejeitar(new Error("Falha de rede durante o envio."))
        pedido.onabort = () => rejeitar(new Error("Envio cancelado."))
        pedido.send(file)
      })

      setIsUploading(false)
      setProgress(100)

      const caminhoFinal = publico
        ? `${(process.env.NEXT_PUBLIC_S3_URL || "").replace(/\/+$/, "")}/${bucket}/${filename}`
        : referencia

      setUploadUrl(caminhoFinal)
      if (onSuccess) onSuccess(caminhoFinal, file)
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
              className="bg-brand hover:bg-brand-dark text-white font-bold py-1.5 px-4 text-sm rounded-md"
            >
              Iniciar Upload
            </button>
          )}

          {isUploading && (
            <div className="mt-2">
              <div className="text-xs text-neutral-500 font-bold mb-1">A carregar... {progress}%</div>
              <div className="w-full bg-neutral-200 rounded-full h-2.5">
                <div
                  className="bg-brand h-2.5 rounded-full transition-all"
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
    <div className="rounded-xl border-2 border-dashed border-brand/30 bg-gradient-to-br from-orange-50 to-red-50 p-6 text-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-brand/10 flex items-center justify-center">
          <Lock className="text-brand" size={22} />
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
            className="inline-flex items-center gap-1.5 bg-brand hover:bg-brand-dark text-white font-bold text-xs px-4 py-2 rounded-lg transition"
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
