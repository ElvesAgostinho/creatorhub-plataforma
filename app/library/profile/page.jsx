import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { updateStudentProfile } from "./actions"
import ClientForm from "@/components/ClientForm"
import AvatarField from "@/components/AvatarField"
import { UserCircle } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function ProfilePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login?next=/library/profile")

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle()

  const cls = "mt-2 w-full bg-white border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF4500] focus:border-transparent transition-all shadow-sm"

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8 flex items-center gap-4">
        <div className="w-12 h-12 bg-neutral-100 text-neutral-500 rounded-xl flex items-center justify-center">
          <UserCircle size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-black text-neutral-900 tracking-tight">O Meu Perfil</h1>
          <p className="text-neutral-500 mt-1">Atualiza os teus dados pessoais e fotografia.</p>
        </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-3xl p-8 shadow-sm">
        <ClientForm action={updateStudentProfile} className="space-y-6">
          
          <AvatarField 
            userId={user.id} 
            defaultUrl={profile?.avatar_url} 
            defaultInitial={profile?.full_name?.charAt(0) || "U"} 
          />

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="sm:col-span-2">
              <label className="text-sm font-bold text-neutral-800">Nome Completo</label>
              <input type="text" name="full_name" defaultValue={profile?.full_name || ""} placeholder="O teu nome" className={cls} required />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-bold text-neutral-800">Email (Não Editável)</label>
              <input type="email" value={profile?.email || user.email} className={`${cls} bg-neutral-50 text-neutral-500 cursor-not-allowed`} disabled />
            </div>
          </div>

          <button type="submit" className="bg-[#FF4500] hover:bg-[#E03E00] text-white font-bold py-3.5 px-8 rounded-xl transition-colors shadow-sm shadow-[#FF4500]/20 mt-4">
            Guardar Alterações
          </button>
        </ClientForm>
      </div>
    </div>
  )
}
