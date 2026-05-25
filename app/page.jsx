import { createClient } from "@/lib/supabase/server"
import LandingPage from "@/components/LandingPage"

// Página pública — cache de 30 segundos. Muito mais rápido que force-dynamic
export const revalidate = 30

export default async function Home() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Se o utilizador tiver login feito, o Header mostra os botões para a Dashboard.
  // Permite ver a Landing Page pública mesmo estando logado.

  // Pass user to LandingPage to conditionally render buttons
  return <LandingPage user={user} />
}
