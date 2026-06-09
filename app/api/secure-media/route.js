import { NextResponse } from "next/server"
import { createClient, createServiceClient } from "@/lib/supabase/server"

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const bucket = searchParams.get("bucket")
  const path = searchParams.get("path")
  const lessonId = searchParams.get("lessonId")
  const productId = searchParams.get("productId")

  if (!bucket || !path || !lessonId || !productId) {
    return new NextResponse("Missing parameters", { status: 400 })
  }

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const svc = createServiceClient()

  // Verify access (admin or purchased)
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle()
  let hasAccess = profile?.role === "admin"

  if (!hasAccess) {
    const { data: purchase } = await svc
      .from("purchases")
      .select("status")
      .eq("user_id", user.id)
      .eq("product_id", productId)
      .eq("status", "active")
      .maybeSingle()
    
    if (purchase) hasAccess = true
  }

  if (!hasAccess) {
    return new NextResponse("Forbidden", { status: 403 })
  }

  // Generate signed URL (expires in 2 hours)
  const { data, error } = await svc.storage
    .from(bucket)
    .createSignedUrl(path, 7200)

  if (error || !data?.signedUrl) {
    console.error("Error generating signed URL:", error)
    return new NextResponse("Error generating secure link", { status: 500 })
  }

  // Redirect the video player / browser to the secure signed URL
  return NextResponse.redirect(data.signedUrl)
}
