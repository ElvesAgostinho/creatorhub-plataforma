import Link from "next/link"

export const metadata = {
  title: "Aguardar Aprovação — ABOVE",
  description: "A tua conta está a aguardar aprovação da administração."
}

export default function PendingPage() {
  return (
    <div className="min-h-screen bg-[#111111] flex flex-col items-center justify-center p-6 text-white font-sans text-center relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[120%] bg-gradient-to-r from-[#FF4500]/10 to-transparent blur-[120px] rounded-full pointer-events-none"></div>
      
      <div className="relative z-10 max-w-md w-full bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-3xl shadow-2xl flex flex-col items-center">
        
        <div className="w-20 h-20 bg-orange-500/20 rounded-full flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-[#FF4500]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>

        <h1 className="text-3xl font-black mb-4 tracking-tight">Conta Pendente</h1>
        
        <p className="text-neutral-400 mb-8 leading-relaxed">
          O teu registo foi recebido com sucesso! Atualmente a tua conta encontra-se com o estado <strong className="text-white">Pendente</strong> e está a aguardar aprovação manual pela nossa administração.
        </p>
        
        <div className="w-full bg-[#1A1A1A] border border-neutral-800 rounded-xl p-4 mb-8 text-sm text-neutral-400">
          Assim que a tua conta for aprovada, terás acesso imediato a todos os conteúdos exclusivos da ABOVE Exchange.
        </div>

        <Link href="/" className="w-full block bg-white hover:bg-neutral-200 text-[#111] font-bold py-3 rounded-full transition text-center shadow-lg">
          Voltar à Página Inicial
        </Link>
      </div>
    </div>
  )
}
