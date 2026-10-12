export const metadata = {
  title: "Avisos Legais — ABOVE",
  description: "Termos e Políticas da plataforma ABOVE.",
}

export default function LegalLayout({ children }) {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-20 md:py-32">
        <div className="prose prose-neutral prose-a:text-brand hover:prose-a:text-brand-dark max-w-none">
          {children}
        </div>
      </div>
    </div>
  )
}
