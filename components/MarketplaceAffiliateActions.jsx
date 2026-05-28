"use client"

import { useState } from "react"
import { Copy, Check, ArrowRight, BadgeCheck, Clock, ExternalLink, Loader2 } from "lucide-react"

export default function MarketplaceAffiliateActions({
  isLoggedIn,
  affiliateStatus,
  affiliateLink,
  productSlug,
  productTitle
}) {
  const [copied, setCopied] = useState(false)

  const copy = () => {
    if (!affiliateLink) return
    navigator.clipboard.writeText(affiliateLink).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }

  // ── ALREADY APPROVED AFFILIATE ──
  if (affiliateStatus === "approved" && affiliateLink) {
    return (
      <div className="p-4 space-y-3">
        {/* Quick copy panel */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-3">
          <p className="text-xs font-bold text-green-700 mb-2 flex items-center gap-1">
            <BadgeCheck size={13} />
            Já és afiliado! O teu link está pronto.
          </p>
          <div className="flex gap-1.5">
            <input
              type="text"
              readOnly
              value={affiliateLink}
              className="flex-1 min-w-0 bg-white border border-green-200 rounded-lg py-2 px-2.5 text-xs font-mono text-neutral-600 focus:outline-none truncate"
            />
            <button
              onClick={copy}
              className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all shrink-0 ${
                copied
                  ? "bg-green-500 text-white"
                  : "bg-[#FF4500] hover:bg-[#E03E00] text-white"
              }`}
              title="Copiar link"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </div>
          {copied && (
            <p className="text-[11px] text-green-600 font-bold mt-1.5 text-center animate-pulse">
              ✓ Link copiado para a área de transferência!
            </p>
          )}
        </div>

        <a
          href={`/affiliate-panel/product/${productSlug}`}
          className="flex items-center justify-center gap-2 w-full bg-neutral-900 hover:bg-neutral-800 text-white font-bold py-3 rounded-xl transition-all text-sm"
        >
          Ver todos os links e materiais
          <ArrowRight size={15} />
        </a>

        <a
          href={affiliateLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 text-neutral-700 font-semibold py-2.5 rounded-xl transition-all text-sm"
        >
          Testar link <ExternalLink size={13} />
        </a>
      </div>
    )
  }

  // ── PENDING AFFILIATE ──
  if (affiliateStatus === "pending") {
    return (
      <div className="p-4 space-y-3">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
          <Clock size={24} className="text-amber-500 mx-auto mb-2" />
          <p className="text-sm font-bold text-amber-800">Candidatura em análise</p>
          <p className="text-xs text-amber-600 mt-1 leading-relaxed">
            A tua candidatura ao programa de afiliados está a ser analisada. Receberás uma notificação por email em breve.
          </p>
        </div>
        <a
          href="/affiliate-panel"
          className="flex items-center justify-center gap-2 w-full bg-neutral-900 hover:bg-neutral-800 text-white font-bold py-3 rounded-xl transition-all text-sm"
        >
          Ver o meu painel
          <ArrowRight size={15} />
        </a>
      </div>
    )
  }

  // ── NOT AN AFFILIATE YET ──
  if (isLoggedIn) {
    return (
      <div className="p-4 space-y-3">
        <div className="bg-[#FFF8F6] border border-[#FF4500]/20 rounded-xl p-3 text-center">
          <p className="text-xs text-neutral-600 leading-relaxed">
            Candidata-te ao programa de afiliados para começares a promover este produto e ganhar comissões.
          </p>
        </div>
        <a
          href="/affiliates"
          className="group flex items-center justify-center gap-2 w-full bg-[#FF4500] hover:bg-[#E03E00] text-white font-black py-3.5 rounded-xl transition-all text-sm shadow-lg shadow-[#FF4500]/20 hover:shadow-[#FF4500]/30 hover:-translate-y-0.5"
        >
          Promover este produto
          <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
        </a>
        <a
          href={`/product/${productSlug}`}
          target="_blank"
          className="flex items-center justify-center gap-2 w-full border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 text-neutral-700 font-semibold py-2.5 rounded-xl transition-all text-sm"
        >
          Ver página de vendas <ExternalLink size={13} />
        </a>
      </div>
    )
  }

  // ── NOT LOGGED IN ──
  return (
    <div className="p-4 space-y-3">
      <div className="bg-[#FFF8F6] border border-[#FF4500]/20 rounded-xl p-3 text-center">
        <p className="text-xs text-neutral-600 leading-relaxed">
          Inicia sessão para te candidatares ao programa de afiliados e começares a ganhar comissões.
        </p>
      </div>
      <a
        href={`/login?next=/marketplace/product/${productSlug}`}
        className="group flex items-center justify-center gap-2 w-full bg-[#FF4500] hover:bg-[#E03E00] text-white font-black py-3.5 rounded-xl transition-all text-sm shadow-lg shadow-[#FF4500]/20 hover:shadow-[#FF4500]/30 hover:-translate-y-0.5"
      >
        Iniciar Sessão para Promover
        <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
      </a>
      <a
        href="/signup"
        className="flex items-center justify-center gap-2 w-full border border-neutral-200 hover:border-[#FF4500]/30 text-neutral-700 hover:text-[#FF4500] font-semibold py-2.5 rounded-xl transition-all text-sm"
      >
        Criar conta gratuita
      </a>
    </div>
  )
}
