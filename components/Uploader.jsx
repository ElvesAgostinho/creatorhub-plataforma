"use client"

import { useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import * as tus from "tus-js-client"

export default function Uploader({ 
  bucket, 
  pathPrefix = "", 
  accept, 
  label, 
  onSuccess, 
  onError,
  isResumable = false, // Para vídeos grandes (usa TUS)
  maxSizeMB = 0 // 0 means no limit
}) {
  const [file, setFile] = useState(null)
  const [progress, setProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [errorMsg, setErrorMsg] = useState(null)
  const [uploadUrl, setUploadUrl] = useState(null)
  const inputRef = useRef(null)

    const handleUpload = async () => {
    if (!file) return

    if (maxSizeMB > 0 && file.size > maxSizeMB * 1024 * 1024) {
      setErrorMsg(`O ficheiro é demasiado grande. O limite máximo é de ${maxSizeMB}MB.`)
      return
    }

    setIsUploading(true)
    setErrorMsg(null)
    setProgress(0)

    let ext = file.name.split('.').pop()
    if (!ext || ext === file.name) {
      if (file.type.includes('video')) ext = 'mp4'
      else if (file.type.includes('pdf')) ext = 'pdf'
      else ext = 'bin'
    }
    const filename = `${pathPrefix}${crypto.randomUUID()}.${ext}`
    const finalContentType = file.type || (ext === 'mp4' ? 'video/mp4' : 'application/octet-stream')

    try {
      const supabase = createClient()
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData?.session?.access_token

      if (!token) throw new Error("Não autenticado")

      if (isResumable) {
        // Usa TUS para vídeos grandes
        const upload = new tus.Upload(file, {
          endpoint: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/upload/resumable`,
          retryDelays: [0, 3000, 5000, 10000, 20000],
          headers: {
            Authorization: `Bearer ${token}`,
            'x-upsert': 'true',
          },
          uploadDataDuringCreation: true,
          removeFingerprintOnSuccess: true, // Importante para Supabase
          metadata: {
            bucketName: bucket,
            objectName: filename,
            contentType: finalContentType,
            cacheControl: '3600',
          },
          chunkSize: 6 * 1024 * 1024, // 6MB chunks
          onError: function (error) {
            setIsUploading(false)
            setErrorMsg("Falha no upload: " + error.message)
            if (onError) onError(error)
          },
          onProgress: function (bytesUploaded, bytesTotal) {
            const pct = Math.floor((bytesUploaded / bytesTotal) * 100)
            setProgress(pct)
          },
          onSuccess: function () {
            setIsUploading(false)
            setProgress(100)
            setUploadUrl(`storage:${bucket}/${filename}`)
            if (onSuccess) onSuccess(`storage:${bucket}/${filename}`, file)
          },
        })

        // Começa o upload
        upload.findPreviousUploads().then((previousUploads) => {
          if (previousUploads.length) {
            upload.resumeFromPreviousUpload(previousUploads[0])
          }
          upload.start()
        })
      } else {
        // Upload direto normal (imagens, PDFs)
        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(filename, file, {
            cacheControl: '3600',
            upsert: false
          })

        if (uploadError) throw uploadError

        setIsUploading(false)
        setProgress(100)
        
        // Se for imagem, obtemos o URL público imediatamente
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
                <div className="bg-[#0E7C86] h-2.5 rounded-full transition-all" style={{ width: `${progress}%` }}></div>
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
