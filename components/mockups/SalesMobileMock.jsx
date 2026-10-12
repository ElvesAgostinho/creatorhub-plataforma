/**
 * Ecrã de vendas em mobile — o que o criador vê no telemóvel quando vende.
 * Vai dentro do PhoneFrame, ao lado do painel desktop no herói da landing.
 */

const SALES = [
  { name: "Joana Capita", product: "Marketing Digital na Prática", value: "24 900 Kz", t: "há 2 min" },
  { name: "Edson Miguel", product: "Finanças Pessoais em Angola", value: "18 500 Kz", t: "há 26 min" },
  { name: "Luísa Fortes", product: "Mentoria de Vendas 1:1", value: "45 000 Kz", t: "há 1 h" },
]

export default function SalesMobileMock() {
  return (
    <div className="bg-surface-100 px-3 pb-4 pt-2">
      {/* Saldo */}
      <div className="rounded-2xl bg-ink-800 p-3.5 text-white">
        <div className="text-[8px] font-bold uppercase tracking-widest text-neutral-400">
          Receita este mês
        </div>
        <div className="mt-1 whitespace-nowrap text-[17px] font-black leading-none">1 284 500 Kz</div>
        <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-pay/15 px-2 py-0.5 text-[8px] font-bold text-pay">
          <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
            <path d="m6 15 6-6 6 6" />
          </svg>
          +18,2% vs. mês anterior
        </div>

        {/* Mini-gráfico */}
        <div className="mt-3 flex h-8 items-end gap-[3px]">
          {[22, 34, 28, 46, 40, 58, 52, 70, 64, 82, 76, 100].map((h, i) => (
            <div
              key={i}
              className={`flex-1 rounded-[2px] ${i === 11 ? "bg-brand" : "bg-white/15"}`}
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </div>

      {/* Notificação de venda */}
      <div className="mt-2.5 flex items-center gap-2 rounded-xl border border-pay/25 bg-pay/10 px-2.5 py-2">
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-pay text-white">
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </span>
        <div className="min-w-0">
          <div className="text-[9px] font-black leading-none text-ink-800">Venda aprovada!</div>
          <div className="mt-0.5 truncate text-[8px] font-medium text-neutral-600">
            Recebeste 24 900 Kz agora mesmo
          </div>
        </div>
      </div>

      {/* Últimas vendas */}
      <div className="mt-2.5 text-[9px] font-extrabold text-ink-800">Últimas vendas</div>
      <div className="mt-1.5 space-y-1.5">
        {SALES.map((s) => (
          <div
            key={s.name}
            className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-2.5 py-2"
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-soft text-[9px] font-black text-brand">
              {s.name.charAt(0)}
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[8.5px] font-bold text-ink-800">{s.name}</div>
              <div className="truncate text-[7.5px] font-medium text-neutral-500">{s.product}</div>
            </div>
            <div className="shrink-0 text-right">
              <div className="text-[8.5px] font-black text-ink-800">{s.value}</div>
              <div className="text-[7px] font-medium text-neutral-400">{s.t}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
