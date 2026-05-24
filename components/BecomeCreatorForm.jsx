"use client"

import { useState } from "react"
import { submitApplication } from "@/app/become-creator/actions"
import Uploader from "@/components/Uploader"

export default function BecomeCreatorForm({ userEmail, fee }) {
  const [proofUrl, setProofUrl] = useState("")

  return (
    <form action={submitApplication} className="bg-white border border-neutral-200 p-6 rounded-2xl shadow-sm space-y-5">
      <div>
        <label className="text-sm font-medium">Conta atual</label>
        <div className="mt-1 text-sm text-neutral-500 bg-neutral-50 p-2 rounded border border-neutral-100">
          {userEmail}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Biografia / Motivação</label>
        <p className="text-xs text-neutral-500 mb-1">Qual é a tua área de especialidade e o que pretendes ensinar?</p>
        <textarea
          name="bio"
          required
          rows={4}
          className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0E7C86]"
          placeholder="Tenho 5 anos de experiência em X..."
        />
      </div>

      <div>
        <label className="text-sm font-medium">LinkedIn / Portefólio (Opcional)</label>
        <input
          type="url"
          name="portfolio_url"
          className="mt-1 w-full border border-neutral-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0E7C86]"
          placeholder="https://linkedin.com/in/..."
        />
      </div>

      {fee > 0 && (
        <div className="pt-2 border-t border-neutral-100">
          <label className="text-sm font-medium block mb-2">Comprovativo de Transferência</label>
          <p className="text-xs text-neutral-500 mb-3">Faz upload do recibo de pagamento da taxa de adesão para avaliarmos a tua candidatura.</p>
          <input type="hidden" name="require_proof" value="1" />
          <Uploader 
            bucket="images" 
            accept="image/jpeg,image/png,image/webp,application/pdf" 
            label="Anexar Comprovativo (Imagem ou PDF)"
            onSuccess={(url) => setProofUrl(url)}
          />
          <input type="hidden" name="payment_proof_url" value={proofUrl} />
          {proofUrl && <div className="mt-2 text-xs text-green-600 font-bold">✓ Comprovativo anexado</div>}
        </div>
      )}

      <button type="submit" className="w-full bg-[#0E7C86] hover:bg-[#0a626a] text-white font-bold py-3 rounded-md text-lg mt-4">
        Enviar Candidatura
      </button>
    </form>
  )
}
