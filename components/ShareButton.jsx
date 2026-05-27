"use client"

import { useState, useEffect } from "react"
import { Share2, Check } from "lucide-react"

export default function ShareButton({ title, text, url }) {
  const [copied, setCopied] = useState(false)
  const [shareUrl, setShareUrl] = useState("")

  useEffect(() => {
    // Only access window on the client
    setShareUrl(url || window.location.href)
  }, [url])

  const handleShare = async () => {
    const shareData = { title, text, url: shareUrl }
    
    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (err) {
        console.error("Erro ao partilhar:", err)
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (err) {
        console.error("Erro ao copiar:", err)
      }
    }
  }

  return (
    <div 
      onClick={handleShare}
      className="ml-auto flex items-center gap-2 font-bold text-neutral-900 cursor-pointer hover:text-[#FF4500] transition-colors"
    >
      <span>{copied ? "Copiado!" : "Share"}</span>
      {copied ? <Check className="w-5 h-5" /> : <Share2 className="w-5 h-5" />}
    </div>
  )
}
