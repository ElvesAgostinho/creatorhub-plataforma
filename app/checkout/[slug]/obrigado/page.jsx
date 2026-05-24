import { notFound } from "next/navigation"
import { getProductBySlug } from "@/lib/data/products"

export default async function ThankYouPage({ params }) {
  const item = await getProductBySlug(params.slug)
  if (!item) notFound()

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center">
      <div className="text-5xl">✅</div>
      <h1 className="text-3xl font-extrabold mt-4">Pedido recebido</h1>
      <p className="text-neutral-600 mt-3">
        Recebemos o teu pedido para <strong>{item.title}</strong>.
        Vamos validar o pagamento em até <strong>24h</strong>.
      </p>

      <div className="mt-8 border border-neutral-200 rounded-2xl p-6 bg-neutral-50 text-left text-sm">
        <p className="font-bold">Próximos passos</p>
        <ol className="mt-2 space-y-1 list-decimal list-inside text-neutral-700">
          <li>Confirma que enviaste a transferência conforme as instruções.</li>
          <li>Vais receber email de confirmação quando o acesso for ativado.</li>
          <li>Quando ativo, o produto aparece em <strong>Biblioteca</strong>.</li>
        </ol>
      </div>

      <div className="mt-8 flex gap-3 justify-center">
        <a href="/library" className="bg-[#0E7C86] hover:bg-[#0a626a] text-white font-bold px-5 py-2.5 rounded-md">
          Ver biblioteca
        </a>
        <a href="/" className="border border-neutral-300 hover:bg-neutral-50 font-semibold px-5 py-2.5 rounded-md">
          Continuar a explorar
        </a>
      </div>
    </div>
  )
}
