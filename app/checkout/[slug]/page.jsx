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

  const fmt = n => (n ?? 0).toLocaleString("pt-PT")

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 grid md:grid-cols-2 gap-10">
      <div>
        <h1 className="text-2xl font-extrabold">Finalizar compra</h1>
        <p className="text-neutral-600 mt-1 text-sm">
          Conclui o pagamento por transferência e a tua conta será ativada após confirmação.
        </p>

        <div className="mt-6 border border-neutral-200 rounded-2xl p-4 flex gap-4">
          <img src={item.image} alt={item.title} className="w-28 h-20 object-cover rounded-lg" />
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase text-neutral-500">{typeLabels[item.type]}</span>
            <span className="font-bold leading-snug">{item.title}</span>
            <span className="text-sm text-neutral-600">por {item.instructor}</span>
          </div>
        </div>

        <div className="mt-6 border border-neutral-200 rounded-2xl p-5 bg-neutral-50">
          <div className="font-bold text-sm">Instruções de pagamento</div>
          <ol className="mt-3 space-y-2 text-sm text-neutral-700 list-decimal list-inside">
            <li>Faz transferência de <strong>{fmt(item.price)} Kz</strong> para:
              <div className="ml-5 mt-1 bg-white border border-neutral-200 rounded-md p-3 text-xs leading-relaxed">
                <div><strong>Banco:</strong> BAI / BFA / BIC (escolhe um)</div>
                <div><strong>IBAN:</strong> AO06 0000 0000 0000 0000 0000 0</div>
                <div><strong>Titular:</strong> CreatorHub LDA</div>
                <div><strong>Multicaixa Express:</strong> 9XX XXX XXX</div>
              </div>
            </li>
            <li>Tira foto/print do comprovativo.</li>
            <li>Submete abaixo a referência da transferência (ID, últimos dígitos ou descrição).</li>
            <li>Em até 24h o teu acesso será ativado e aparecerá em <strong>Biblioteca</strong>.</li>
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
            <label className="text-sm font-medium">Método</label>
            <select
              name="payment_method"
              defaultValue="transfer"
              className="mt-1 w-full border border-neutral-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0E7C86]"
            >
              <option value="transfer">Transferência bancária</option>
              <option value="multicaixa_express">Multicaixa Express</option>
              <option value="unitel_money">Unitel Money</option>
              <option value="africell_money">Africell Money</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Referência do pagamento</label>
            <input
              type="text"
              name="payment_ref"
              placeholder="ex: TRX-2026-051234 ou últimos 6 dígitos"
              className="mt-1 w-full border border-neutral-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0E7C86]"
            />
            <p className="text-xs text-neutral-500 mt-1">Ajuda-nos a confirmar mais depressa.</p>
          </div>

          <button
            type="submit"
            className="w-full bg-[#0E7C86] hover:bg-[#0a626a] text-white font-bold py-3 rounded-md transition"
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
