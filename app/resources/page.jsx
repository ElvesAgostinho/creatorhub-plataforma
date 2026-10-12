import { Video, TrendingUp, Workflow, BookOpen, MessageSquare, Users } from "lucide-react"
export default function ResourcesPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans">
      <main className="flex-1">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">Tudo o que precisas num só lugar</h1>
          <p className="text-xl text-neutral-400 max-w-3xl mx-auto">
            Mais do que ferramentas, oferecemos as estratégias certas. Descobre como a nossa plataforma transforma criadores comuns em empreendedores de sucesso com soluções automatizadas e suporte inteligente.
          </p>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 border-t border-neutral-800">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Como gravar o primeiro curso", desc: "Equipamento, iluminação, e truques para não teres vergonha da câmara.", Icon: Video },
              { title: "Funil de Vendas", desc: "Como usar as Recomendações Automáticas para triplicar o ticket médio.", Icon: TrendingUp },
              { title: "Integrações", desc: "Ligar a ABOVE ao Zapier e Mailchimp em menos de 5 minutos.", Icon: Workflow },
              { title: "E-books de Sucesso", desc: "Formatos e modelos de E-book que geram vendas todos os dias.", Icon: BookOpen },
              { title: "Mentorias 1:1", desc: "Como vender o teu tempo e conhecimento ao preço mais alto do mercado.", Icon: MessageSquare },
              { title: "Comunidade VIP", desc: "Acesso exclusivo aos grupos onde partilhamos os segredos de faturação.", Icon: Users }
            ].map(r => (
              <div key={r.title} className="bg-ink-800 border border-neutral-800 rounded-3xl p-8 hover:border-brand transition-colors">
                <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-brand-light">
                  <r.Icon size={19} strokeWidth={1.75} />
                </div>
                <h3 className="text-xl font-bold mb-3">{r.title}</h3>
                <p className="text-neutral-400 text-sm leading-relaxed mb-6">{r.desc}</p>
                <button className="text-brand font-bold text-sm hover:underline">Ler artigo →</button>
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  )
}
