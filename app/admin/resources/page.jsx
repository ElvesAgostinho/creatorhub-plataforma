import { redirect } from "next/navigation"
import { createClient, createServiceClient } from "@/lib/supabase/server"
import { deleteResource } from "./actions"

export const dynamic = "force-dynamic"

export default async function AdminResources() {
  const svc = createServiceClient()
  const { data: rows } = await svc
    .from("resources")
    .select("*")
    .order("created_at", { ascending: false })

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-neutral-900">Blog & Recursos</h1>
          <p className="text-sm text-neutral-500 mt-1">Gere os artigos, e-books e materiais gratuitos.</p>
        </div>
        <a href="/admin/resources/new" className="bg-[#FF4500] hover:bg-[#E03E00] text-white font-bold px-6 py-2.5 rounded-xl transition shadow-md">
          + Novo Recurso
        </a>
      </div>

      <div className="mt-8 overflow-x-auto border border-neutral-200 rounded-2xl bg-white">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-neutral-600 text-xs uppercase">
            <tr>
              <th className="text-left p-3">Data</th>
              <th className="text-left p-3">Título</th>
              <th className="text-left p-3">Tipo</th>
              <th className="text-left p-3">Categoria</th>
              <th className="text-right p-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {(!rows || rows.length === 0) && (
              <tr><td colSpan={5} className="p-6 text-center text-neutral-500">Sem recursos publicados.</td></tr>
            )}
            {rows?.map(r => (
              <tr key={r.id} className="border-t border-neutral-100">
                <td className="p-3 text-xs whitespace-nowrap">{new Date(r.created_at).toLocaleDateString("pt-PT")}</td>
                <td className="p-3 font-medium">
                  {r.title}
                  {r.external_link && <a href={r.external_link} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-500 text-xs underline">Ver Link</a>}
                </td>
                <td className="p-3 text-xs uppercase text-neutral-500">{r.type}</td>
                <td className="p-3 text-xs">{r.category}</td>
                <td className="p-3 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <a href={`/admin/resources/${r.id}`} className="text-[#0E7C86] font-semibold hover:underline text-xs">Editar</a>
                    <form action={deleteResource} className="inline-block">
                      <input type="hidden" name="id" value={r.id} />
                      <button className="text-red-600 font-semibold hover:underline text-xs">Apagar</button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
