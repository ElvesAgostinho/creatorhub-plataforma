"use client"

import { useState } from "react"
import { createProduct } from "@/app/admin/products/actions"
import Uploader from "@/components/Uploader"
import MediaLinkInput from "@/components/MediaLinkInput"
import { PremiumInput, PremiumSelect, PremiumTextarea, PremiumButton } from "@/components/PremiumForms"
import { categoryTree } from "@/lib/data/categories"
import ClientForm from "@/components/ClientForm"
import { BookOpen, DollarSign, Image as ImageIcon, Video, Layers, Users, Info } from "lucide-react"

export default function CreateProductForm({ isStorageActive, platformVideoEnabled = true, platformPhotoEnabled = true }) {
  const [type, setType] = useState("course")
  const [category, setCategory] = useState(Object.keys(categoryTree)[0])
  const [subcategory, setSubcategory] = useState(categoryTree[Object.keys(categoryTree)[0]][0])
  
  const [imageUrl, setImageUrl] = useState("")
  const [pdfPath, setPdfPath] = useState("")
  const [audioPath, setAudioPath] = useState("")
  const [templatePath, setTemplatePath] = useState("")
  
  const handleCategoryChange = (e) => {
    const newCat = e.target.value
    setCategory(newCat)
    setSubcategory(categoryTree[newCat]?.[0] || "")
  }

  return (
    <ClientForm action={createProduct} className="flex flex-col gap-8" successMessage="Produto criado com sucesso! Redirecionando...">
      
      {/* SECÇÃO 1: Informações Básicas */}
      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
        <div className="bg-neutral-50 px-6 py-4 border-b border-neutral-200 flex items-center gap-3">
          <Info size={20} className="text-neutral-500" />
          <h3 className="font-bold text-[#111827]">Informações Básicas</h3>
        </div>
        
        <div className="p-6 sm:p-8 grid sm:grid-cols-2 gap-6">
          <div className="sm:col-span-2">
            <PremiumInput 
              label="Nome do Produto" 
              name="title" 
              required 
              placeholder="Ex: Fórmula do Lançamento"
              helper="Nome claro que os alunos vão ver na vitrine."
            />
          </div>

          <PremiumSelect 
            label="Formato" 
            name="type" 
            value={type} 
            onChange={e => setType(e.target.value)}
            options={[
              { value: "course", label: "Curso Online" },
              { value: "book", label: "E-book / Documento" },
              { value: "mentorship", label: "Mentoria / Consultoria" },
              { value: "audiobook", label: "Audiobook" },
              { value: "template", label: "Templates / Planilhas" }
            ]}
          />

          <PremiumSelect 
            label="Nível" 
            name="level" 
            options={[
              { value: "", label: "Todos os Níveis" },
              { value: "iniciante", label: "Iniciante" },
              { value: "intermediario", label: "Intermediário" },
              { value: "avancado", label: "Avançado" }
            ]}
          />

          <PremiumSelect 
            label="Categoria" 
            name="category" 
            value={category} 
            onChange={handleCategoryChange}
            options={Object.keys(categoryTree).map(cat => ({ value: cat, label: cat }))}
          />
          
          <PremiumSelect 
            label="Subcategoria" 
            name="subcategory" 
            value={subcategory} 
            onChange={e => setSubcategory(e.target.value)}
            options={(categoryTree[category] || []).map(sub => ({ value: sub, label: sub }))}
          />

          <div className="sm:col-span-2">
            <PremiumTextarea 
              label="Descrição Detalhada" 
              name="description" 
              rows={4} 
              placeholder="Descreve o produto em detalhe. Quais os benefícios? O que o aluno vai aprender?" 
            />
          </div>
        </div>
      </div>

      {/* SECÇÃO 2: Preço & Afiliados */}
      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
        <div className="bg-neutral-50 px-6 py-4 border-b border-neutral-200 flex items-center gap-3">
          <DollarSign size={20} className="text-neutral-500" />
          <h3 className="font-bold text-[#111827]">Preço e Oferta</h3>
        </div>
        
        <div className="p-6 sm:p-8 grid sm:grid-cols-2 gap-6">
          <PremiumInput 
            label="Preço Base (Kz)" 
            name="price" 
            type="number" 
            defaultValue="0" 
            helper="Valor real cobrado aos alunos."
          />
          
          <PremiumInput 
            label="Preço Riscado / Promocional (Kz)" 
            name="original_price" 
            type="number" 
            defaultValue="0" 
            helper="Opcional. Mostra desconto se maior que o base."
          />

          <div className="sm:col-span-2 border-t border-neutral-100 pt-6 mt-2">
            <PremiumInput 
              label="Comissão de Afiliados (%)" 
              name="affiliate_commission_pct" 
              type="number" 
              defaultValue="0" 
              min="0"
              max="90"
              helper="Percentagem da venda atribuída aos promotores (0 para desativar)."
            />
          </div>
        </div>
      </div>

      {/* SECÇÃO 3: Media & Recursos Visuais */}
      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
        <div className="bg-neutral-50 px-6 py-4 border-b border-neutral-200 flex items-center gap-3">
          <ImageIcon size={20} className="text-neutral-500" />
          <h3 className="font-bold text-[#111827]">Media e Apresentação</h3>
        </div>
        
        <div className="p-6 sm:p-8 grid sm:grid-cols-2 gap-8">
          
          <div className="sm:col-span-2 p-6 border border-neutral-200 bg-[#F8F9FA] rounded-xl relative">
            <label className="text-sm font-bold text-[#111827] mb-4 flex items-center gap-2">
              <ImageIcon size={16} className="text-neutral-500" />
              Capa do Produto (Imagem Principal)
            </label>
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <Uploader 
                  bucket="images" 
                  accept="image/jpeg,image/png,image/webp" 
                  label="Upload (16:9 preferencial)"
                  onSuccess={(url) => setImageUrl(url)}
                  isStorageActive={isStorageActive}
                  uploadType="photo"
                  platformEnabled={platformPhotoEnabled}
                />
              </div>
              <div className="flex flex-col justify-center">
                <MediaLinkInput
                  name="image_url_ext"
                  label="Ou Link Externo de Imagem"
                  placeholder="https://..."
                  type="image"
                  helper="Substitui o upload de ficheiro local."
                  onChange={(url) => setImageUrl(url)}
                />
              </div>
            </div>
            <input type="hidden" name="image_url" value={imageUrl} />
            {imageUrl && <p className="text-green-600 font-bold mt-4 text-sm text-center bg-green-50 py-2 rounded-lg border border-green-100">Capa do produto adicionada com sucesso.</p>}
          </div>

          <div className="sm:col-span-2 grid sm:grid-cols-2 gap-6">
            <PremiumInput 
              label="Vídeo de Vendas (Opcional)" 
              name="promo_video_url" 
              placeholder="Ex: Link do YouTube" 
            />
            
            <PremiumSelect 
              label="Fonte do Vídeo" 
              name="promo_media_source" 
              defaultValue="youtube"
              options={[
                { value: "youtube", label: "YouTube" },
                { value: "vimeo", label: "Vimeo" },
                { value: "google_drive", label: "Google Drive" },
                { value: "internal", label: isStorageActive ? "Storage Interno" : "Storage Interno (Requer Plano)", disabled: !isStorageActive },
                { value: "external_link", label: "Link Direto (MP4)" }
              ]}
            />
          </div>
        </div>
      </div>

      {/* SECÇÃO 4: Dinâmico por Tipo */}
      {(type === "book" || type === "audiobook" || type === "template" || type === "mentorship" || type === "event" || type === "community") && (
        <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden border-l-4 border-l-[#FF4500]">
          <div className="bg-neutral-50 px-6 py-4 border-b border-neutral-200 flex items-center gap-3">
            <Layers size={20} className="text-neutral-500" />
            <h3 className="font-bold text-[#111827]">Conteúdo Específico</h3>
          </div>
          <div className="p-6 sm:p-8">
            
            {type === "book" && (
              <div>
                <label className="text-sm font-bold text-[#111827] mb-3 block">Ficheiro PDF do E-book</label>
                <div className="max-w-md">
                  <Uploader 
                    bucket="books" 
                    accept="application/pdf" 
                    label="Selecionar PDF"
                    onSuccess={(path) => setPdfPath(path)}
                  />
                  <input type="hidden" name="pdf_path" value={pdfPath} />
                  {pdfPath && <p className="text-green-600 font-bold mt-3 text-sm">Ficheiro adicionado com sucesso.</p>}
                </div>
              </div>
            )}

            {type === "audiobook" && (
              <div>
                <label className="text-sm font-bold text-[#111827] mb-3 block">Ficheiro MP3 / Áudio</label>
                <div className="max-w-md">
                  <Uploader 
                    bucket="audio" 
                    accept="audio/mpeg,audio/wav" 
                    label="Selecionar Áudio"
                    onSuccess={(path) => setAudioPath(path)}
                  />
                  <input type="hidden" name="audio_path" value={audioPath} />
                  {audioPath && <p className="text-green-600 font-bold mt-3 text-sm">Áudio adicionado com sucesso.</p>}
                </div>
              </div>
            )}

            {type === "template" && (
              <div>
                <label className="text-sm font-bold text-[#111827] mb-3 block">Ficheiro do Template (ZIP, XLSX...)</label>
                <div className="max-w-md">
                  <Uploader 
                    bucket="templates" 
                    accept=".zip,.xlsx,.pdf" 
                    label="Selecionar Template"
                    onSuccess={(path) => setTemplatePath(path)}
                  />
                  <input type="hidden" name="template_path" value={templatePath} />
                  {templatePath && <p className="text-green-600 font-bold mt-3 text-sm">Template adicionado com sucesso.</p>}
                </div>
              </div>
            )}

            {(type === "mentorship" || type === "event") && (
              <PremiumInput 
                label="Link da Sala de Aula (Zoom, Meet, etc.)" 
                name="meeting_link" 
                type="url" 
                placeholder="https://..." 
              />
            )}

            {type === "community" && (
              <PremiumInput 
                label="Link do Grupo de Acesso" 
                name="community_link" 
                type="url" 
                placeholder="https://chat.whatsapp.com/..." 
              />
            )}

          </div>
        </div>
      )}

      {/* SECÇÃO 5: Vendas Avançado (Público-alvo, vantagens) */}
      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
        <div className="bg-neutral-50 px-6 py-4 border-b border-neutral-200 flex items-center gap-3">
          <Users size={20} className="text-neutral-500" />
          <h3 className="font-bold text-[#111827]">Checkout & Vendas (Opcional)</h3>
        </div>
        
        <div className="p-6 sm:p-8 grid sm:grid-cols-2 gap-6">
          <PremiumTextarea 
            label="Público-alvo" 
            name="target_audience" 
            rows={3} 
            placeholder="Para quem é este produto?" 
          />
          
          <PremiumTextarea 
            label="Vantagens do Produto" 
            name="advantages" 
            rows={3} 
            placeholder="Ex: Certificado incluído&#10;Acesso 24/7..." 
            helper="Uma por linha."
          />

          <div className="sm:col-span-2 mt-2">
            <PremiumInput 
              label="Página de Vendas Externa (URL)" 
              name="external_sales_url" 
              placeholder="https://" 
              helper="Se preferires usar uma Landing Page própria fora da plataforma."
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4 mb-10">
        <button 
          type="submit" 
          className="bg-[#FF4500] hover:bg-[#E03E00] text-white font-bold py-4 px-10 rounded-xl shadow-md transition-colors text-lg flex items-center gap-2"
        >
          Criar Produto e Continuar
        </button>
      </div>

    </ClientForm>
  )
}
