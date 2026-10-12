/**
 * Moldura de telemóvel desenhada em CSS, para mostrar a plataforma em mobile
 * ao lado da versão desktop. Sem imagens: apenas bordas, sombras e o conteúdo real.
 */
export default function PhoneFrame({ children, className = "" }) {
  return (
    <div
      className={`relative rounded-[2rem] bg-ink-900 p-[6px] shadow-frame ring-1 ring-white/10 ${className}`}
    >
      <div className="relative overflow-hidden rounded-[1.65rem] bg-white">
        {/* Ilha dinâmica */}
        <div className="absolute left-1/2 top-2 z-20 h-[18px] w-[72px] -translate-x-1/2 rounded-full bg-ink-900" />

        {/* Barra de estado */}
        <div className="flex items-center justify-between px-5 pb-1 pt-2.5 text-[9px] font-bold text-ink-800">
          <span>9:41</span>
          <span className="flex items-center gap-1">
            <span className="flex items-end gap-[1.5px]">
              <span className="h-[4px] w-[2px] rounded-sm bg-ink-800" />
              <span className="h-[6px] w-[2px] rounded-sm bg-ink-800" />
              <span className="h-[8px] w-[2px] rounded-sm bg-ink-800" />
              <span className="h-[10px] w-[2px] rounded-sm bg-ink-800" />
            </span>
            <span className="ml-0.5 flex h-[9px] w-[16px] items-center rounded-[3px] border border-ink-800/60 p-[1.5px]">
              <span className="h-full w-[70%] rounded-[1px] bg-ink-800" />
            </span>
          </span>
        </div>

        {children}
      </div>
    </div>
  )
}
