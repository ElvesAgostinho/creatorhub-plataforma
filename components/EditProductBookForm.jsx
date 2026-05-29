"use client"

import { useState } from "react"
import { uploadBookPdf } from "@/app/admin/products/actions"
import Uploader from "@/components/Uploader"

export default function EditProductBookForm({ productId, userId, currentFilePath }) {
  const [pdfPath, setPdfPath] = useState("")

  return (
    <form action={uploadBookPdf} className="mt-4 flex flex-col gap-3 w-full max-w-lg">
      <input type="hidden" name="product_id" value={productId} />
      
      <Uploader 
        bucket="books" 
        pathPrefix={`${userId}/`}
        accept="application/pdf" 
        label="Carregar Ficheiro PDF"
        onSuccess={(path) => setPdfPath(path)}
      />
      <input type="hidden" name="pdf_path" value={pdfPath} />
      
      <button 
        disabled={!pdfPath}
        className="bg-[#0E7C86] hover:bg-[#0a626a] text-white font-bold px-4 py-2.5 rounded-md text-sm w-fit disabled:opacity-50 mt-2"
      >
        {currentFilePath ? "Guardar Substituição do PDF" : "Guardar Novo PDF"}
      </button>
    </form>
  )
}
