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

  const { data: settings } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", "default")
    .single()

  const fmt = n => (n ?? 0).toLocaleString("pt-PT")

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 grid md:grid-cols-2 gap-10">
      <div>
        <h1 className="text-2xl font-extrabold text-[#111]">Finalizar compra</h1>
        <p className="text-neutral-600 mt-1 text-sm">
          Conclui o pagamento por transferência e a tua conta será ativada após confirmação.
        </p>

        <div className="mt-6 border border-neutral-200 rounded-2xl p-4 flex gap-4 bg-white shadow-sm">
          <img src={item.image} alt={item.title} className="w-28 h-20 object-cover rounded-lg" />
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase text-[#FF4500]">{typeLabels[item.type]}</span>
            <span className="font-bold leading-snug">{item.title}</span>
            <span className="text-sm text-neutral-600">por {item.instructor}</span>
          </div>
        </div>

        <div className="mt-6 border border-[#FF4500]/20 rounded-2xl p-6 bg-[#FFF0EB]">
          <div className="font-bold text-sm text-[#FF4500] uppercase tracking-wider">Instruções de pagamento</div>
          <ol className="mt-4 space-y-3 text-sm text-neutral-800 list-decimal list-inside">
            <li>Faz a transferência no valor de <strong>{fmt(item.price)} Kz</strong> para:
              <div className="ml-5 mt-2 bg-white border border-[#FF4500]/20 rounded-xl p-4 text-sm leading-relaxed shadow-sm">
                <div><strong>IBAN:</strong> <span className="font-mono bg-neutral-100 px-1.5 py-0.5 rounded text-neutral-900">{settings?.platform_iban || "Não configurado"}</span></div>
                <div className="mt-1"><strong>Titular:</strong> {settings?.platform_beneficiary || "Não configurado"}</div>
              </div>
            </li>
            <li>Tira foto/print do comprovativo.</li>
            <li>Submete ao lado a referência da transferência (ID, últimos dígitos ou descrição).</li>
            <li>Em até 24h o teu acesso será ativado e aparecerá na <strong>Biblioteca</strong>.</li>
          </ol>
        </div>
      </div>

      <aside>
        <form
          action={createPendingPurchase}
          className="border border-neutral-200 rounded-2xl p-6 bg-white shadow-sm space-y-4 sticky top-24"
        >
          <input type="hidden" name="slug" value={item.slug} />
          {searchParams?.ref && <input type="hidden" name="ref" value={searchParams.ref} />}

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold">{fmt(item.price)} Kz</span>
            {item.discount > 0 && (
              <span className="text-xs text-red-600 font-bold">{item.discount}% desc.</span>
            )}
          </div>
          {item.discount > 0 && (
            <div className="text-sm line-through text-neutral-500">{fmt(item.originalPrice)} Kz</div>
          )}

          <div>
            <label className="text-sm font-bold text-neutral-800">Método de Pagamento</label>
            <select
              name="payment_method"
              defaultValue="transfer"
              className="mt-2 w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#FF4500]/10 focus:border-[#FF4500] transition-all shadow-sm"
            >
              <option value="transfer">Transferência Bancária / Multicaixa Express</option>
              <option value="unitel_money">Unitel Money</option>
              <option value="africell_money">Africell Money</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-bold text-neutral-800">Referência do pagamento</label>
            <input
              type="text"
              name="payment_ref"
              placeholder="ex: TRX-2026-051234 ou últimos 6 dígitos"
              className="mt-2 w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#FF4500]/10 focus:border-[#FF4500] transition-all shadow-sm"
            />
            <p className="text-xs text-neutral-500 mt-2">Isto ajuda-nos a confirmar a tua compra imediatamente.</p>
          </div>

          <button
            type="submit"
            className="w-full bg-[#FF4500] hover:bg-[#E03E00] text-white font-bold py-3.5 rounded-xl transition-colors shadow-sm shadow-[#FF4500]/20 mt-4 uppercase tracking-wider text-sm"
          >
            Confirmar pedido
          </button>

          <p className="text-xs text-neutral-500">
            Ao confirmar, criamos uma compra pendente em teu nome. Só ativamos o acesso após validação do pagamento.
          </p>
        </form>
      </aside>
    </div>
  )
}
