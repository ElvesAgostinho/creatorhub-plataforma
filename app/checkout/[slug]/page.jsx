import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getProductBySlug, typeLabels } from "@/lib/data/products"
import { createPendingPurchase } from "./actions"

export const dynamic = "force-dynamic"

export default async function CheckoutPage({ params, searchParams }) {
  const item = await getProductBySlug(params.slug)
  if (!item) notFound()

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/login?next=/checkout/${params.slug}`)

  // Fetch Site Settings
  const { data: settings } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", "default")
    .single()

  const fmt = n => (n ?? 0).toLocaleString("pt-PT")

  return (
    <div className="min-h-screen bg-[#F4F5F6] py-10 px-4 flex justify-center">
      <div className="w-full max-w-3xl relative">
        
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
          
          {/* Header */}
          <div className="px-8 py-6 border-b border-neutral-100 flex items-center justify-between bg-[#FAFAFA]">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black italic tracking-tighter text-[#FF4500]">ABOVE</span>
            </div>
            <div className="flex items-center gap-2 text-[#00A859] font-bold text-xs uppercase tracking-widest bg-[#00A859]/10 px-3 py-1.5 rounded-full">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              Ambiente Seguro
            </div>
          </div>

          <form action={createPendingPurchase} className="flex flex-col">
            <input type="hidden" name="slug" value={item.slug} />
            {searchParams?.ref && <input type="hidden" name="ref" value={searchParams.ref} />}

            <div className="p-8 space-y-10">
              
              {/* Product Info */}
              <div className="flex gap-6">
                <div className="w-24 h-24 bg-neutral-100 rounded-xl overflow-hidden shrink-0 border border-neutral-200">
                  {item.image ? (
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-400 font-bold text-xs">Sem capa</div>
                  )}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-neutral-900 leading-tight">{item.title}</h1>
                  <p className="text-neutral-500 mt-1">Produtor: {item.instructor}</p>
                  <div className="text-3xl font-black text-neutral-900 mt-2">{fmt(item.price)} Kz</div>
                </div>
              </div>

              <hr className="border-neutral-100" />

              {/* Personal Info */}
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-neutral-900">Dados Pessoais</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-neutral-700 mb-2">O teu e-mail</label>
                    <input 
                      type="email" 
                      defaultValue={user.email}
                      required
                      placeholder="Insere o e-mail onde vais receber o acesso"
                      className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-lg focus:outline-none focus:border-[#FF4500] focus:ring-1 focus:ring-[#FF4500] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-neutral-700 mb-2">Confirma o teu e-mail</label>
                    <input 
                      type="email" 
                      defaultValue={user.email}
                      required
                      placeholder="Insere novamente o teu e-mail"
                      className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-lg focus:outline-none focus:border-[#FF4500] focus:ring-1 focus:ring-[#FF4500] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-neutral-700 mb-2">Nome completo</label>
                    <input 
                      type="text" 
                      name="full_name"
                      required
                      placeholder="Insere o teu nome completo"
                      className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-lg focus:outline-none focus:border-[#FF4500] focus:ring-1 focus:ring-[#FF4500] transition-colors"
                    />
                  </div>
                </div>
              </div>

              <hr className="border-neutral-100" />

              {/* Payment Method */}
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-neutral-900">Método de Pagamento</h2>
                
                <div>
                  <select
                    name="payment_method"
                    defaultValue="transfer"
                    className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-lg focus:outline-none focus:border-[#FF4500] focus:ring-1 focus:ring-[#FF4500] transition-colors font-medium"
                  >
                    <option value="transfer">Transferência Bancária / Multicaixa Express</option>
                    <option value="unitel_money">Unitel Money</option>
                    <option value="africell_money">Africell Money</option>
                  </select>
                </div>

                <div className="bg-[#FFF0EB] border border-[#FF4500]/20 rounded-lg p-5 text-sm text-neutral-800">
                  <p className="font-bold mb-2">Dados para pagamento:</p>
                  Faz a transferência para o IBAN:
                  <div className="mt-2 font-mono bg-white px-4 py-3 rounded border border-[#FF4500]/10 font-bold text-lg text-center tracking-wider shadow-sm">
                    {settings?.platform_iban || "Não configurado"}
                  </div>
                  <div className="text-center mt-2 text-neutral-600 font-medium">{settings?.platform_beneficiary}</div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-neutral-700 mb-2">Comprovativo / Referência</label>
                  <input
                    type="text"
                    name="payment_ref"
                    required
                    placeholder="Ex: TRX-2026 ou últimos 6 dígitos"
                    className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-lg focus:outline-none focus:border-[#FF4500] focus:ring-1 focus:ring-[#FF4500] transition-colors"
                  />
                </div>
              </div>

            </div>

            {/* Bottom Sticky Action Bar */}
            <div className="bg-neutral-50 px-8 py-6 border-t border-neutral-200 flex items-center justify-between sticky bottom-0 rounded-b-2xl">
              <div className="text-2xl font-black text-neutral-900">{fmt(item.price)} Kz</div>
              <button
                type="submit"
                className="bg-[#00A859] hover:bg-[#009650] text-white font-bold text-lg px-12 py-4 rounded-xl transition-all shadow-[0_4px_14px_0_rgba(0,168,89,0.39)] hover:shadow-[0_6px_20px_rgba(0,168,89,0.23)] hover:-translate-y-0.5"
              >
                Comprar agora
              </button>
            </div>
          </form>
        </div>
        
        <div className="text-center mt-6 text-sm text-neutral-400 font-medium flex items-center justify-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          Pagamento 100% Seguro • ABOVE
        </div>

      </div>
    </div>
  )
}
