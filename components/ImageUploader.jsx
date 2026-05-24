"use client"

import { useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"

export default function ImageUploader({ 
  label = "Upload de Imagem", 
  onSuccess,
  defaultValue = "",
  name
}) {
  const [file, setFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [errorMsg, setErrorMsg] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(defaultValue)
  const inputRef = useRef(null)

  const handleUpload = async (selectedFile) => {
    if (!selectedFile) return
    setIsUploading(true)
    setErrorMsg(null)

    const ext = selectedFile.name.split('.').pop()
    const filename = `${crypto.randomUUID()}.${ext}`

    try {
      const supabase = createClient()
      const { data: sessionData } = await supabase.auth.getSession()
      
      if (!sessionData?.session) {
        throw new Error("Sessão expirada. Faz login novamente.")
      }

      // 1. Upload for bucket "uploads"
      const { error: uploadError } = await supabase.storage
        .from("uploads")
        .upload(filename, selectedFile, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      // 2. Obter URL pública
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
    
    // Mostra miniatura local imediata
    const objectUrl = URL.createObjectURL(f)
    setPreviewUrl(objectUrl)
    setFile(f)
    
    // Inicia upload automaticamente
    handleUpload(f)
  }

  return (
    <div className="w-full">
      <label className="block text-sm font-semibold mb-2">{label}</label>
      
      {name && <input type="hidden" name={name} value={previewUrl} />}
      
      <div className="flex items-start gap-4">
        {/* Caixa de Preview */}
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

        {/* Informações e Status */}
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
              <div className="bg-[#FF4500] h-1 rounded-full animate-pulse w-full"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
