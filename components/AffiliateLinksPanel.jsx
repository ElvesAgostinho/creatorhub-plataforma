"use client"

import { useState } from "react"
import { Copy, ExternalLink, Check, Share2 } from "lucide-react"

export default function AffiliateLinksPanel({ links, commission, affiliateId }) {
  const [copiedIdx, setCopiedIdx] = useState(null)
  const [sharedIdx, setSharedIdx] = useState(null)

  const copy = (text, idx) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIdx(idx)
      setTimeout(() => setCopiedIdx(null), 2500)
    }).catch(() => {
      // Fallback for older browsers
      const ta = document.createElement("textarea")
      ta.value = text
      ta.style.position = "fixed"
      ta.style.opacity = "0"
      document.body.appendChild(ta)
      ta.focus()
      ta.select()
      document.execCommand("copy")
      document.body.removeChild(ta)
      setCopiedIdx(idx)
      setTimeout(() => setCopiedIdx(null), 2500)
    })
  }

  const share = async (text, label, idx) => {
    if (navigator.share) {
      try {
        await navigator.share({ title: label, url: text })
        setSharedIdx(idx)
        setTimeout(() => setSharedIdx(null), 2000)
      } catch (e) {
        // User cancelled, that's fine
      }
    } else {
      copy(text, idx)
    }
  }

  return (
    <div className="space-y-4">
      {links.map((link, idx) => (
        <div key={idx} className={idx === 0 ? "" : "pt-4 border-t border-neutral-100"}>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">{link.label}</label>
            {idx === 0 && (
              <span className="text-[10px] bg-[#FF4500]/10 text-[#FF4500] font-bold px-2 py-0.5 rounded-full uppercase">Principal</span>
            )}
          </div>
          <div className="flex gap-1.5">
            <input
              type="text"
              readOnly
              value={link.url}
              onFocus={e => e.target.select()}
              className="flex-1 min-w-0 bg-neutral-50 border border-neutral-200 rounded-lg py-2.5 px-3 text-xs font-mono text-neutral-600 focus:outline-none focus:ring-1 focus:ring-[#FF4500] truncate cursor-pointer"
            />
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 flex items-center justify-center border border-neutral-200 hover:bg-neutral-50 text-neutral-500 hover:text-neutral-800 rounded-lg transition-colors shrink-0"
              title="Testar link"
            >
              <ExternalLink size={14} />
            </a>
            <button
              onClick={() => share(link.url, link.label, idx)}
              className="w-9 h-9 flex items-center justify-center border border-neutral-200 hover:bg-neutral-50 text-neutral-500 hover:text-neutral-800 rounded-lg transition-colors shrink-0"
              title="Partilhar"
            >
              <Share2 size={14} />
            </button>
            <button
              onClick={() => copy(link.url, idx)}
              className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all duration-200 shrink-0 ${
                copiedIdx === idx
                  ? "bg-green-500 text-white scale-95"
                  : "bg-[#FF4500] hover:bg-[#E03E00] text-white hover:scale-105"
              }`}
              title="Copiar link"
            >
              {copiedIdx === idx ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </div>

          {/* Inline copy feedback */}
          {copiedIdx === idx && (
            <p className="text-[11px] text-green-600 font-bold mt-1.5 flex items-center gap-1 animate-pulse">
              <Check size={10} />
              Link copiado para a área de transferência!
            </p>
          )}
        </div>
      ))}

      <div className="mt-4 pt-4 border-t border-neutral-100 text-center">
        <p className="text-xs text-neutral-400">
          O parâmetro <code className="bg-neutral-100 px-1 rounded text-neutral-600">?ref={affiliateId}</code> garante o rastreio das tuas comissões.
        </p>
      </div>
    </div>
  )
}
