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
          <div className="px-8 py-6 border-b border-neutral-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#FF4500] rounded-full flex items-center justify-center text-white font-black text-xl">
                C
              </div>
              <span className="font-extrabold text-xl tracking-tight">CreatorHub</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="bg-[#FF4500] text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full">New Look</span>
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
                  <p className="text-neutral-500 mt-1">Author: {item.instructor}</p>
                  <div className="text-3xl font-black text-neutral-900 mt-2">{fmt(item.price)} Kz</div>
                </div>
              </div>

              <hr className="border-neutral-100" />

              {/* Personal Info */}
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-neutral-900">Personal info</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-neutral-700 mb-2">Your email address</label>
                    <input 
                      type="email" 
                      defaultValue={user.email}
                      required
                      placeholder="Enter the email to receive your purchase"
                      className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-lg focus:outline-none focus:border-[#FF4500] focus:ring-1 focus:ring-[#FF4500] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-neutral-700 mb-2">Confirm your email</label>
                    <input 
                      type="email" 
                      defaultValue={user.email}
                      required
                      placeholder="Enter your email again"
                      className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-lg focus:outline-none focus:border-[#FF4500] focus:ring-1 focus:ring-[#FF4500] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-neutral-700 mb-2">Your full name</label>
                    <input 
                      type="text" 
                      name="full_name"
                      required
                      placeholder="Enter your full name"
                      className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-lg focus:outline-none focus:border-[#FF4500] focus:ring-1 focus:ring-[#FF4500] transition-colors"
                    />
                  </div>
                </div>
              </div>

              <hr className="border-neutral-100" />

              {/* Payment Method */}
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-neutral-900">Payment method</h2>
                
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
                className="bg-[#00A859] hover:bg-[#009650] text-white font-bold text-lg px-12 py-4 rounded-lg transition-colors shadow-sm"
              >
                Buy now
              </button>
            </div>
          </form>
        </div>
        
        <div className="text-center mt-6 text-sm text-neutral-400 font-medium">
          Powered by CreatorHub
        </div>

      </div>
    </div>
  )
}
