import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import CreateResourceForm from "@/components/CreateResourceForm"

export const dynamic = "force-dynamic"

export default async function NewResourcePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login?next=/admin/resources/new")

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-6">
        <a href="/admin/resources" className="text-neutral-500 hover:text-black font-semibold text-sm flex items-center gap-2 w-max">
          <span>←</span> Voltar aos Recursos
        </a>
      </div>
      
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-neutral-900">Novo Recurso</h1>
        <p className="text-neutral-500 mt-1">Cria um novo artigo de blog, e-book ou vídeo.</p>
      </div>

      <div className="bg-white border border-neutral-200 rounded-2xl p-6 md:p-8">
        <CreateResourceForm />
      </div>
    </div>
  )
}
