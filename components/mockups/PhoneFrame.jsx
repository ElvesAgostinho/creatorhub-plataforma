/**
 * iPhone moderno desenhado em CSS.
 *
 * O anterior era um rectângulo arredondado com uma pílula preta. Este tem a
 * proporção certa (19.5:9), a moldura em titânio com as duas linhas de brilho
 * que o metal faz contra a luz, a ilha dinâmica com a lente, os botões
 * laterais nos sítios certos e o reflexo diagonal do vidro.
 */
export default function PhoneFrame({ children, className = "" }) {
  return (
    <div className={`relative ${className}`}>
      {/* Botões laterais — esquerda: silêncio, ação, volume */}
      <span className="absolute -left-[2px] top-[13%] h-[3.2%] w-[2px] rounded-l-sm bg-gradient-to-b from-neutral-400 to-neutral-600" />
      <span className="absolute -left-[2px] top-[19%] h-[7%] w-[2px] rounded-l-sm bg-gradient-to-b from-neutral-400 to-neutral-600" />
      <span className="absolute -left-[2px] top-[28%] h-[7%] w-[2px] rounded-l-sm bg-gradient-to-b from-neutral-400 to-neutral-600" />
      {/* Direita: botão lateral */}
      <span className="absolute -right-[2px] top-[22%] h-[11%] w-[2px] rounded-r-sm bg-gradient-to-b from-neutral-400 to-neutral-600" />

      {/* Moldura em titânio */}
      <div
        className="relative rounded-[13%/6.2%] p-[2.6%] shadow-frame"
        style={{
          backgroundImage:
            "linear-gradient(145deg, #d8d9dd 0%, #8e9096 18%, #5d5f66 38%, #8a8c92 55%, #d5d6da 72%, #6e7076 88%, #46484e 100%)",
        }}
      >
        {/* Bisel preto entre o metal e o vidro */}
        <div className="relative overflow-hidden rounded-[11.4%/5.4%] bg-black p-[1.4%]">
          <div className="relative overflow-hidden rounded-[10.4%/4.9%] bg-white">

            {/* Ilha dinâmica */}
            <div className="absolute left-1/2 top-[1.6%] z-30 flex h-[3.4%] min-h-[18px] w-[30%] -translate-x-1/2 items-center justify-end rounded-full bg-black pr-[4%]">
              <span className="h-[42%] w-auto aspect-square rounded-full bg-[#1b1b22] ring-1 ring-white/10">
                <span className="block h-full w-full scale-[0.45] rounded-full bg-[#2b3a55]" />
              </span>
            </div>

            {/* Barra de estado */}
            <div className="relative z-20 flex items-center justify-between px-[7%] pb-[0.8%] pt-[1.9%] text-[9px] font-semibold text-ink-800">
              <span className="tabular-nums">9:41</span>
              <span className="flex items-center gap-[3px]">
                {/* Rede */}
                <span className="flex items-end gap-[1.5px]">
                  <span className="h-[4px] w-[2px] rounded-[1px] bg-ink-800" />
                  <span className="h-[6px] w-[2px] rounded-[1px] bg-ink-800" />
                  <span className="h-[8px] w-[2px] rounded-[1px] bg-ink-800" />
                  <span className="h-[10px] w-[2px] rounded-[1px] bg-ink-800" />
                </span>
                {/* Wi-Fi */}
                <svg viewBox="0 0 16 12" className="h-[9px] w-[11px] fill-ink-800" aria-hidden="true">
                  <path d="M8 10.6 6.1 8.5a2.9 2.9 0 0 1 3.8 0L8 10.6Z" />
                  <path d="M11.4 6.6a5.1 5.1 0 0 0-6.8 0L3.3 5.2a7 7 0 0 1 9.4 0l-1.3 1.4Z" />
                  <path d="M14 3.9a9 9 0 0 0-12 0L.7 2.5a10.9 10.9 0 0 1 14.6 0L14 3.9Z" />
                </svg>
                {/* Bateria */}
                <span className="ml-[1px] flex h-[10px] w-[18px] items-center rounded-[3px] border border-ink-800/45 p-[1.5px]">
                  <span className="h-full w-[72%] rounded-[1.5px] bg-ink-800" />
                </span>
                <span className="h-[4px] w-[1.5px] rounded-r-sm bg-ink-800/45" />
              </span>
            </div>

            {children}

            {/* Indicador inferior */}
            <div className="relative z-20 flex justify-center py-[1.6%]">
              <span className="h-[3px] w-[28%] rounded-full bg-ink-800/70" />
            </div>

            {/* Reflexo do vidro */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-40"
              style={{
                backgroundImage:
                  "linear-gradient(118deg, rgba(255,255,255,0) 40%, rgba(255,255,255,0.07) 47%, rgba(255,255,255,0) 56%)",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
