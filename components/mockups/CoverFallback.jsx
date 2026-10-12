import { GraduationCap, BookOpen, Users, CalendarDays } from "lucide-react"

/**
 * Capa de substituição para produtos sem imagem.
 * Em vez do texto "Sem capa" num rectângulo cinzento, desenha uma capa com a
 * cor do tipo de produto, a inicial do título e uma textura discreta — assim
 * um catálogo incompleto continua a parecer intencional.
 */

const TONES = {
  course: { from: "#FF6A2B", to: "#C62F00", label: "Curso", Icon: GraduationCap },
  book: { from: "#12B981", to: "#047857", label: "Livro", Icon: BookOpen },
  mentorship: { from: "#8B5CF6", to: "#5B21B6", label: "Mentoria", Icon: Users },
  event: { from: "#38BDF8", to: "#0369A1", label: "Evento", Icon: CalendarDays },
}

export default function CoverFallback({ title = "", type = "course", className = "" }) {
  const tone = TONES[type] || TONES.course
  const { Icon } = tone

  // Pequena variação de ângulo por título, para duas capas seguidas não serem iguais
  const seed = [...String(title)].reduce((a, c) => a + c.charCodeAt(0), 0)
  const angle = 115 + (seed % 7) * 10
  const initial = (String(title).trim().charAt(0) || "A").toUpperCase()

  return (
    <div
      className={`absolute inset-0 flex items-center justify-center overflow-hidden ${className}`}
      style={{ backgroundImage: `linear-gradient(${angle}deg, ${tone.from}, ${tone.to})` }}
    >
      {/* Textura de grelha */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      {/* Brilho de canto */}
      <div
        aria-hidden="true"
        className="absolute -right-8 -top-10 h-32 w-32 rounded-full bg-white/25 blur-2xl"
      />

      <span className="relative select-none text-5xl font-black leading-none text-white/90 drop-shadow-sm sm:text-6xl">
        {initial}
      </span>

      <span className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-md bg-black/25 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
        <Icon size={11} />
        {tone.label}
      </span>
    </div>
  )
}
