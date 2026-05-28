"use client"

import { useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Lock, ImageOff } from "lucide-react"

/**
 * ImageUploader — Image upload component with paywall gate.
 *
 * Props:
 *   label           — Field label
 *   onSuccess       — Callback(publicUrl) on upload success
 *   defaultValue    — Initial preview URL
 *   name            — Hidden input name for form
 *   isStorageActive — Whether creator has active storage plan
 *   platformEnabled — Whether photo upload is globally enabled by superadmin
 */
export default function ImageUploader({
  label = "Upload de Imagem",
  onSuccess,
  defaultValue = "",
  name,
  isStorageActive = true,
  platformEnabled = true,
}) {
  const [isUploading, setIsUploading] = useState(false)
  const [errorMsg, setErrorMsg] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(defaultValue)
  const inputRef = useRef(null)

  // ── Paywall Gate ──────────────────────────────────────────────────────────
  if (!isStorageActive) {
    return (
      <div className="w-full">
        {name && <input type="hidden" name={name} value={previewUrl} />}
        <label className="block text-sm font-semibold mb-2">{label}</label>
        <div className="rounded-xl border-2 border-dashed border-[#FF4500]/30 bg-gradient-to-br from-orange-50 to-red-50 p-5 text-center">
          <div className="flex flex-col items-center gap-2">
            <Lock className="text-[#FF4500]" size={20} />
            <p className="font-bold text-neutral-800 text-sm">Upload de imagens requer subscrição</p>
            <p className="text-xs text-neutral-500 max-w-xs">
              Para usar o armazenamento interno, ativa o <strong>Plano Pro Storage</strong>. 
              Em alternativa, usa um link externo (Google Drive, Imgur, etc).
            </p>
            <a
              href="/admin/storage"
              className="mt-1 inline-flex items-center gap-1.5 bg-[#FF4500] hover:bg-[#E03E00] text-white font-bold text-xs px-4 py-2 rounded-lg transition"
            >
              Ver Plano Pro Storage
            </a>
          </div>
        </div>
      </div>
    )
  }

  // ── Superadmin disabled ───────────────────────────────────────────────────
  if (!platformEnabled) {
    return (
      <div className="w-full">
        {name && <input type="hidden" name={name} value={previewUrl} />}
        <label className="block text-sm font-semibold mb-2">{label}</label>
        <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-center">
          <ImageOff className="text-neutral-400 mx-auto mb-1" size={20} />
          <p className="text-xs text-neutral-500">
            Upload de fotografias temporariamente desativado pelo administrador. 
            Usa um link de imagem externo (Google Drive, URL pública).
          </p>
        </div>
      </div>
    )
  }

  // ── Normal Upload ─────────────────────────────────────────────────────────
  const handleUpload = async (selectedFile) => {
    if (!selectedFile) return
    setIsUploading(true)
    setErrorMsg(null)

    const ext = selectedFile.name.split(".").pop()
    const filename = `${crypto.randomUUID()}.${ext}`

    try {
      const supabase = createClient()
      const { data: sessionData } = await supabase.auth.getSession()

      if (!sessionData?.session) {
        throw new Error("Sessão expirada. Faz login novamente.")
      }

      const { error: uploadError } = await supabase.storage
        .from("uploads")
        .upload(filename, selectedFile, {
          cacheControl: "3600",
          upsert: false,
        })

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from("uploads").getPublicUrl(filename)
      setPreviewUrl(data.publicUrl)
      if (onSuccess) onSuccess(data.publicUrl)
    } catch (err) {
      console.error(err)
      setErrorMsg("Erro: " + err.message)
    } finally {
      setIsUploading(false)
    }
  }

  const onChangeFile = (e) => {
    const f = e.target.files[0]
    if (!f) return
    const objectUrl = URL.createObjectURL(f)
    setPreviewUrl(objectUrl)
    handleUpload(f)
  }

  return (
    <div className="w-full">
      <label className="block text-sm font-semibold mb-2">{label}</label>
      {name && <input type="hidden" name={name} value={previewUrl} />}

      <div className="flex items-start gap-4">
        {/* Preview Box */}
        <div
          className="w-24 h-24 border border-neutral-300 rounded-lg bg-neutral-100 flex items-center justify-center overflow-hidden flex-shrink-0 cursor-pointer hover:border-[#FF4500] transition group relative"
          onClick={() => inputRef.current?.click()}
        >
          {previewUrl ? (
            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover group-hover:opacity-50 transition" />
          ) : (
            <span className="text-neutral-400 text-xs text-center px-2">Sem Imagem</span>
          )}
          <div className="absolute inset-0 bg-black/50 text-white flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition flex font-bold text-xs">
            <span>Alterar</span>
          </div>
        </div>

        {/* Info & Status */}
        <div className="flex-1 flex flex-col justify-center">
          <input
            type="file"
            ref={inputRef}
            accept="image/jpeg,image/png,image/webp,image/svg+xml"
            onChange={onChangeFile}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="text-sm font-semibold text-neutral-700 hover:text-black bg-white border border-neutral-300 hover:bg-neutral-50 px-4 py-2 rounded-lg transition inline-flex w-max"
            disabled={isUploading}
          >
            {isUploading ? "A carregar..." : "Escolher Imagem"}
          </button>

          <p className="text-xs text-neutral-400 mt-2">Formatos: JPG, PNG, WEBP, SVG.</p>

          {errorMsg && <p className="text-red-500 text-xs mt-2 font-bold">{errorMsg}</p>}
          {isUploading && (
            <div className="w-full bg-neutral-200 rounded-full h-1 mt-3">
              <div className="bg-[#FF4500] h-1 rounded-full animate-pulse w-full" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
