import { createClient } from "@/lib/supabase/server"
import { PremiumInput, PremiumButton } from "@/components/PremiumForms"
import { GraduationCap } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function AdminCertificates() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Buscar produtos do criador para o dropdown
  const { data: products } = await supabase
    .from("products")
    .select("id, title")
    .eq("created_by", user.id)
    .eq("type", "course")

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-xl flex items-center justify-center">
          <GraduationCap className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-neutral-900">Emissão Manual de Certificados</h1>
          <p className="text-sm text-neutral-500 mt-1">Gera certificados personalizados em PDF para qualquer aluno, a qualquer momento.</p>
        </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-2xl p-6 md:p-8 max-w-2xl shadow-sm">
        <form action="/api/certificate/manual" method="POST" target="_blank" className="space-y-6">
          
          <div>
            <PremiumInput 
              label="Nome Completo do Aluno" 
              name="student_name" 
              placeholder="Ex: João Silva"
              required 
            />
            <p className="text-xs text-neutral-500 mt-1">O nome será impresso no certificado com uma fonte clássica manuscrita.</p>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Selecione o Curso</label>
            <select name="course_title" required className="w-full bg-neutral-50 border border-neutral-200 text-neutral-900 text-sm rounded-xl focus:ring-[#FF4500] focus:border-[#FF4500] block p-3 outline-none transition">
              <option value="">-- Escolhe um curso --</option>
              {products?.map(p => (
                <option key={p.id} value={p.title}>{p.title}</option>
              ))}
              <option value="custom">Outro (Escrever manualmente)</option>
            </select>
          </div>
          
          <div>
            <PremiumInput 
              label="Nome do Curso Manual (opcional)" 
              name="custom_course_title" 
              placeholder="Preenche apenas se escolheste 'Outro' acima"
            />
          </div>

          <div>
            <PremiumInput 
              label="Nome do Formador" 
              name="trainer_name" 
              placeholder="Ex: Maria Santos"
              required 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <PremiumInput 
                type="date"
                label="Data de Início" 
                name="start_date" 
                required 
              />
            </div>
            <div>
              <PremiumInput 
                type="date"
                label="Data de Fim" 
                name="end_date" 
                required 
              />
            </div>
          </div>

          <div className="pt-6 border-t border-neutral-100">
            <PremiumButton type="submit" variant="primary" className="w-full justify-center">
              Gerar e Descarregar Certificado PDF
            </PremiumButton>
          </div>
        </form>
      </div>
    </div>
  )
}
