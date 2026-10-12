import { Lock } from "lucide-react"

/**
 * Réplica fiel do checkout real (/checkout/[slug]): cartão branco, preço em Kz,
 * métodos de pagamento angolanos e o botão verde #059669 "Comprar agora".
 * É esta a prova visual de que a plataforma fala o mercado local.
 */
export default function CheckoutMock({ className = "" }) {
  return (
    <div className={`bg-white ${className}`}>
      <div className="p-4">
        {/* Produto */}
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand to-brand-dark text-[15px] font-black text-white">
            M
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[11px] font-bold text-ink-800">Marketing Digital na Prática</div>
            <div className="text-[9px] font-medium text-neutral-500">Produtor: Hélder Nascimento</div>
          </div>
          <div className="shrink-0 text-[14px] font-black text-ink-800">24 900 Kz</div>
        </div>

        <hr className="my-3.5 border-neutral-100" />

        {/* Dados pessoais */}
        <div className="text-[10px] font-bold text-ink-800">Dados Pessoais</div>
        <div className="mt-2 space-y-2">
          <Field label="O teu e-mail" value="joana.capita@mail.ao" />
          <Field label="Nome completo" value="Joana Capita" />
        </div>

        <hr className="my-3.5 border-neutral-100" />

        {/* Pagamento */}
        <div className="text-[10px] font-bold text-ink-800">Método de Pagamento</div>
        <div className="mt-2 flex items-center justify-between rounded-lg border border-neutral-300 px-2.5 py-2 text-[9px] font-semibold text-ink-800">
          Transferência / Multicaixa Express
          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>

        <div className="mt-2 rounded-lg border border-brand/20 bg-brand-soft p-2.5">
          <div className="text-[8px] font-bold text-ink-800">Dados para pagamento:</div>
          <div className="mt-1.5 rounded border border-brand/10 bg-white px-2 py-1.5 text-center font-mono text-[9px] font-bold tracking-wider text-ink-800 shadow-sm">
            AO06 0040 0000 1234 5678 9012 3
          </div>
          <div className="mt-1 text-center text-[8px] font-medium text-neutral-600">ABOVE Plataforma, Lda.</div>
        </div>
      </div>

      {/* Barra de ação */}
      <div className="flex items-center justify-between border-t border-neutral-200 bg-neutral-50 px-4 py-3">
        <div className="text-[14px] font-black text-ink-800">24 900 Kz</div>
        <div className="rounded-lg bg-pay px-5 py-2.5 text-[10px] font-bold text-white shadow-pay">
          Comprar agora
        </div>
      </div>

      <div className="flex items-center justify-center gap-1 py-2 text-[8px] font-medium text-neutral-400">
        <Lock size={8} />
        Pagamento 100% Seguro • ABOVE
      </div>
    </div>
  )
}

function Field({ label, value }) {
  return (
    <div>
      <div className="mb-1 text-[8px] font-bold text-neutral-600">{label}</div>
      <div className="rounded-md border border-neutral-300 px-2.5 py-1.5 text-[9px] font-medium text-ink-800">
        {value}
      </div>
    </div>
  )
}
