import { Headphones, CheckCheck } from "lucide-react"

/**
 * Visual da página de apoio: uma conversa real com a equipa, em vez de uma
 * fotografia de um operador de call center de banco de imagens.
 */
export default function SupportComposition({ className = "" }) {
  return (
    <div className={`relative ${className}`}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-8 -z-10 rounded-full bg-brand/10 blur-3xl"
      />

      <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-float">
        {/* Cabeçalho da conversa */}
        <div className="flex items-center gap-3 border-b border-neutral-200 bg-surface-50 px-5 py-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-white">
            <Headphones size={18} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-extrabold text-ink-800">Apoio ABOVE</div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-neutral-500">
              <span className="h-1.5 w-1.5 rounded-full bg-pay" />
              Online agora · responde em ~2 h
            </div>
          </div>
        </div>

        {/* Mensagens */}
        <div className="space-y-3 bg-white p-5">
          <Bubble side="left" time="09:12">
            Olá! Vendi o meu primeiro curso ontem. Quando recebo o dinheiro na minha conta?
          </Bubble>

          <Bubble side="right" time="09:14" read>
            Parabéns pela venda! O levantamento é processado para o teu banco em Angola. Já te deixei o pedido
            pré-preenchido no painel de finanças.
          </Bubble>

          <Bubble side="left" time="09:15">
            Perfeito, obrigado pela rapidez.
          </Bubble>
        </div>

        {/* Caixa de escrita */}
        <div className="flex items-center gap-2 border-t border-neutral-200 bg-surface-50 px-5 py-4">
          <span className="flex-1 rounded-full border border-neutral-200 bg-white px-4 py-2.5 text-xs font-medium text-neutral-400">
            Escreve a tua mensagem…
          </span>
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-white shadow-brand">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z" />
            </svg>
          </span>
        </div>
      </div>

      {/* Indicador flutuante */}
      <div className="absolute -bottom-5 -left-4 flex items-center gap-2.5 rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 shadow-float sm:-left-8">
        <span className="text-xl font-black text-brand">2h</span>
        <span className="text-[11px] font-bold leading-tight text-neutral-500">
          Tempo médio
          <br />
          de resposta
        </span>
      </div>
    </div>
  )
}

function Bubble({ side, time, read = false, children }) {
  const right = side === "right"
  return (
    <div className={`flex ${right ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs font-medium leading-relaxed ${
          right
            ? "rounded-br-sm bg-brand text-white"
            : "rounded-bl-sm bg-neutral-100 text-ink-800"
        }`}
      >
        {children}
        <span
          className={`mt-1 flex items-center justify-end gap-1 text-[9px] font-bold ${
            right ? "text-white/70" : "text-neutral-400"
          }`}
        >
          {time}
          {read && <CheckCheck size={10} />}
        </span>
      </div>
    </div>
  )
}
