import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import ImageUploader from "@/components/ImageUploader"
import { PremiumInput, PremiumTextarea, PremiumButton } from "@/components/PremiumForms"
import ClientForm from "@/components/ClientForm"
import { saveAcademySettings } from "./actions"
export const dynamic = "force-dynamic"

export default async function AdminAcademy() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch current academy settings for this user
  const { data: academy } = await supabase
    .from("creator_academies")
    .select("*")
    .eq("creator_id", user.id)
    .maybeSingle()

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-neutral-900">Aparência da Academia</h1>
          <p className="text-sm text-neutral-500 mt-1">Configura a marca da tua Área de Membros.</p>
        </div>
      </div>

      <div className="mt-8 bg-white border border-neutral-200 rounded-2xl p-6 md:p-8 max-w-3xl">
        <p className="text-neutral-500 mb-8">
          Personaliza a tua Área de Membros. Escolhe as tuas cores, imagens e vídeos para dar uma experiência única aos teus alunos.
        </p>

        <ClientForm action={saveAcademySettings} className="space-y-6" successMessage="Definições da Academia guardadas!">
          <div className="sm:col-span-2">
            <PremiumInput 
              label="Nome da Academia" 
              name="name" 
              defaultValue={academy?.name || "Minha Academia"} 
              required 
            />
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Cor Principal (HEX)</label>
              <div className="flex gap-3 items-center">
                <input 
                  type="color" 
                  name="primary_color" 
                  defaultValue={academy?.primary_color || "#FF4500"} 
                  className="w-12 h-12 rounded cursor-pointer border-0 p-0" 
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold mb-2">Tema Base</label>
              <select name="theme_mode" defaultValue={academy?.theme_mode || "dark"} className="w-full bg-neutral-50 border border-neutral-200 text-neutral-900 text-sm rounded-xl focus:ring-[#FF4500] focus:border-[#FF4500] block p-3 outline-none">
                <option value="dark">Modo Escuro (Netflix Style)</option>
                <option value="light">Modo Claro (Clean)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold mb-2">Estilo de Layout</label>
              <select name="layout_style" defaultValue={academy?.layout_style || "netflix"} className="w-full bg-neutral-50 border border-neutral-200 text-neutral-900 text-sm rounded-xl focus:ring-[#FF4500] focus:border-[#FF4500] block p-3 outline-none">
                <option value="netflix">Imersivo (Sem Sidebar)</option>
                <option value="classic">Clássico (Sidebar Esquerda)</option>
              </select>
            </div>
          </div>

          <div>
            <ImageUploader 
              label="Logótipo da Academia" 
              name="logo_url"
              defaultValue={academy?.logo_url || ""}
            />
          </div>

          <div className="sm:col-span-2">
            <PremiumTextarea 
              label="Descrição Curta (Promessa da Academia)" 
              name="description" 
              defaultValue={academy?.description || ""} 
              rows={3}
              placeholder="O que os alunos vão encontrar na tua academia?"
              helper="Uma frase impactante sobre a transformação que a tua academia oferece."
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <PremiumInput 
                label="Mensalidade (em AOA)" 
                name="price_monthly" 
                type="number" 
                defaultValue={academy?.price_monthly_cents ? academy.price_monthly_cents / 100 : 0} 
                min="0"
                step="any"
                helper="Coloca 0 para ser gratuita."
              />
            </div>
            <div className="flex flex-col justify-center gap-2 mt-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  name="published" 
                  defaultChecked={academy?.published || false} 
                  className="w-5 h-5 accent-[#FF4500]" 
                />
                <span className="text-sm font-semibold">Publicar no Marketplace</span>
              </label>
              <p className="text-xs text-neutral-500 pl-8">Os alunos poderão ver e assinar a tua academia publicamente.</p>
            </div>
          </div>

          <div>
            <ImageUploader 
              label="Imagem de Fundo (Hero Cover)" 
              name="hero_image_url"
              defaultValue={academy?.hero_image_url || ""}
            />
            <p className="text-xs text-neutral-500 mt-1">Esta imagem vai aparecer atrás do conteúdo principal no topo da página.</p>
          </div>

          <div className="sm:col-span-2">
            <PremiumInput 
              label="Vídeo de Apresentação (YouTube/Vimeo Embed URL)" 
              name="hero_video_url" 
              type="url" 
              defaultValue={academy?.hero_video_url || ""} 
              placeholder="https://www.youtube.com/embed/..."
            />
          </div>

          <div className="pt-6 border-t border-neutral-100 sm:col-span-2">
            <PremiumButton type="submit" variant="primary">
              Guardar Alterações
            </PremiumButton>
          </div>
        </ClientForm>
      </div>
    </div>
  )
}
