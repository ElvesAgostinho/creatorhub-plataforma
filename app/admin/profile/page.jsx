import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { updateProfile } from "./actions"
import ClientForm from "@/components/ClientForm"
import Uploader from "@/components/Uploader"

export const dynamic = "force-dynamic"

export default async function ProfilePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login?next=/admin/profile")

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle()

  const cls = "mt-2 w-full bg-white border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF4500] focus:border-transparent transition-all shadow-sm"

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-[#111]">O Meu Perfil</h1>
        <p className="text-neutral-500 mt-2">Esta informação ficará visível publicamente na página de checkout dos teus produtos.</p>
      </div>

      <div className="bg-white border border-neutral-200 rounded-3xl p-8 shadow-sm">
        <ClientForm action={updateProfile} className="space-y-6">
          
          <div className="flex flex-col sm:flex-row gap-8 items-start mb-8">
            <div className="shrink-0 w-32 h-32 rounded-full overflow-hidden bg-neutral-100 border-4 border-white shadow-lg">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-neutral-300">
                  {profile?.full_name?.charAt(0) || "U"}
                </div>
              )}
            </div>
            <div className="flex-1 w-full">
              <label className="text-sm font-bold text-neutral-800">Foto de Perfil</label>
              <p className="text-xs text-neutral-500 mb-3">Faz o upload de uma foto tua. O tamanho ideal é 500x500px.</p>
              <Uploader 
                bucket="avatars" 
                folder={user.id} 
                onUploadSuccess={(url) => {
                  // The form should have a hidden input to hold the avatar URL
                  const input = document.getElementById('avatar_url_input')
                  if(input) input.value = url
                }}
              />
              <input type="hidden" name="avatar_url" id="avatar_url_input" defaultValue={profile?.avatar_url || ""} />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-bold text-neutral-800">Nome Público (Artístico)</label>
              <input type="text" name="full_name" defaultValue={profile?.full_name || ""} className={cls} required />
            </div>
            <div>
              <label className="text-sm font-bold text-neutral-800">Especialidade / Profissão</label>
              <input type="text" name="specialty" defaultValue={profile?.specialty || ""} placeholder="Ex: Investidor e Mentor" className={cls} required />
            </div>
          </div>

          <div className="pt-6 border-t border-neutral-100">
            <h3 className="font-bold text-lg mb-4">Redes Sociais</h3>
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-bold text-neutral-800">Instagram (URL)</label>
                <input type="url" name="instagram" defaultValue={profile?.instagram || ""} placeholder="https://instagram.com/..." className={cls} />
              </div>
              <div>
                <label className="text-sm font-bold text-neutral-800">YouTube (URL)</label>
                <input type="url" name="youtube" defaultValue={profile?.youtube || ""} placeholder="https://youtube.com/..." className={cls} />
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm font-bold text-neutral-800">Website Oficial</label>
                <input type="url" name="website" defaultValue={profile?.website || ""} placeholder="https://meusite.com" className={cls} />
              </div>
            </div>
          </div>

          <button type="submit" className="bg-[#FF4500] hover:bg-[#E03E00] text-white font-bold py-3.5 px-8 rounded-xl transition-colors shadow-sm shadow-[#FF4500]/20 mt-4">
            Guardar Perfil
          </button>
        </ClientForm>
      </div>
    </div>
  )
}
