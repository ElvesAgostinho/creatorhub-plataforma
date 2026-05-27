"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { hasActivePurchase } from "@/lib/data/products"

export async function submitReview(productId, rating, comment) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: "Precisas de iniciar sessão para avaliar." }
  }
  
  if (rating < 1 || rating > 5) {
    return { error: "A classificação deve estar entre 1 e 5." }
  }

  // Verificar se comprou o produto
  const owned = await hasActivePurchase(productId)
  if (!owned) {
    return { error: "Apenas quem comprou o produto pode submeter uma avaliação." }
  }

  const { error } = await supabase
    .from("product_reviews")
    .upsert({
      product_id: productId,
      user_id: user.id,
      rating,
      comment: comment?.trim() || null
    }, {
      onConflict: 'product_id,user_id'
    })

  if (error) {
    console.error("Erro a guardar review:", error)
    return { error: "Erro ao guardar a avaliação." }
  }

  revalidatePath(`/product/[slug]`, "page")
  return { success: true }
}
