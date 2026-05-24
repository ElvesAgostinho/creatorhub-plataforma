"use client"

import { useState } from "react"
import { createResource, updateResource } from "@/app/admin/resources/actions"
import ImageUploader from "@/components/ImageUploader"
import { categoryTree } from "@/lib/data/categories"

export default function CreateResourceForm({ initialData = null }) {
  const [category, setCategory] = useState(initialData?.category || Object.keys(categoryTree)[0])
  const [subcategory, setSubcategory] = useState(initialData?.subcategory || categoryTree[initialData?.category || Object.keys(categoryTree)[0]][0])
  
  const cls = "mt-1 w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF4500]"
  
  const handleCategoryChange = (e) => {
    const newCat = e.target.value
    setCategory(newCat)
    setSubcategory(categoryTree[newCat]?.[0] || "")
  }

  const isEdit = !!initialData
  const action = isEdit ? updateResource : createResource

  return (
    <form action={action} className="mt-6 space-y-4 w-full">
      {isEdit && <input type="hidden" name="id" value={initialData.id} />}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold mb-1">Título</label>
          <input type="text" name="title" required defaultValue={initialData?.title} className={cls} placeholder="Ex: Como vender mais" />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Tipo</label>
          <select name="type" required defaultValue={initialData?.type || "article"} className={cls}>
            <option value="article">Artigo (Blog)</option>
            <option value="ebook">E-book</option>
            <option value="template">Template</option>
            <option value="video">Vídeo</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold mb-1">Categoria Principal</label>
          <select name="category" className={cls} value={category} onChange={handleCategoryChange}>
            {Object.keys(categoryTree).map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Subcategoria</label>
          <select name="subcategory" className={cls} value={subcategory} onChange={e => setSubcategory(e.target.value)}>
            {categoryTree[category]?.map(sub => (
              <option key={sub} value={sub}>{sub}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <ImageUploader 
          label="Imagem de Capa (Upload)" 
          name="cover_image_url"
          defaultValue={initialData?.cover_image_url || ""}
        />
      </div>
      <div>
        <label className="block text-sm font-semibold mb-1">Link Externo (YouTube, PDF, etc)</label>
        <input type="url" name="external_link" defaultValue={initialData?.external_link || ""} className={cls} placeholder="https://youtube.com/..." />
        <p className="text-xs text-neutral-500 mt-1">Para onde o utilizador vai quando clica neste recurso.</p>
      </div>
      <div>
        <label className="block text-sm font-semibold mb-1">Resumo (SEO e Listagem)</label>
        <textarea name="content" rows="3" defaultValue={initialData?.content || ""} className={cls} placeholder="Breve descrição do conteúdo..."></textarea>
      </div>
      <button type="submit" className="bg-[#FF4500] hover:bg-[#e03d00] text-white font-bold py-3 px-8 rounded-xl transition w-full sm:w-auto shadow-md">
        {isEdit ? "Guardar Alterações" : "Publicar Recurso 🚀"}
      </button>
    </form>
  )
}
