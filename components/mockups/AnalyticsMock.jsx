/**
 * Réplica fiel do painel real em /admin/analytics:
 * fundo #F8F7F5, cartões brancos, barras laranja da marca, valores em Kwanzas
 * e meses em português. Em vez de uma imagem gerada, é a interface verdadeira.
 */

const STATS = [
  { label: "Receita Total", value: "1 284 500 Kz", trend: "+18,2%" },
  { label: "Vendas Totais", value: "312", trend: "+9,5%" },
  { label: "Taxa de Reembolso", value: "1,4%", trend: "-0,6%", down: true },
  { label: "Compras Ativas", value: "298", trend: "+24,1%" },
]

const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]
const HEIGHTS = [18, 26, 22, 38, 34, 47, 55, 49, 68, 74, 86, 100]

const TOP_PRODUCTS = [
  { title: "Marketing Digital na Prática", sales: 86 },
  { title: "Finanças Pessoais em Angola", sales: 64 },
  { title: "Mentoria de Vendas 1:1", sales: 41 },
]

export default function AnalyticsMock({ compact = false }) {
  return (
    <div className={`bg-surface-100 ${compact ? "p-4" : "p-5 sm:p-6"}`}>
      {/* Cabeçalho */}
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h3 className="text-[13px] font-extrabold leading-none text-ink-800">Análises de Vendas</h3>
          {!compact && (
            <p className="mt-1.5 text-[10px] font-medium text-neutral-500">
              Acompanha a performance do teu negócio digital.
            </p>
          )}
        </div>
        <div className="flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-2.5 py-1.5 text-[9px] font-bold text-neutral-600">
          Últimos 12 meses
          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
      </div>

      {/* Cartões de métricas */}
      <div className={`grid gap-2.5 ${compact ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-4"}`}>
        {STATS.map((s) => (
          <div key={s.label} className="rounded-xl border border-neutral-200 bg-white p-3 shadow-sm">
            <div className="text-[9px] font-bold uppercase tracking-wide text-neutral-500">{s.label}</div>
            <div className="mt-1.5 truncate text-[15px] font-extrabold leading-none text-ink-800">{s.value}</div>
            <div
              className={`mt-1.5 inline-flex items-center gap-0.5 text-[9px] font-bold ${
                s.down ? "text-pay" : "text-pay"
              }`}
            >
              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5">
                {s.down ? <path d="m6 9 6 6 6-6" /> : <path d="m6 15 6-6 6 6" />}
              </svg>
              {s.trend}
            </div>
          </div>
        ))}
      </div>

      {/* Gráfico + top produtos */}
      <div className={`mt-2.5 grid gap-2.5 ${compact ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-3"}`}>
        <div className={`rounded-xl border border-neutral-200 bg-white p-4 ${compact ? "" : "lg:col-span-2"}`}>
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-[11px] font-extrabold text-ink-800">Receita gerada</h4>
            <span className="rounded-md bg-brand-soft px-2 py-0.5 text-[9px] font-bold text-brand">AOA</span>
          </div>

          <div className="flex h-24 items-end gap-1.5">
            {HEIGHTS.map((h, i) => (
              <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
                {/* h-full explicito no contentor: sem isso a altura em % resolvia para zero */}
                <div
                  className={`w-full origin-bottom animate-grow-bar rounded-t-[3px] ${
                    i === HEIGHTS.length - 1 ? "bg-brand" : "bg-brand/30"
                  }`}
                  style={{ height: `${h}%`, animationDelay: `${i * 55}ms` }}
                />
                <span className="shrink-0 text-[7px] font-bold text-neutral-400">{MONTHS[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {!compact && (
          <div className="rounded-xl border border-neutral-200 bg-white p-4">
            <h4 className="mb-3 text-[11px] font-extrabold text-ink-800">Produtos mais vendidos</h4>
            <div className="space-y-2.5">
              {TOP_PRODUCTS.map((p, i) => (
                <div key={p.title} className="flex items-center gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-brand-soft text-[9px] font-black text-brand">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[10px] font-bold text-ink-800">{p.title}</div>
                    <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-neutral-100">
                      <div
                        className="h-full rounded-full bg-brand"
                        style={{ width: `${(p.sales / TOP_PRODUCTS[0].sales) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="shrink-0 text-[9px] font-bold text-neutral-500">{p.sales}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
