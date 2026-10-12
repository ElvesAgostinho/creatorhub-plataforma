import { ArrowLeft, CheckCircle2, PlayCircle, Circle, Play } from "lucide-react"

/**
 * Réplica fiel da área de membros real (components/CoursePlayer):
 * barra lateral branca de 320px com os módulos, barra de progresso na cor da
 * academia, área de vídeo sobre #EEF2F6 e separadores Visão geral / Materiais / Dúvidas.
 */

const MODULES = [
  {
    title: "Fundamentos",
    position: 1,
    done: 3,
    lessons: [
      { title: "Boas-vindas ao curso", state: "done", min: "4m" },
      { title: "Como definir o teu nicho", state: "done", min: "12m" },
      { title: "Ferramentas essenciais", state: "done", min: "9m" },
    ],
  },
  {
    title: "Tráfego e conversão",
    position: 2,
    done: 1,
    lessons: [
      { title: "Anatomia de um anúncio que vende", state: "active", min: "18m" },
      { title: "Segmentação em mercados locais", state: "todo", min: "15m" },
      { title: "Métricas que importam", state: "todo", min: "11m" },
    ],
  },
]

export default function MembersAreaMock({ className = "" }) {
  return (
    <div className={`flex bg-surface-200 ${className}`}>
      {/* Barra lateral */}
      <aside className="hidden w-[38%] max-w-[190px] shrink-0 flex-col border-r border-neutral-200 bg-white sm:flex">
        <div className="flex h-8 items-center gap-1.5 border-b border-neutral-200 px-3 text-[9px] font-bold text-neutral-500">
          <ArrowLeft size={9} />
          Voltar
        </div>

        <div className="border-b border-neutral-100 bg-surface-50 px-3 py-3">
          <div className="text-[10px] font-black leading-tight text-ink-800">
            Marketing Digital na Prática
          </div>
          <div className="mt-2 flex items-center justify-between text-[8px] font-bold text-neutral-500">
            <span>O teu progresso</span>
            <span className="text-brand">67%</span>
          </div>
          <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-neutral-200">
            <div className="h-full rounded-full bg-brand" style={{ width: "67%" }} />
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          {MODULES.map((mod) => (
            <div key={mod.position} className="border-b border-neutral-100">
              <div className="flex items-start justify-between px-3 py-2.5">
                <div className="min-w-0 pr-2">
                  <div className="text-[9px] font-bold text-ink-800">Módulo {mod.position}</div>
                  <div className="truncate text-[8px] font-medium text-neutral-500">{mod.title}</div>
                </div>
                <span className="shrink-0 rounded bg-neutral-100 px-1.5 py-0.5 text-[7px] font-bold text-neutral-400">
                  {mod.done}/{mod.lessons.length}
                </span>
              </div>

              <div className="border-t border-neutral-100 bg-surface-50">
                {mod.lessons.map((l) => (
                  <div
                    key={l.title}
                    className={`flex items-center gap-2 px-3 py-2 ${l.state === "active" ? "bg-white" : ""}`}
                  >
                    {l.state === "done" ? (
                      <CheckCircle2 size={10} className="shrink-0 text-pay" />
                    ) : l.state === "active" ? (
                      <PlayCircle size={10} className="shrink-0 text-brand" />
                    ) : (
                      <Circle size={10} className="shrink-0 text-neutral-300" />
                    )}
                    <span
                      className={`min-w-0 flex-1 truncate text-[8px] font-medium ${
                        l.state === "active" ? "text-ink-800" : "text-neutral-600"
                      }`}
                    >
                      {l.title}
                    </span>
                    <span className="shrink-0 text-[7px] font-bold text-neutral-400">{l.min}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Área do vídeo */}
      <div className="min-w-0 flex-1 p-3">
        <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-lg bg-ink-900">
          {/* Brilho de fundo em vez de fotografia */}
          <div className="absolute -left-10 -top-10 h-32 w-32 rounded-full bg-brand/30 blur-3xl" />
          <div className="absolute -bottom-12 -right-6 h-32 w-32 rounded-full bg-brand/15 blur-3xl" />

          <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white/95 shadow-lg">
            <Play size={13} className="ml-0.5 fill-ink-800 text-ink-800" />
          </div>

          {/* Controlos */}
          <div className="absolute inset-x-2.5 bottom-2.5">
            <div className="h-0.5 w-full overflow-hidden rounded-full bg-white/25">
              <div className="h-full rounded-full bg-brand" style={{ width: "42%" }} />
            </div>
            <div className="mt-1.5 flex items-center justify-between text-[7px] font-bold text-white/70">
              <span>07:34</span>
              <span>18:02</span>
            </div>
          </div>
        </div>

        <div className="mt-2.5 text-[10px] font-extrabold text-ink-800">
          Anatomia de um anúncio que vende
        </div>

        <div className="mt-2 flex gap-3 border-b border-neutral-200 text-[8px] font-bold">
          <span className="border-b-2 border-brand pb-1.5 text-ink-800">Visão geral</span>
          <span className="pb-1.5 text-neutral-400">Materiais</span>
          <span className="pb-1.5 text-neutral-400">Dúvidas</span>
        </div>

        <div className="mt-2 space-y-1">
          <div className="h-1 w-full rounded-full bg-neutral-200/80" />
          <div className="h-1 w-[88%] rounded-full bg-neutral-200/80" />
          <div className="h-1 w-[62%] rounded-full bg-neutral-200/80" />
        </div>
      </div>
    </div>
  )
}
