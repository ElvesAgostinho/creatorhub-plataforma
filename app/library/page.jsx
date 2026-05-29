import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getMyPurchases } from "@/lib/data/products"
import { getCourseProgressPercentages } from "@/lib/data/lessons"
import LibraryClientView from "./LibraryClientView"

export const dynamic = "force-dynamic"

export default async function Library() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login?next=/library")

  const items = await getMyPurchases()
  const courseIds = items.filter(it => it.product.type === "course").map(it => it.product.id)
  const progressMap = await getCourseProgressPercentages(courseIds)

  return <LibraryClientView items={items} progressMap={progressMap} />
}
