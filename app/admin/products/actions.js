"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { createClient, createServiceClient } from "@/lib/supabase/server"

async function assertAdmin() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Não autenticado.")
  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).maybeSingle()
  if (!profile || (profile.role !== "admin" && profile.role !== "creator")) {
    throw new Error("Sem permissões.")
  }
  return { user, profile }
}

async function verifyOwnership(svc, user, profile, productId) {
  if (profile.role === "admin") return;
  if (!productId) throw new Error("ID do produto inválido.");
  const { data } = await svc.from("products").select("created_by").eq("id", productId).single();
  if (data?.created_by !== user.id) {
    throw new Error("Acesso negado: Este produto não lhe pertence.");
  }
}

function slugify(s = "") {
  return s.toString()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
}

export async function createProduct(formData) {
  const { user, profile } = await assertAdmin()
  const svc = createServiceClient()

  const type = formData.get("type")
  const category = formData.get("category")?.toString() || null
  const subcategory = formData.get("subcategory")?.toString() || null
  const title = formData.get("title")?.toString().trim()
  if (!title) return { ok: false, error: "Título obrigatório." }
  const slugInput = formData.get("slug")?.toString().trim()
  const slug = slugInput ? slugify(slugInput) : slugify(title)
  const description = formData.get("description")?.toString() || null
  const image_url = formData.get("image_url")?.toString() || null
  const price = Number(formData.get("price") || 0)
  const original_price = Number(formData.get("original_price") || price)
  const discount = original_price > price
    ? Math.round((1 - price / original_price) * 100)
    : 0
  const level = formData.get("level")?.toString() || null

  const promo_media_source = formData.get("promo_media_source")?.toString() || "youtube"
  const promo_video_url = formData.get("promo_video_url")?.toString() || null

  // Verificar subscrição de storage se o vídeo promocional for "internal"
  if (promo_media_source === "internal" && promo_video_url?.startsWith("storage:")) {
    if (profile.role !== "admin") {
      const { data: billing } = await svc.from("creator_storage_billing").select("status").eq("user_id", user.id).maybeSingle()
      if (!billing || billing.status !== "active") {
        throw new Error("Não tem permissão para usar o Storage Interno. Por favor, adira ao plano pago no menu Alojamento.")
      }
    }
  }

  const { data, error } = await svc.from("products").insert({
    slug,
    type,
    category,
    subcategory,
    title,
    description,
    image_url,
    price_cents: Math.round(price * 100),
    original_price_cents: Math.round(original_price * 100),
    discount_pct: discount,
    level,
    affiliate_commission_pct: Number(formData.get("affiliate_commission_pct") || 0),
    target_audience: formData.get("target_audience")?.toString() || null,
    advantages: formData.get("advantages")?.toString() || null,
    promo_video_url,
    promo_media_source,
    external_sales_url: formData.get("external_sales_url")?.toString() || null,
    published: profile.role === "admin",
    created_by: user.id
  }).select("id").single()

  if (error) throw new Error(error.message)
  
  const product_id = data.id
  let finalImageUrl = formData.get("image_url")?.toString() || formData.get("manual_image_url")?.toString() || image_url
  let finalPdfPath = formData.get("pdf_path")?.toString() || null

  let patchInsert = {}
  if (finalImageUrl !== image_url) patchInsert.image_url = finalImageUrl
  if (finalPdfPath) patchInsert.file_path = finalPdfPath

  if (Object.keys(patchInsert).length > 0) {
    await svc.from("products").update(patchInsert).eq("id", product_id)
  }

  revalidatePath("/")
  revalidatePath("/admin/products")
  redirect(`/admin/products/${data.id}`)
}

export async function updateProduct(formData) {
  const { user, profile } = await assertAdmin()
  const svc = createServiceClient()
  const id = formData.get("id")
  if (!id) return { ok: false, error: "ID em falta." }
  await verifyOwnership(svc, user, profile, id)

  const title = formData.get("title")?.toString().trim()
  const price = Number(formData.get("price") || 0)
  const original_price = Number(formData.get("original_price") || price)
  const discount = original_price > price
    ? Math.round((1 - price / original_price) * 100)
    : 0
  const level = formData.get("level")?.toString() || null

  let affiliate_extra_links = [];
  const extraLinksRaw = formData.get("affiliate_extra_links")?.toString();
  if (extraLinksRaw) {
    try {
      if (extraLinksRaw.trim().startsWith("[")) {
        affiliate_extra_links = JSON.parse(extraLinksRaw);
      } else {
        affiliate_extra_links = extraLinksRaw.split('\n').map(line => {
          const parts = line.split('|');
          if (parts.length >= 2) {
            return { label: parts[0].trim(), url: parts.slice(1).join('|').trim() };
          }
          return null;
        }).filter(Boolean);
      }
    } catch(e) {}
  }

  const patch = {
    title,
    description: formData.get("description")?.toString() || null,
    image_url: formData.get("image_url")?.toString() || null,
    price_cents: Math.round(price * 100),
    original_price_cents: Math.round(original_price * 100),
    discount_pct: discount,
    level,
    affiliate_commission_pct: Number(formData.get("affiliate_commission_pct") || 0),
    best_seller: !!formData.get("best_seller"),
    event_starts_at: formData.get("event_starts_at")?.toString() || null,
    event_meeting_url: formData.get("event_meeting_url")?.toString() || null,
    youtube_preview_url: formData.get("youtube_preview_url")?.toString() || null,
    community_url: formData.get("community_url")?.toString() || null,
    target_audience: formData.get("target_audience")?.toString() || null,
    advantages: formData.get("advantages")?.toString() || null,
    promo_video_url: formData.get("promo_video_url")?.toString() || null,
    promo_media_source: formData.get("promo_media_source")?.toString() || "internal",
    external_sales_url: formData.get("external_sales_url")?.toString() || null,
    affiliate_training_video: formData.get("affiliate_training_video")?.toString() || null,
    affiliate_materials_link: formData.get("affiliate_materials_link")?.toString() || null,
    affiliate_extra_links,
  }

  // Verificar subscrição de storage se o vídeo promocional for "internal"
  if (patch.promo_media_source === "internal" && patch.promo_video_url?.startsWith("storage:")) {
    if (profile.role !== "admin") {
      const { data: billing } = await svc.from("creator_storage_billing").select("status").eq("user_id", user.id).maybeSingle()
      if (!billing || billing.status !== "active") {
        throw new Error("Não tem permissão para usar o Storage Interno. Por favor, adira ao plano pago no menu Alojamento.")
      }
    }
  }

  if (profile.role === "admin") {
    patch.published = !!formData.get("published")
  }

  const { error } = await svc.from("products").update(patch).eq("id", id)
  if (error) throw new Error(error.message)

  revalidatePath("/")
  revalidatePath(`/admin/products/${id}`)
  return { ok: true }
}

export async function deleteProduct(formData) {
  const { user, profile } = await assertAdmin()
  const svc = createServiceClient()
  const id = formData.get("id")
  if (!id) return { ok: false, error: "ID em falta." }
  await verifyOwnership(svc, user, profile, id)
  const { error } = await svc.from("products").delete().eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/admin/products")
  revalidatePath("/")
  redirect("/admin/products")
}

// ---------- Cover image ----------
export async function uploadProductImage(formData) {
  const { user, profile } = await assertAdmin()
  const svc = createServiceClient()
  const product_id = formData.get("product_id")
  const publicUrl = formData.get("image_url")
  if (!product_id || !publicUrl) return { ok: false, error: "Dados em falta." }
  await verifyOwnership(svc, user, profile, product_id)

  // apaga a anterior se estiver no nosso bucket
  const { data: prev } = await svc.from("products").select("image_url").eq("id", product_id).maybeSingle()
  if (prev?.image_url && prev.image_url.includes("/storage/v1/object/public/images/")) {
    const prevPath = prev.image_url.split("/storage/v1/object/public/images/")[1]
    if (prevPath) await svc.storage.from("images").remove([prevPath])
  }

  const { error: pe } = await svc.from("products").update({ image_url: publicUrl }).eq("id", product_id)
  if (pe) return { ok: false, error: pe.message }
  revalidatePath(`/admin/products/${product_id}`)
  revalidatePath("/")
  return { ok: true }
}

// ---------- Modules (courses) ----------
export async function addModule(formData) {
  const { user, profile } = await assertAdmin()
  const svc = createServiceClient()
  const product_id = formData.get("product_id")
  const title = formData.get("title")?.toString().trim()
  if (!product_id || !title) return { ok: false, error: "Campos obrigatórios em falta." }
  await verifyOwnership(svc, user, profile, product_id)

  const { data: maxPos } = await svc.from("modules")
    .select("position").eq("product_id", product_id)
    .order("position", { ascending: false }).limit(1).maybeSingle()
  const position = (maxPos?.position || 0) + 1

  const { error } = await svc.from("modules").insert({ product_id, title, position })
  if (error) throw new Error(error.message)
  revalidatePath(`/admin/products/${product_id}`)
  return { ok: true }
}

export async function deleteModule(formData) {
  const { user, profile } = await assertAdmin()
  const svc = createServiceClient()
  const id = formData.get("id")
  const product_id = formData.get("product_id")
  if (!id) return { ok: false, error: "ID em falta." }
  await verifyOwnership(svc, user, profile, product_id)
  
  const { error } = await svc.from("modules").delete().eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath(`/admin/products/${product_id}`)
  return { ok: true }
}

// ---------- Lessons (courses) ----------
export async function addLesson(formData) {
  const { user, profile } = await assertAdmin()
  const svc = createServiceClient()
  const module_id = formData.get("module_id")
  const product_id = formData.get("product_id") // needed for revalidate
  const title = formData.get("title")?.toString().trim()
  if (!module_id || !title) return { ok: false, error: "Campos obrigatórios em falta." }
  await verifyOwnership(svc, user, profile, product_id)

  let video_url = formData.get("video_url")?.toString() || null
  let duration_seconds = Number(formData.get("duration_seconds") || 0)
  let pdf_url = formData.get("pdf_url")?.toString() || null

  // O cliente (Uploader) vai enviar o caminho do ficheiro carregado em "uploaded_video_path"
  const uploadedPath = formData.get("uploaded_video_path")
  if (uploadedPath && typeof uploadedPath === "string") {
    video_url = uploadedPath // Já formatado como "storage:lessons/..." pelo Uploader
  }

  const { data: maxPos } = await svc.from("lessons")
    .select("position").eq("module_id", module_id)
    .order("position", { ascending: false }).limit(1).maybeSingle()
  const position = (maxPos?.position || 0) + 1

  const media_source = formData.get("media_source")?.toString() || "internal"
  let external_media_url = formData.get("external_media_url")?.toString() || null

  // Verificar subscrição de storage se a aula for usar o storage interno
  if (media_source === "internal" && profile.role !== "admin") {
    const { data: billing } = await svc.from("creator_storage_billing").select("status").eq("user_id", user.id).maybeSingle()
    if (!billing || billing.status !== "active") {
      throw new Error("Não tem permissão para hospedar vídeos no Storage Interno. Por favor, adira ao plano pago no menu Alojamento.")
    }
  }

  const { error } = await svc.from("lessons").insert({
    module_id,
    title,
    description: formData.get("description")?.toString() || null,
    video_url,
    media_source,
    external_media_url,
    pdf_url,
    duration_seconds,
    position,
    is_preview: !!formData.get("is_preview")
  })
  if (error) throw new Error(error.message)
  revalidatePath(`/admin/products/${product_id}`)
  revalidatePath(`/learn`)
  return { ok: true }
}

export async function deleteLesson(formData) {
  const { user, profile } = await assertAdmin()
  const svc = createServiceClient()
  const id = formData.get("id")
  const product_id = formData.get("product_id")
  if (!id) return { ok: false, error: "ID em falta." }
  await verifyOwnership(svc, user, profile, product_id)

  // se vídeo está em storage, apaga o objeto
  const { data: lesson } = await svc.from("lessons").select("video_url").eq("id", id).maybeSingle()
  if (lesson?.video_url?.startsWith("storage:lessons/")) {
    const path = lesson.video_url.slice("storage:lessons/".length)
    await svc.storage.from("lessons").remove([path])
  }
  const { error } = await svc.from("lessons").delete().eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath(`/admin/products/${product_id}`)
  return { ok: true }
}

// ---------- Books (PDF) ----------
export async function uploadBookPdf(formData) {
  const { user, profile } = await assertAdmin()
  const svc = createServiceClient()
  const product_id = formData.get("product_id")
  const path = formData.get("pdf_path")
  if (!product_id || !path) return { ok: false, error: "Ficheiro em falta." }
  await verifyOwnership(svc, user, profile, product_id)

  // remove o anterior se existia
  const { data: prev } = await svc.from("products").select("file_path").eq("id", product_id).maybeSingle()
  if (prev?.file_path) {
    await svc.storage.from("books").remove([prev.file_path])
  }
  const { error: pe } = await svc.from("products").update({ file_path: path }).eq("id", product_id)
  if (pe) return { ok: false, error: pe.message }
  revalidatePath(`/admin/products/${product_id}`)
  return { ok: true }
}

// ---------- Mentorship slots ----------
export async function addSlot(formData) {
  const { user, profile } = await assertAdmin()
  const svc = createServiceClient()
  const product_id = formData.get("product_id")
  const starts_at = formData.get("starts_at")?.toString()
  const duration_minutes = Number(formData.get("duration_minutes") || 60)
  if (!product_id || !starts_at) return { ok: false, error: "Campos obrigatórios em falta." }
  await verifyOwnership(svc, user, profile, product_id)

  const { error } = await svc.from("mentorship_slots").insert({
    product_id,
    starts_at,
    duration_minutes,
    status: "available"
  })
  if (error) throw new Error(error.message)
  revalidatePath(`/admin/products/${product_id}`)
  revalidatePath(`/book`)
  return { ok: true }
}

export async function deleteSlot(formData) {
  const { user, profile } = await assertAdmin()
  const svc = createServiceClient()
  const id = formData.get("id")
  const product_id = formData.get("product_id")
  await verifyOwnership(svc, user, profile, product_id)
  const { error } = await svc.from("mentorship_slots").delete().eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath(`/admin/products/${product_id}`)
  return { ok: true }
}
