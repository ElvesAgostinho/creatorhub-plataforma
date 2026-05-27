import { notFound, redirect } from "next/navigation"
import { createClient, createServiceClient } from "@/lib/supabase/server"
import {
  updateProduct, deleteProduct,
  addModule, deleteModule,
  deleteLesson,
  addSlot, deleteSlot
} from "../actions"
import ConfirmForm from "@/components/ConfirmForm"
import EditProductCoverForm from "@/components/EditProductCoverForm"
import EditProductBookForm from "@/components/EditProductBookForm"
import AddLessonForm from "@/components/AddLessonForm"
import { PremiumInput, PremiumSelect, PremiumTextarea, PremiumButton } from "@/components/PremiumForms"
import ClientForm from "@/components/ClientForm"

export const dynamic = "force-dynamic"

export default async function EditProduct({ params }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/login?next=/admin/products/${params.id}`)
  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).maybeSingle()
  if (!profile || (profile.role !== "admin" && profile.role !== "creator")) {
    redirect("/admin")
  }

  const svc = createServiceClient()
  const { data: p } = await svc.from("products").select("*").eq("id", params.id).maybeSingle()
  if (!p) notFound()
  
  if (p.created_by !== user.id && profile.role !== "admin") {
    redirect("/admin/products")
  }

  const cls = "mt-1 w-full border border-neutral-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0E7C86]"

  const { data: billing } = await svc.from("creator_storage_billing").select("status").eq("user_id", user.id).maybeSingle()
  const isStorageActive = profile.role === "admin" || billing?.status === "active"

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <a href="/admin/products" className="text-xs text-neutral-500 hover:underline">← Produtos</a>
          <h1 className="text-2xl font-extrabold">{p.title}</h1>
          <p className="text-xs text-neutral-500">{p.type} · /{p.slug}</p>
        </div>
        <div className="flex gap-2">
          <a href={`/product/${p.slug}`} target="_blank" className="text-sm border border-neutral-300 hover:bg-neutral-50 px-3 py-1.5 rounded">Ver público</a>
          <ConfirmForm action={deleteProduct} message="Apagar produto definitivamente?">
            <input type="hidden" name="id" value={p.id} />
            <button className="text-sm border border-red-300 text-red-700 hover:bg-red-50 px-3 py-1.5 rounded">Apagar</button>
          </ConfirmForm>
        </div>
      </div>

      {/* ---- Capa ---- */}
      <section className="border border-neutral-200 rounded-2xl p-6 bg-white">
        <h2 className="font-bold text-lg">Imagem de capa</h2>
        <p className="text-xs text-neutral-500 mt-1">
          Faz upload (jpg/png/webp) ou cola um URL na secção "Dados gerais" abaixo. Upload sobrepõe o URL.
        </p>

        <EditProductCoverForm productId={p.id} currentImageUrl={p.image_url} />
      </section>

      {/* ---- Dados gerais ---- */}
      <section className="border border-neutral-200 rounded-2xl p-6 bg-white">
        <h2 className="font-bold text-lg mb-4">Dados gerais</h2>
        <ClientForm action={updateProduct} className="grid sm:grid-cols-2 gap-6" successMessage="Produto atualizado com sucesso!">
          <input type="hidden" name="id" value={p.id} />
          
          <div className="sm:col-span-2">
            <PremiumInput label="Título" name="title" defaultValue={p.title} required />
          </div>
          
          <PremiumInput label="Imagem (URL)" name="image_url" defaultValue={p.image_url || ""} />

          <PremiumInput label="Preço Atual (Kz)" name="price" type="number" defaultValue={Math.round((p.price_cents||0)/100)} />
          <PremiumInput label="Preço original (Kz)" name="original_price" type="number" defaultValue={Math.round((p.original_price_cents||0)/100)} />
          
          <PremiumInput 
            label="Comissão para Afiliados (%)" 
            name="affiliate_commission_pct" 
            type="number" 
            defaultValue={p.affiliate_commission_pct ?? 0} 
            min="0"
            max="90"
            helper="Quanto pagas aos afiliados por cada venda (0 = sem afiliados)."
          />

          <PremiumSelect 
            label="Nível" 
            name="level" 
            defaultValue={p.level || ""}
            options={[
              { value: "", label: "Sem nível" },
              { value: "iniciante", label: "Iniciante" },
              { value: "intermediario", label: "Intermediário" },
              { value: "avancado", label: "Avançado" }
            ]}
          />
          

          <div className="sm:col-span-2">
            <PremiumTextarea label="Descrição" name="description" rows={4} defaultValue={p.description || ""} />
          </div>
          
          <div className="sm:col-span-2 border-t border-neutral-100 pt-6 mt-2 grid gap-6">
            <PremiumInput 
              label="Link de Pré-visualização (YouTube)" 
              name="youtube_preview_url" 
              defaultValue={p.youtube_preview_url || ""} 
              placeholder="Ex: https://youtube.com/watch?v=..." 
              helper="Opcional. Os curiosos verão este vídeo na página pública sem pagar."
            />
            <PremiumInput 
              label="Link da Comunidade (WhatsApp, Discord, etc)" 
              name="community_url" 
              defaultValue={p.community_url || ""} 
              placeholder="Ex: https://chat.whatsapp.com/..." 
              helper="Opcional. Os alunos verão um botão 'Aceder à Comunidade' no player."
            />
          </div>

          <div className="sm:col-span-2 border-t border-neutral-100 pt-6 mt-2 grid sm:grid-cols-2 gap-6">
            <h3 className="sm:col-span-2 font-bold text-lg text-neutral-800">Checkout & Afiliados</h3>

            <div className="sm:col-span-2">
              <PremiumTextarea 
                label="Para quem é este curso? (Público-alvo)" 
                name="target_audience" 
                rows={3} 
                defaultValue={p.target_audience || ""} 
                placeholder="Ex: Criadores de conteúdo, designers, iniciantes..." 
              />
            </div>
            
            <div className="sm:col-span-2">
              <PremiumTextarea 
                label="Vantagens do Produto" 
                name="advantages" 
                rows={3} 
                defaultValue={p.advantages || ""} 
                placeholder="Ex: Certificado incluído&#10;Acesso vitalício&#10;Suporte direto..." 
                helper="Uma vantagem por linha."
              />
            </div>

            <PremiumInput 
              label="Vídeo Promocional (URL)" 
              name="promo_video_url" 
              defaultValue={p.promo_video_url || ""} 
              placeholder="Link do YouTube, Vimeo, Drive..." 
            />
            
            <PremiumSelect 
              label="Fonte do Vídeo Promocional" 
              name="promo_media_source" 
              defaultValue={p.promo_media_source || "youtube"}
              options={[
                { value: "youtube", label: "YouTube" },
                { value: "vimeo", label: "Vimeo" },
                { value: "google_drive", label: "Google Drive" },
                { value: "internal", label: isStorageActive ? "Storage Interno (Pago)" : "Storage Interno (Requer Subscrição)", disabled: !isStorageActive },
                { value: "external_link", label: "Link Direto (MP4)" }
              ]}
            />

            <div className="sm:col-span-2">
              <PremiumInput 
                label="Página de Vendas Externa" 
                name="external_sales_url" 
                defaultValue={p.external_sales_url || ""} 
                placeholder="Ex: https://meusite.com/curso" 
                helper="Se tiveres uma página de vendas fora da plataforma."
              />
            </div>
            
            <div className="sm:col-span-2 mt-4 pt-6 border-t border-neutral-100 grid gap-6">
              <h4 className="font-bold text-neutral-800 flex items-center gap-2">🛠 Ferramentas para Afiliados</h4>
              <p className="text-sm text-neutral-500">Fornece materiais para ajudar os teus afiliados a venderem mais.</p>
              
              <PremiumInput 
                label="Vídeo de Treino para Afiliados (URL)" 
                name="affiliate_training_video" 
                defaultValue={p.affiliate_training_video || ""} 
                placeholder="Ex: Link do Youtube a explicar como vender o produto" 
              />
              <PremiumInput 
                label="Link para Materiais Promocionais (Drive/Dropbox)" 
                name="affiliate_materials_link" 
                defaultValue={p.affiliate_materials_link || ""} 
                placeholder="Ex: https://drive.google.com/..." 
                helper="Coloca aqui o link da pasta onde guardas imagens, vídeos e copys de anúncios."
              />
              <PremiumTextarea 
                label="Links Extras para Divulgação" 
                name="affiliate_extra_links" 
                rows={3} 
                defaultValue={
                  Array.isArray(p.affiliate_extra_links) 
                    ? p.affiliate_extra_links.map(l => `${l.label} | ${l.url}`).join('\n')
                    : ""
                } 
                placeholder="Página VSL | https://vendas.com/vsl&#10;Checkout Direto | https://checkout.com/curso" 
                helper="Um link por linha, separando o Nome e o URL por | (barra vertical)."
              />
            </div>
          </div>


          
          <div className="sm:col-span-2 flex flex-col gap-3 mt-4">
            <label className="flex items-center gap-3 text-sm font-bold text-neutral-800 bg-neutral-50 p-4 rounded-xl border border-neutral-200 cursor-pointer hover:bg-neutral-100 transition">
              <input type="checkbox" name="best_seller" defaultChecked={p.best_seller} className="w-5 h-5 accent-[#FF4500]" />
              Destacar como Best Seller
            </label>
            
            {profile?.role === "admin" ? (
              <label className="flex items-center gap-3 text-sm font-bold text-neutral-800 bg-neutral-50 p-4 rounded-xl border border-neutral-200 cursor-pointer hover:bg-neutral-100 transition">
                <input type="checkbox" name="published" defaultChecked={p.published} className="w-5 h-5 accent-[#FF4500]" />
                Tornar Público (Publicado)
              </label>
            ) : (
              <div className="flex items-center text-sm font-bold p-4 rounded-xl border border-neutral-200 bg-neutral-50">
                Status: {p.published ? "✅ Publicado (Visível para todos)" : "⏳ Em revisão pelo Admin"}
              </div>
            )}
          </div>

          <div className="sm:col-span-2 mt-4">
            <PremiumButton type="submit" variant="primary">
              Guardar Alterações
            </PremiumButton>
          </div>
        </ClientForm>
      </section>

      {/* ---- Conteúdo conforme tipo ---- */}
      {p.type === "course" && <LessonsSection productId={p.id} isStorageActive={isStorageActive} />}
      {p.type === "book" && <BookSection product={p} />}
      {p.type === "mentorship" && <SlotsSection productId={p.id} />}

    </div>
  )
}

async function LessonsSection({ productId, isStorageActive }) {
  const svc = createServiceClient()
  
  const { data: modules } = await svc.from("modules")
    .select("*").eq("product_id", productId).order("position", { ascending: true })
    
  let lessons = []
  if (modules && modules.length > 0) {
    const { data } = await svc.from("lessons")
      .select("*")
      .in("module_id", modules.map(m => m.id))
      .order("position", { ascending: true })
    if (data) lessons = data
  }

  function isStorage(url) { return typeof url === "string" && url.startsWith("storage:lessons/") }

  return (
    <section className="border border-neutral-200 rounded-2xl p-6 bg-white space-y-6">
      <div>
        <h2 className="font-bold text-lg">Módulos do curso</h2>
        <p className="text-xs text-neutral-500 mt-1">Cria módulos para organizar as aulas.</p>
        
        <form action={addModule} className="mt-3 flex gap-3">
          <input type="hidden" name="product_id" value={productId} />
          <input type="text" name="title" required placeholder="Nome do módulo" className="flex-1 border border-neutral-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0E7C86]" />
          <button className="bg-neutral-800 hover:bg-black text-white font-bold px-4 py-2 rounded-md text-sm">Adicionar Módulo</button>
        </form>
      </div>

      <div className="space-y-6">
        {(!modules || modules.length === 0) && (
          <div className="p-4 text-sm text-neutral-500 text-center border border-neutral-200 rounded-xl">Sem módulos. Cria um módulo primeiro para adicionar aulas.</div>
        )}
        
        {modules?.map(m => {
          const moduleLessons = lessons?.filter(l => l.module_id === m.id) || []
          return (
            <div key={m.id} className="border border-neutral-200 rounded-xl overflow-hidden">
              <div className="bg-neutral-50 p-4 border-b border-neutral-200 flex justify-between items-center">
                <h3 className="font-bold text-sm">Módulo {m.position}: {m.title}</h3>
                <ConfirmForm action={deleteModule} message="Apagar módulo e todas as suas aulas?">
                  <input type="hidden" name="id" value={m.id} />
                  <input type="hidden" name="product_id" value={productId} />
                  <button className="text-xs text-red-600 hover:underline">Apagar Módulo</button>
                </ConfirmForm>
              </div>
              
              <div className="p-4">
                <AddLessonForm productId={productId} moduleId={m.id} modulePosition={m.position} isStorageActive={isStorageActive} />

                <div className="divide-y divide-neutral-100">
                  {moduleLessons.length === 0 && <div className="text-sm text-neutral-500">Sem aulas neste módulo.</div>}
                  {moduleLessons.map(l => (
                    <div key={l.id} className="py-3 flex items-start gap-3">
                      <span className="mt-0.5 w-6 h-6 shrink-0 rounded-full bg-neutral-200 text-neutral-700 flex items-center justify-center text-[10px] font-bold">{l.position}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">{l.title}{l.is_preview && <span className="ml-2 text-[10px] bg-green-100 text-green-800 px-1.5 py-0.5 rounded">PREVIEW</span>}</div>
                        <div className="text-xs text-neutral-500 truncate">
                          {isStorage(l.video_url) ? <>📦 storage · {l.video_url.replace("storage:lessons/", "")}</> : l.video_url || "—"}
                        </div>
                      </div>
                      <ConfirmForm action={deleteLesson} message="Apagar aula?">
                        <input type="hidden" name="id" value={l.id} />
                        <input type="hidden" name="product_id" value={productId} />
                        <button className="text-xs text-red-700 hover:underline">Apagar</button>
                      </ConfirmForm>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function BookSection({ product }) {
  return (
    <section className="border border-neutral-200 rounded-2xl p-6 bg-white">
      <h2 className="font-bold text-lg">Ficheiro PDF</h2>
      <p className="text-xs text-neutral-500 mt-1">
        O PDF é armazenado em bucket privado. Compradores fazem download com watermark dinâmico (email + data).
      </p>

      <div className="mt-3 text-sm">
        Atual: <span className="font-mono text-xs">{product.file_path || "— sem ficheiro —"}</span>
      </div>

      <EditProductBookForm productId={product.id} currentFilePath={product.file_path} />
    </section>
  )
}

async function SlotsSection({ productId }) {
  const svc = createServiceClient()
  const { data: slots } = await svc.from("mentorship_slots")
    .select("*").eq("product_id", productId).order("starts_at", { ascending: true })

  return (
    <section className="border border-neutral-200 rounded-2xl p-6 bg-white">
      <h2 className="font-bold text-lg">Slots de mentoria</h2>
      <p className="text-xs text-neutral-500 mt-1">Cria horários disponíveis. Quem compra esta mentoria escolhe um slot.</p>

      <form action={addSlot} className="mt-6 grid sm:grid-cols-3 gap-4 items-end">
        <input type="hidden" name="product_id" value={productId} />
        <PremiumInput label="Início" name="starts_at" type="datetime-local" required />
        <PremiumInput label="Duração (min)" name="duration_minutes" type="number" defaultValue="60" />
        <PremiumButton type="submit" variant="secondary" className="h-[54px]">
          Adicionar slot
        </PremiumButton>
      </form>

      <div className="mt-6 divide-y divide-neutral-100 border border-neutral-200 rounded-xl">
        {(!slots || slots.length === 0) && (
          <div className="p-4 text-sm text-neutral-500 text-center">Sem slots.</div>
        )}
        {slots?.map(s => (
          <div key={s.id} className="p-3 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm">{new Date(s.starts_at).toLocaleString("pt-PT")}</div>
              <div className="text-xs text-neutral-500">{s.duration_minutes} min · {s.status}</div>
            </div>
            <ConfirmForm action={deleteSlot} message="Apagar slot?">
              <input type="hidden" name="id" value={s.id} />
              <input type="hidden" name="product_id" value={productId} />
              <button className="text-xs text-red-700 hover:underline" disabled={s.status === "booked"}>
                {s.status === "booked" ? "(reservado)" : "Apagar"}
              </button>
            </ConfirmForm>
          </div>
        ))}
      </div>
    </section>
  )
}

