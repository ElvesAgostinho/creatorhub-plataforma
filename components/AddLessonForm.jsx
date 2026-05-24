"use client"

import { useState } from "react"
import { addLesson } from "@/app/admin/products/actions"
import Uploader from "@/components/Uploader"

export default function AddLessonForm({ productId, moduleId, modulePosition }) {
  const [videoUrl, setVideoUrl] = useState("")
  const [pdfUrl, setPdfUrl] = useState("")

  return (
    <form action={addLesson} className="mb-6 grid sm:grid-cols-2 gap-4 bg-white border border-neutral-100 p-4 rounded-lg shadow-sm">
      <input type="hidden" name="module_id" value={moduleId} />
      <input type="hidden" name="product_id" value={productId} />
      
      <div>
        <label className="text-sm font-medium">Título da aula</label>
        <input type="text" name="title" required className="mt-1 w-full border border-neutral-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0E7C86]" />
      </div>
      <div>
        <label className="text-sm font-medium">Duração (segundos)</label>
        <input type="number" name="duration_seconds" defaultValue="0" className="mt-1 w-full border border-neutral-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0E7C86]" />
      </div>
      
      <div className="sm:col-span-2">
        <label className="text-sm font-medium">Descrição (opcional)</label>
        <textarea name="description" rows={2} className="mt-1 w-full border border-neutral-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0E7C86]" />
      </div>
      
      <div className="sm:col-span-2 p-4 border border-neutral-200 bg-neutral-50 rounded-lg">
        <label className="text-sm font-bold text-neutral-800">Ficheiro vídeo (MP4) - Máximo 100MB</label>
        <p className="text-xs text-neutral-500 mb-3">
          Recomendamos vídeos bem comprimidos. Para vídeos maiores, aloja no Vimeo/YouTube e cola o link.
        </p>
        <Uploader 
          bucket="lessons" 
          pathPrefix={`${productId}/`}
          accept="video/mp4,video/quicktime,video/webm" 
          label="Selecionar Vídeo"
          isResumable={true}
          maxSizeMB={100}
          onSuccess={(path) => setVideoUrl(path)}
        />
        <input type="hidden" name="uploaded_video_path" value={videoUrl} />
      </div>

      <div className="sm:col-span-2">
        <label className="text-sm font-medium">Ou URL externo (YouTube/Vimeo/etc)</label>
        <input type="text" name="video_url" placeholder="https://…" className="mt-1 w-full border border-neutral-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0E7C86]" />
      </div>

      <div className="sm:col-span-2 p-4 border border-neutral-200 bg-neutral-50 rounded-lg">
        <label className="text-sm font-bold text-neutral-800">Material de Apoio (PDF)</label>
        <p className="text-xs text-neutral-500 mb-3">Anexa um ficheiro PDF para os alunos descarregarem.</p>
        <Uploader 
          bucket="lessons" 
          pathPrefix={`${productId}/pdf/`}
          accept="application/pdf" 
          label="Selecionar PDF"
          onSuccess={(path) => setPdfUrl(path)}
        />
        <input type="hidden" name="pdf_url" value={pdfUrl} />
      </div>
      
      <label className="flex items-center gap-2 text-sm sm:col-span-2 mt-2">
        <input type="checkbox" name="is_preview" /> Pré-visualização (grátis)
      </label>
      
      <button type="submit" className="sm:col-span-2 bg-[#0E7C86] hover:bg-[#0a626a] text-white font-bold py-2.5 rounded-md mt-2">
        Guardar Aula {modulePosition ? `(Módulo ${modulePosition})` : ''}
      </button>
    </form>
  )
}
