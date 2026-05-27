"use client"

import { useState } from "react"
import { createProduct } from "@/app/admin/products/actions"
import Uploader from "@/components/Uploader"
import { PremiumInput, PremiumSelect, PremiumTextarea, PremiumButton } from "@/components/PremiumForms"
import { categoryTree } from "@/lib/data/categories"
import ClientForm from "@/components/ClientForm"

export default function CreateProductForm({ isStorageActive }) {
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
    <ClientForm action={createProduct} className="mt-8 grid sm:grid-cols-2 gap-6 bg-white" successMessage="Infoproduto criado com sucesso!">
      <PremiumSelect 
        label="Categoria Principal" 
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
      
      <PremiumSelect 
        label="Formato do Produto" 
        name="type" 
        value={type} 
        onChange={e => setType(e.target.value)}
        options={[
          { value: "course", label: "Curso Online" },
          { value: "book", label: "E-book / PDF" },
          { value: "mentorship", label: "Mentoria / Consultoria" },
          { value: "event", label: "Evento / Workshop" },
          { value: "community", label: "Comunidade Privada" },
          { value: "audiobook", label: "Audiobook / Podcast" },
          { value: "template", label: "Templates / Planilhas" }
        ]}
      />

      <PremiumSelect 
        label="Nível de Dificuldade" 
        name="level" 
        options={[
          { value: "", label: "Para Todos os Níveis" },
          { value: "iniciante", label: "Iniciante" },
          { value: "intermediario", label: "Intermediário" },
          { value: "avancado", label: "Avançado" }
        ]}
      />

      <div className="sm:col-span-2">
        <PremiumInput 
          label="Título do Produto" 
          name="title" 
          required 
          placeholder="Ex: O Código da Riqueza"
          helper="Escolhe um nome magnético que chame a atenção."
        />
      </div>
      
      {/* PREÇO & AFILIADOS */}
      <PremiumInput 
        label="Preço Atual (Kz)" 
        name="price" 
        type="number" 
        defaultValue="0" 
        helper="O valor real que os alunos vão pagar hoje."
      />
      
      <PremiumInput 
        label="Preço Original (Kz)" 
        name="original_price" 
        type="number" 
        defaultValue="0" 
        helper="Opcional. Preço riscado para mostrar um desconto."
      />

      <div className="sm:col-span-2">
        <PremiumInput 
          label="Comissão para Afiliados (%)" 
          name="affiliate_commission_pct" 
          type="number" 
          defaultValue="0" 
          min="0"
          max="90"
          helper="Quanto pagas aos afiliados por cada venda. Podes colocar 0 se não quiseres afiliados."
        />
      </div>

      {/* CHECKOUT & AFILIADOS */}
      <div className="sm:col-span-2 border-t border-neutral-100 pt-6 mt-2 grid sm:grid-cols-2 gap-6">
        <h3 className="sm:col-span-2 font-bold text-lg text-neutral-800">Checkout & Detalhes</h3>

        <div className="sm:col-span-2">
          <PremiumTextarea 
            label="Para quem é este curso? (Público-alvo)" 
            name="target_audience" 
            rows={3} 
            placeholder="Ex: Criadores de conteúdo, designers, iniciantes..." 
          />
        </div>
        
        <div className="sm:col-span-2">
          <PremiumTextarea 
            label="Vantagens do Produto" 
            name="advantages" 
            rows={3} 
            placeholder="Ex: Certificado incluído&#10;Acesso vitalício&#10;Suporte direto..." 
            helper="Uma vantagem por linha."
          />
        </div>

        <PremiumInput 
          label="Vídeo Promocional (URL)" 
          name="promo_video_url" 
          placeholder="Link do YouTube, Vimeo, Drive..." 
        />
        
        <PremiumSelect 
          label="Fonte do Vídeo Promocional" 
          name="promo_media_source" 
          defaultValue="youtube"
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
            placeholder="Ex: https://meusite.com/curso" 
            helper="Se tiveres uma página de vendas fora da plataforma."
          />
        </div>
      </div>


      {/* CAPA */}
      <div className="sm:col-span-2 mt-4 p-6 border-2 border-dashed border-neutral-300 bg-neutral-50 rounded-2xl">
        <Uploader 
          bucket="images" 
          accept="image/jpeg,image/png,image/webp" 
          label="Upload da Imagem de Capa (Formato 16:9)"
          onSuccess={(url) => setImageUrl(url)}
        />
        <input type="hidden" name="image_url" value={imageUrl} />
        {imageUrl && <p className="text-green-600 font-bold mt-2 text-sm text-center">✅ Imagem carregada com sucesso!</p>}
      </div>

      {/* DYNAMIC FORMS BASED ON TYPE */}
      {type === "book" && (
        <div className="sm:col-span-2 p-6 border-2 border-neutral-200 bg-neutral-100 rounded-2xl mt-2">
          <label className="text-sm font-extrabold text-neutral-800 mb-2 block">Upload do E-book (PDF)</label>
          <Uploader 
            bucket="books" 
            accept="application/pdf" 
            label="Anexar Ficheiro PDF"
            onSuccess={(path) => setPdfPath(path)}
          />
          <input type="hidden" name="pdf_path" value={pdfPath} />
          {pdfPath && <p className="text-green-600 font-bold mt-2 text-sm">✅ Ficheiro guardado!</p>}
        </div>
      )}

      {type === "audiobook" && (
        <div className="sm:col-span-2 p-6 border-2 border-neutral-200 bg-neutral-100 rounded-2xl mt-2">
          <label className="text-sm font-extrabold text-neutral-800 mb-2 block">Upload do Audiobook (MP3/WAV)</label>
          <Uploader 
            bucket="audio" 
            accept="audio/mpeg,audio/wav" 
            label="Anexar Áudio"
            onSuccess={(path) => setAudioPath(path)}
          />
          <input type="hidden" name="audio_path" value={audioPath} />
        </div>
      )}

      {type === "template" && (
        <div className="sm:col-span-2 p-6 border-2 border-neutral-200 bg-neutral-100 rounded-2xl mt-2">
          <label className="text-sm font-extrabold text-neutral-800 mb-2 block">Ficheiro do Template (ZIP, XLSX, PDF)</label>
          <Uploader 
            bucket="templates" 
            accept=".zip,.xlsx,.pdf" 
            label="Anexar Template"
            onSuccess={(path) => setTemplatePath(path)}
          />
          <input type="hidden" name="template_path" value={templatePath} />
        </div>
      )}

      {(type === "mentorship" || type === "event") && (
        <div className="sm:col-span-2">
          <PremiumInput 
            label="Link de Acesso (Zoom, Meet, Teams)" 
            name="meeting_link" 
            type="url" 
            placeholder="https://zoom.us/j/123456789" 
            helper="Onde a sala de aula ao vivo vai acontecer."
          />
        </div>
      )}

      {type === "community" && (
        <div className="sm:col-span-2">
          <PremiumInput 
            label="Link de Convite do Grupo" 
            name="community_link" 
            type="url" 
            placeholder="https://chat.whatsapp.com/..." 
            helper="WhatsApp, Telegram ou Servidor Discord."
          />
        </div>
      )}

      <div className="sm:col-span-2">
        <PremiumTextarea 
          label="Descrição Detalhada do Produto" 
          name="description" 
          rows={5} 
          placeholder="O que é que os alunos vão ganhar com este conteúdo? Promete a transformação." 
          helper="Usa um tom persuasivo. Pensa nisto como a tua carta de vendas."
        />
      </div>
      
      <div className="sm:col-span-2 mt-6">
        <PremiumButton type="submit" variant="orange">
          Lançar Infoproduto 🚀
        </PremiumButton>
      </div>
    </ClientForm>
  )
}
