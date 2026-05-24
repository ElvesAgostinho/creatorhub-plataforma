"use client"

import { useState } from "react"
import Image from "next/image"

export default function CoursePreview({ image, title, previewUrl }) {
  const [isPlaying, setIsPlaying] = useState(false)

  if (!previewUrl) {
    return (
      <div className="aspect-[16/9] rounded-2xl overflow-hidden bg-neutral-200 relative">
        {image ? (
          <Image src={image} alt={title} fill className="object-cover" priority />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-neutral-400">Sem capa</div>
        )}
      </div>
    )
  }

  return (
    <>
      <div className="aspect-[16/9] rounded-2xl overflow-hidden bg-neutral-900 relative group cursor-pointer" onClick={() => setIsPlaying(true)}>
        {image ? (
          <Image src={image} alt={title} fill className={`object-cover transition-opacity duration-300 ${isPlaying ? 'opacity-0' : 'opacity-100 group-hover:opacity-75'}`} priority />
        ) : (
          <div className={`absolute inset-0 flex items-center justify-center text-neutral-400 transition-opacity duration-300 ${isPlaying ? 'opacity-0' : 'opacity-100 group-hover:opacity-75'}`}>Sem capa</div>
        )}
        
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 bg-white shadow-xl rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#0E7C86" stroke="none" className="ml-1">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        )}

        {isPlaying && (
          previewUrl.includes("youtube.com") || previewUrl.includes("youtu.be") ? (
            <iframe
              src={
                previewUrl.includes("watch?v=") 
                  ? previewUrl.replace("watch?v=", "embed/") + "?autoplay=1"
                  : previewUrl.includes("youtu.be/") 
                    ? previewUrl.replace("youtu.be/", "youtube.com/embed/") + "?autoplay=1"
                    : previewUrl
              }
              className="absolute inset-0 w-full h-full border-0"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video 
              src={previewUrl} 
              controls 
              autoPlay 
              className="absolute inset-0 w-full h-full object-contain bg-black"
            />
          )
        )}
      </div>
      
      {!isPlaying && (
        <button 
          onClick={() => setIsPlaying(true)}
          className="mt-2 w-full text-center text-sm font-bold text-[#0E7C86] hover:underline"
        >
          Pré-visualização
        </button>
      )}
    </>
  )
}
