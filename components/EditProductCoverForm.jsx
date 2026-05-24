"use client"

import { useState } from "react"
import { uploadProductImage } from "@/app/admin/products/actions"
import Uploader from "@/components/Uploader"

export default function EditProductCoverForm({ productId, currentImageUrl }) {
  const [imageUrl, setImageUrl] = useState("")

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start mt-4">
      <div className="w-48 aspect-[16/10] bg-neutral-200 rounded-lg overflow-hidden flex items-center justify-center text-xs text-neutral-500">
        {currentImageUrl ? (
          <img src={currentImageUrl} alt="Capa atual" className="w-full h-full object-cover" />
        ) : (
          <span>sem imagem</span>
        )}
      </div>

      <form action={uploadProductImage} className="flex flex-col gap-3 flex-1 w-full">
        <input type="hidden" name="product_id" value={productId} />
        
        <Uploader 
          bucket="images" 
          pathPrefix={`${productId}/`}
          accept="image/jpeg,image/png,image/webp" 
          label="Carregar nova capa"
          onSuccess={(url) => setImageUrl(url)}
        />
        <input type="hidden" name="image_url" value={imageUrl} />
        
        <button 
          disabled={!imageUrl}
          className="bg-[#0E7C86] hover:bg-[#0a626a] text-white font-bold px-4 py-2 rounded-md text-sm w-fit disabled:opacity-50"
        >
          {currentImageUrl ? "Substituir capa" : "Guardar capa"}
        </button>
        <div className="text-xs text-neutral-500 truncate max-w-md mt-2">
          Atual: <span className="font-mono">{currentImageUrl || "—"}</span>
        </div>
      </form>
    </div>
  )
}
