"use client"
import { useState } from "react"
import Uploader from "@/components/Uploader"

export default function AvatarField({ userId, defaultUrl, defaultInitial }) {
  const [url, setUrl] = useState(defaultUrl)

  const displayUrl = url?.startsWith("storage:")
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${url.split(":")[1]}`
    : url;

  return (
    <div className="flex flex-col sm:flex-row gap-8 items-start mb-8">
      <div className="shrink-0 w-32 h-32 rounded-full overflow-hidden bg-neutral-100 border-4 border-white shadow-lg">
        {displayUrl ? (
          <img src={displayUrl} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-neutral-300">
            {defaultInitial}
          </div>
        )}
      </div>
      <div className="flex-1 w-full">
        <label className="text-sm font-bold text-neutral-800">Foto de Perfil</label>
        <p className="text-xs text-neutral-500 mb-3">Faz o upload de uma foto tua. O tamanho ideal é 500x500px.</p>
        <Uploader 
          bucket="avatars" 
          pathPrefix={`${userId}/`}
          onSuccess={(newUrl) => {
            setUrl(newUrl)
          }}
        />
        <input type="hidden" name="avatar_url" value={url || ""} />
      </div>
    </div>
  )
}
