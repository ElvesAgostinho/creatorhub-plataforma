import BrowserFrame from "./BrowserFrame"
import PhoneFrame from "./PhoneFrame"
import AnalyticsMock from "./AnalyticsMock"
import SalesMobileMock from "./SalesMobileMock"

/**
 * Composição do herói: o painel do criador em desktop com o ecrã de vendas em
 * mobile à frente. Substitui a fotografia de banco de imagens — aqui o herói
 * da página é o próprio produto.
 */
export default function HeroComposition({ className = "" }) {
  return (
    <div className={`relative ${className}`}>
      {/* Halo da marca por trás das molduras */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-x-10 -inset-y-12 -z-10 rounded-full bg-brand/10 blur-3xl"
      />

      <BrowserFrame url="above.ao/admin/analytics" className="animate-fade-up">
        <AnalyticsMock />
      </BrowserFrame>

      {/* Telemóvel sobreposto */}
      <PhoneFrame className="absolute -bottom-10 -left-6 w-[34%] max-w-[190px] animate-float-slow sm:-left-10 sm:-bottom-12">
        <SalesMobileMock />
      </PhoneFrame>

      {/* Etiqueta flutuante de venda aprovada */}
      <div className="absolute -right-3 top-8 hidden items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2 shadow-float sm:flex lg:-right-6">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-pay/10 text-pay">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </span>
        <span className="leading-tight">
          <span className="block text-[10px] font-bold text-neutral-500">Venda aprovada</span>
          <span className="block text-[13px] font-black text-ink-800">+24 900 Kz</span>
        </span>
      </div>
    </div>
  )
}
