import HeroComposition from "@/components/mockups/HeroComposition"
import BrowserFrame from "@/components/mockups/BrowserFrame"
import CheckoutMock from "@/components/mockups/CheckoutMock"
import MembersAreaMock from "@/components/mockups/MembersAreaMock"
import AnalyticsMock from "@/components/mockups/AnalyticsMock"
import CertificateMock from "@/components/mockups/CertificateMock"

export default function LandingPage({ user }) {
  return (
    <div className="min-h-screen bg-ink-800 font-sans text-white">

      {/* 1. HERO */}
      <section className="relative overflow-hidden bg-ink-900">
        {/* Luz de marca por trás da composição */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(60% 70% at 72% 18%, rgba(79,70,229,0.38), transparent 62%), radial-gradient(45% 55% at 8% 88%, rgba(79,70,229,0.16), transparent 70%)",
          }}
        />
        <div aria-hidden="true" className="bg-grid pointer-events-none absolute inset-0 opacity-50" />
        {/* Esbatimento para a secção seguinte */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-ink-900" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 pb-24 pt-16 lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:pb-28 lg:pt-20">

          {/* Texto */}
          <div className="min-w-0">
            <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">
              Infoprodutos · Pagamentos · Área de membros
            </p>

            <h1 className="max-w-measure text-display-xl text-white">
              O teu conhecimento,
              <br />
              <span className="text-brand-light">transformado num negócio.</span>
            </h1>

            <p className="mt-6 max-w-prose text-lead text-neutral-300">
              Cria, vende e entrega cursos, livros digitais e mentorias num só lugar. Checkout com os
              métodos de pagamento que o teu público já usa, área de membros premium e certificados
              automáticos.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <a
                href={user ? "/dashboard" : "/signup"}
                className="rounded-lg bg-brand px-7 py-3.5 text-[15px] font-semibold text-white shadow-brand transition hover:bg-brand-dark"
              >
                {user ? "Aceder ao painel" : "Começar a vender"}
              </a>
              <a
                href="/marketplace"
                className="rounded-lg border border-white/15 px-7 py-3.5 text-[15px] font-semibold text-white transition hover:border-white/30 hover:bg-white/5"
              >
                Ver o marketplace
              </a>
            </div>

            {/* Compromissos, sem ícones decorativos */}
            <dl className="mt-12 grid max-w-lg grid-cols-3 gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10">
              {[
                { k: "Comissão", v: "Sem taxas ocultas" },
                { k: "Entrega", v: "Imediata e segura" },
                { k: "Arranque", v: "Em minutos" },
              ].map((item) => (
                <div key={item.k} className="bg-ink-900/80 px-4 py-3.5">
                  <dt className="text-[10px] font-semibold uppercase tracking-wider text-white/40">{item.k}</dt>
                  <dd className="mt-1 text-[13px] font-semibold text-white">{item.v}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2">
              <span className="text-[11px] font-medium text-white/35">Pagamentos aceites</span>
              {["Multicaixa Express", "Unitel Money", "Africell Money", "Transferência"].map((m) => (
                <span
                  key={m}
                  className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-white/70"
                >
                  {m}
                </span>
              ))}
            </div>
          </div>

          {/* O produto como herói */}
          <HeroComposition className="mt-4 lg:mt-0" />
        </div>
      </section>

      {/* 2. COMO FUNCIONA */}
      <section className="border-b border-neutral-200 bg-surface-50 px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-display-lg text-ink-800">Como funciona a ABOVE?</h2>
            <p className="mx-auto max-w-2xl text-lg text-neutral-500">
              Tudo o que precisas para transformar o teu conhecimento num negócio altamente rentável em apenas 3 passos.
            </p>
          </div>

          <div className="grid gap-10 md:grid-cols-3">
            {[
              {
                n: 1,
                title: "Cria o teu produto",
                desc: "Faz o upload das tuas aulas em vídeo, e-book em PDF ou define a tua mentoria em poucos minutos.",
              },
              {
                n: 2,
                title: "Vende com facilidade",
                desc: "Usa o nosso checkout de alta conversão. Aceitamos pagamentos locais e internacionais automaticamente.",
              },
              {
                n: 3,
                title: "Entrega premium",
                desc: "Os teus alunos acedem a uma área de membros de classe mundial com gamificação e certificados profissionais.",
              },
            ].map((s) => (
              <div
                key={s.n}
                className="relative rounded-3xl border border-neutral-200 bg-white p-8 text-center shadow-card transition-transform duration-300 hover:-translate-y-2"
              >
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-soft">
                  <span className="text-2xl font-black text-brand">{s.n}</span>
                </div>
                <h3 className="mb-3 text-xl font-bold text-ink-800">{s.title}</h3>
                <p className="text-sm leading-relaxed text-neutral-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. CHECKOUT (ESCURO) */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="grid gap-6 md:grid-cols-2">

          <div className="relative flex min-h-[400px] flex-col justify-end overflow-hidden rounded-3xl border border-neutral-800 bg-ink-700 p-10">
            <div aria-hidden="true" className="bg-grid pointer-events-none absolute inset-0 opacity-60" />
            <div className="relative">
              <h2 className="mb-4 text-display-md">
                Tu focas-te no conteúdo.
                <br />
                Nós aumentamos as tuas conversões.
              </h2>
              <a
                href={user ? "/become-creator" : "/signup"}
                className="inline-block rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark"
              >
                {user ? "Tornar-se Criador" : "Começar a vender mais"}
              </a>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-neutral-800 bg-ink-700 p-10 pb-0">
            <h3 className="relative z-10 mb-4 text-display-md">
              Aumenta vendas com
              <br />
              preenchimento inteligente
            </h3>
            <p className="relative z-10 max-w-sm text-neutral-400">
              Os teus clientes compram em segundos com um checkout pensado para Angola: Multicaixa Express, Unitel Money
              e Africell Money, sem sair da página.
            </p>

            {/* O checkout verdadeiro, em CSS */}
            <div className="relative z-10 mx-auto mt-8 w-[78%] max-w-[300px] translate-y-6">
              <BrowserFrame url="above.ao/checkout/marketing-digital">
                <CheckoutMock />
              </BrowserFrame>
            </div>
          </div>

        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="flex flex-col rounded-3xl border border-neutral-800 bg-ink-700 p-8">
            <h3 className="mb-4 text-display-sm">
              Nós recomendamos.
              <br />
              Tu vendes mais.
            </h3>
            <p className="text-sm text-neutral-400">
              Recomendações automáticas: quando um cliente compra, sugerimos logo o próximo produto. Aumenta o valor
              médio de encomenda, em piloto automático.
            </p>
          </div>

          <div className="flex flex-col rounded-3xl border border-neutral-800 bg-ink-700 p-8">
            <h3 className="mb-4 text-display-sm">
              Checkout que
              <br />
              retém clientes.
            </h3>
            <p className="text-sm text-neutral-400">
              Páginas que carregam num instante e um fluxo de compra curto, para que ninguém desista a meio.
            </p>
          </div>
        </div>
      </section>

      {/* 4. ÁREA DE MEMBROS (CLARO) */}
      <section className="rounded-t-[3rem] bg-surface-100 px-6 py-24 text-ink-800">
        <div className="mx-auto grid max-w-7xl items-center gap-16 md:grid-cols-2">

          <div>
            <div className="mb-6 inline-block rounded-full border border-neutral-300 px-4 py-2 text-sm font-bold">
              Clientes felizes voltam sempre
            </div>
            <h2 className="mb-8 text-display-lg">
              Encanta os teus clientes com a nossa área de membros e aumenta as compras repetidas.
            </h2>

            <div className="space-y-6">
              <div>
                <h4 className="mb-2 border-t-2 border-brand pt-4 text-xl font-bold text-brand">
                  Progresso, gamificação e certificados: torna o conteúdo irresistível.
                </h4>
                <p className="text-neutral-600">
                  Cada aluno vê o seu progresso em tempo real, ganha XP ao avançar e recebe o certificado assim que
                  conclui o curso.
                </p>
              </div>
              <div>
                <h4 className="mb-2 border-t-2 border-neutral-200 pt-4 text-xl font-bold text-neutral-400">
                  Suporte por IA que aprende contigo e nunca dorme.
                </h4>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-4 top-6 z-20 flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-3 shadow-float sm:-left-10">
              <div className="rounded-lg bg-brand p-2 text-white">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <div>
                <div className="text-xs font-bold text-neutral-500">Taxa de reembolso</div>
                <div className="text-lg font-extrabold">1,4%</div>
              </div>
            </div>

            <BrowserFrame url="above.ao/learn/marketing-digital" className="mt-8">
              <MembersAreaMock />
            </BrowserFrame>
          </div>
        </div>

        {/* INTEGRAÇÕES E ANÁLISES */}
        <div className="mx-auto mt-32 grid max-w-7xl gap-6 md:grid-cols-3">

          <div className="flex flex-col rounded-3xl border border-neutral-200 bg-white p-10 shadow-card">
            <h3 className="mb-4 text-display-md">Apoio especializado, exatamente quando precisas.</h3>
            <p className="mb-8 text-neutral-600">
              Os nossos especialistas conhecem o teu negócio e sabem como impulsioná-lo. Com o parceiro certo, vais mais
              longe.
            </p>
            <a href="/signup" className="mt-auto inline-flex items-center gap-2 font-bold text-brand hover:underline">
              Regista-te agora →
            </a>
          </div>

          <div className="flex flex-col rounded-3xl border border-neutral-200 bg-white p-8 shadow-card">
            <div className="mb-6 overflow-hidden rounded-2xl border border-neutral-200">
              <AnalyticsMock compact />
            </div>
            <h3 className="mb-2 text-xl font-bold">Análises detalhadas</h3>
            <p className="text-sm text-neutral-600">
              Receita, vendas e reembolsos em kwanzas, mês a mês, sempre à mão.
            </p>
          </div>

          <div className="flex flex-col justify-center gap-4 rounded-3xl border border-neutral-200 bg-white p-8 shadow-card">
            {["Hubspot", "Mailchimp", "Zapier", "n8n"].map((i) => (
              <div
                key={i}
                className="flex items-center gap-4 rounded-xl border border-neutral-100 bg-neutral-50 p-4 text-sm font-bold"
              >
                <span className="text-xl text-brand">✦</span> + Integra com {i}
              </div>
            ))}
          </div>

        </div>

        {/* CERTIFICADO */}
        <div className="relative mx-auto mt-32 flex max-w-7xl flex-col items-center gap-12 overflow-hidden rounded-[3rem] border border-neutral-800 bg-ink-900 p-8 shadow-float sm:p-16 lg:flex-row lg:gap-20">
          <div aria-hidden="true" className="pointer-events-none absolute right-0 top-0 h-96 w-96 rounded-full bg-brand/20 blur-[120px]" />

          <div className="relative z-10 w-full lg:w-1/2">
            <div className="mb-6 inline-block rounded-full border border-brand/30 bg-brand/10 px-4 py-2 text-sm font-bold text-brand">
              VALOR NO MERCADO
            </div>
            <h2 className="mb-6 text-display-lg text-white">
              Certificação Profissional.
              <br />
              <span className="text-neutral-400">Reconhecimento instantâneo.</span>
            </h2>
            <p className="mb-8 text-lg leading-relaxed text-neutral-400">
              Todos os cursos concluídos geram automaticamente um certificado de altíssimo padrão, com estilo manual de
              assinatura. Os teus alunos poderão partilhá-lo e validar o seu conhecimento perante o mercado com uma
              página de autenticação exclusiva da ABOVE.
            </p>
            <ul className="mb-10 space-y-4">
              {[
                "Gerado em PDF automaticamente no fim do curso",
                "Código QR de verificação de autenticidade",
                "Identidade premium com estilo de assinatura à mão",
              ].map((t) => (
                <li key={t} className="flex items-center gap-3 font-medium text-neutral-300">
                  <span className="text-brand">✓</span> {t}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative z-10 w-full lg:w-1/2">
            <CertificateMock />
          </div>
        </div>

      </section>

      {/* 5. TESTEMUNHOS */}
      <section className="rounded-b-[3rem] bg-white px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-display-lg text-ink-800">O que dizem os nossos criadores</h2>
            <p className="mx-auto max-w-2xl text-lg text-neutral-500">
              Junta-te aos criadores que já transformaram o seu conhecimento em lucro com a ABOVE.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                quote:
                  "A facilidade de uso é incrível. Em 10 minutos tinha o meu e-book à venda. O checkout converte muito melhor do que a plataforma que usava antes e não tenho dores de cabeça.",
                name: "João M.",
                role: "Criador de Conteúdo",
              },
              {
                quote:
                  "O facto de ter pagamentos via Multicaixa Express e Unitel Money mudou o jogo para mim em Angola. As minhas vendas simplesmente duplicaram no primeiro mês de uso da plataforma.",
                name: "Ana C.",
                role: "Mentora de Finanças",
              },
              {
                quote:
                  "A área de membros é visualmente linda e os meus alunos adoram o sistema de XP e os certificados automáticos gerados. Poupou-me imenso trabalho manual de suporte.",
                name: "Paulo S.",
                role: "Especialista em Marketing",
              },
            ].map((t) => (
              <figure key={t.name} className="flex flex-col rounded-3xl border border-neutral-200 bg-surface-50 p-8">
                <div className="mb-4 text-sm tracking-widest text-yellow-400">★★★★★</div>
                <blockquote className="mb-8 font-medium italic text-neutral-700">“{t.quote}”</blockquote>
                <figcaption className="mt-auto flex items-center gap-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-soft font-bold text-brand">
                    {t.name.charAt(0)}
                  </span>
                  <span>
                    <span className="block text-sm font-bold text-ink-800">{t.name}</span>
                    <span className="block text-xs text-neutral-500">{t.role}</span>
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* 6. CHAMADA FINAL */}
      <section className="px-6 py-24">
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[3rem] border border-neutral-800 bg-ink-700 px-8 py-16 text-center sm:px-16">
          <div aria-hidden="true" className="bg-grid pointer-events-none absolute inset-0 opacity-60" />
          <div className="relative">
            <h2 className="text-display-lg">Pronto para publicar o teu primeiro produto?</h2>
            <p className="mx-auto mt-4 max-w-xl text-neutral-400">
              Cria a tua conta, carrega o conteúdo e começa a vender hoje. Sem mensalidade para começar.
            </p>
            <a
              href={user ? "/become-creator" : "/signup"}
              className="mt-8 inline-block rounded-lg bg-brand px-7 py-3.5 text-[15px] font-semibold text-white shadow-brand transition hover:bg-brand-dark"
            >
              {user ? "Tornar-se Criador" : "Criar conta grátis"}
            </a>
          </div>
        </div>
      </section>

    </div>
  )
}
