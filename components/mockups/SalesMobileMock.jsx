/**
 * Ecrã de vendas em mobile — o que o criador vê no telemóvel quando vende.
 * Sem verdes: os valores positivos e a marca de venda aprovada usam o dourado
 * contido da marca, que em fundo escuro se lê como receita e não como aplicação.
 */

const SALES = [
  { name: "Joana Capita", product: "Marketing Digital", value: "24 900", t: "2 min" },
  { name: "Edson Miguel", product: "Finanças Pessoais", value: "18 500", t: "26 min" },
  { name: "Luísa Fortes", product: "Mentoria de Vendas", value: "45 000", t: "1 h" },
]

export default function SalesMobileMock() {
  return (
    <div className="bg-white px-[6%] pb-[4%] pt-[3%]">
      {/* Receita */}
      <div className="rounded-2xl bg-ink-900 p-[7%] text-white">
        <div className="flex items-center justify-between">
          <span className="whitespace-nowrap text-[7px] font-semibold uppercase tracking-[0.12em] text-white/45">
            Receita este mês
          </span>
          <span className="rounded-full bg-accent/15 px-1.5 py-0.5 text-[7.5px] font-bold text-accent-light">
            +18,2%
          </span>
        </div>

        <div className="mt-1.5 flex items-baseline gap-1 whitespace-nowrap">
          <span className="text-[19px] font-black leading-none tracking-tight">1 284 500</span>
          <span className="text-[10px] font-bold text-white/55">Kz</span>
        </div>

        {/* Curva de receita */}
        <div className="mt-3 flex h-9 items-end gap-[3px]">
          {[20, 32, 26, 44, 38, 56, 50, 68, 62, 80, 74, 100].map((h, i) => (
            <div
              key={i}
              className={`flex-1 rounded-[2px] ${i === 11 ? "bg-accent" : "bg-white/12"}`}
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </div>

      {/* Venda aprovada */}
      <div className="mt-2.5 flex items-center gap-2.5 rounded-xl border border-accent/30 bg-accent-soft px-2.5 py-2">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-white">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </span>
        <div className="min-w-0">
          <div className="text-[9px] font-bold leading-none text-ink-800">Venda aprovada</div>
          <div className="mt-1 truncate text-[8px] font-medium text-neutral-500">
            24 900 Kz há instantes
          </div>
        </div>
      </div>

      {/* Últimas vendas */}
      <div className="mt-3 flex items-center justify-between">
        <span className="text-[9px] font-bold text-ink-800">Últimas vendas</span>
        <span className="text-[8px] font-semibold text-brand">Ver todas</span>
      </div>

      <div className="mt-1.5 space-y-1.5">
        {SALES.map((s) => (
          <div
            key={s.name}
            className="flex items-center gap-2 rounded-xl border border-neutral-200 px-2.5 py-2"
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-soft text-[9px] font-bold text-brand">
              {s.name.charAt(0)}
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[8.5px] font-semibold text-ink-800">{s.name}</div>
              <div className="truncate text-[7.5px] font-medium text-neutral-400">{s.product}</div>
            </div>
            <div className="shrink-0 text-right">
              <div className="whitespace-nowrap text-[8.5px] font-bold text-ink-800">{s.value} Kz</div>
              <div className="text-[7px] font-medium text-neutral-400">há {s.t}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
