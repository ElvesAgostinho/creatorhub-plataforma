export const dynamic = "force-dynamic"

export const metadata = {
  title: "Suporte e Ajuda — ABOVE",
  description: "Estamos aqui para ajudar formandos e criadores de conteúdo a extrair o máximo da plataforma.",
}

export default function SupportPage() {
  return (
    <div className="bg-white text-neutral-900 min-h-screen font-sans">
      
      {/* HERO SECTION - Support */}
      <section className="pt-24 lg:pt-32 pb-16 px-6 max-w-7xl mx-auto overflow-hidden">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          
          <div className="w-full lg:w-1/2 z-10 text-left">
            <div className="inline-block border border-neutral-200 rounded-full px-4 py-2 text-sm font-bold mb-8 text-[#FF4500] bg-neutral-50 shadow-sm">
              Centro de Apoio
            </div>
            
            <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight leading-[1.1] mb-6">
              Nunca caminhas sozinho.
            </h1>
            
            <p className="text-xl text-neutral-600 mb-10 max-w-xl leading-relaxed">
              O nosso compromisso é com o teu sucesso. Quer sejas um <b>Formando</b> com dúvidas sobre como aceder ao teu curso, ou um <b>Criador</b> à procura de maximizar os teus resultados, a nossa equipa de especialistas está pronta para te ajudar.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="mailto:suporte@abovedinheironanet.com" className="bg-[#FF4500] hover:bg-[#E03E00] text-white font-bold px-8 py-4 rounded-xl text-lg transition text-center shadow-lg shadow-[#FF4500]/20 flex items-center justify-center gap-2">
                Falar com o Suporte
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
              </a>
            </div>
            
            <div className="mt-8 flex items-center gap-4 text-sm text-neutral-500 font-medium">
              <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500"></div> Tempo médio de resposta: 2h</span>
            </div>
          </div>

          <div className="w-full lg:w-1/2">
            <img 
              src="/hero_support_black.png" 
              alt="Especialista de Suporte ABOVE" 
              className="w-full rounded-[2rem] shadow-2xl object-cover object-top border-4 border-neutral-50"
            />
          </div>

        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-24 bg-neutral-50 border-t border-neutral-200 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Dúvidas Frequentes</h2>
            <p className="text-neutral-500 text-lg">Encontra respostas rápidas para os problemas mais comuns.</p>
          </div>
          
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-neutral-200">
              <h3 className="font-bold text-xl mb-3 flex items-center gap-3"><span className="text-[#FF4500]">✦</span> Sou formando, como acedo ao meu curso?</h3>
              <p className="text-neutral-600 leading-relaxed">
                Assim que a tua compra (em Kwanza ou Euros) é aprovada, recebes um email com os teus dados de acesso. Se já tens conta, basta clicares em "Entrar" no topo da página e acederes à aba "Minhas Compras".
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-neutral-200">
              <h3 className="font-bold text-xl mb-3 flex items-center gap-3"><span className="text-[#FF4500]">✦</span> Sou criador, quando recebo o dinheiro das vendas?</h3>
              <p className="text-neutral-600 leading-relaxed">
                As transferências são realizadas de forma automática de acordo com o plano contratado. A nossa integração facilita levantamentos para bancos em Angola (Kwanza) e transferências internacionais.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-neutral-200">
              <h3 className="font-bold text-xl mb-3 flex items-center gap-3"><span className="text-[#FF4500]">✦</span> Como funciona o programa de afiliados?</h3>
              <p className="text-neutral-600 leading-relaxed">
                Basta criares uma conta gratuita, ires ao Marketplace e obteres o teu link exclusivo de promotor. O split do pagamento é feito automaticamente aquando da compra do cliente.
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
