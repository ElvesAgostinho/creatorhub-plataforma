import BrowserFrame from "./BrowserFrame"
import PhoneFrame from "./PhoneFrame"
import AnalyticsMock from "./AnalyticsMock"
import SalesMobileMock from "./SalesMobileMock"

/**
 * Composição do herói: o painel do criador em desktop com o iPhone à frente.
 * Sobre fundo escuro, as duas peças claras ficam a flutuar — é o momento em que
 * se percebe, sem ler uma linha, o que a plataforma faz.
 */
export default function HeroComposition({ className = "" }) {
  return (
    <div className={`relative w-full min-w-0 ${className}`}>
      {/* Halo */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-x-16 -inset-y-16 -z-10 rounded-full bg-brand/25 blur-[90px]"
      />

      {/* Painel desktop, ligeiramente recuado */}
      <div className="ml-auto w-[88%] sm:w-[92%]">
        <BrowserFrame url="above.ao/admin/analytics" className="animate-fade-up ring-1 ring-white/10">
          <AnalyticsMock />
        </BrowserFrame>
      </div>

      {/* iPhone à frente, em baixo à esquerda */}
      <PhoneFrame className="absolute -bottom-4 left-0 w-[31%] min-w-[104px] max-w-[168px] animate-float-slow">
        <SalesMobileMock />
      </PhoneFrame>

      {/* Etiqueta de venda */}
      <div className="absolute bottom-28 left-[40%] hidden items-center gap-2.5 rounded-xl border border-white/10 bg-ink-800/95 px-3.5 py-2.5 shadow-float backdrop-blur sm:flex">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/15 text-accent-light">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </span>
        <span className="leading-tight">
          <span className="block text-[10px] font-medium text-white/50">Venda aprovada</span>
          <span className="block whitespace-nowrap text-[13px] font-bold text-white">+24 900 Kz</span>
        </span>
      </div>
    </div>
  )
}
