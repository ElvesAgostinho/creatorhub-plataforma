import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import LandingPage from "@/components/LandingPage"

export const dynamic = "force-dynamic"

export default async function Home() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Se o utilizador tiver login feito, o Header mostra os botões para a Dashboard.
  // Permite ver a Landing Page pública mesmo estando logado.

  // Se for visitante anónimo, mostra a nova Landing Page super vendedora
  return <LandingPage />
}
