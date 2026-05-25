import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // chamado a partir de Server Component — ignorar (middleware refresca)
          }
        }
      }
    }
  )
}

export function createServiceClient() {
  // ATENÇÃO: ignora RLS — usar apenas em route handlers de webhook ou admin tasks.
  // Fallback para a chave anon para evitar que a aplicação crash (Error 500) se o utilizador esquecer de definir SUPABASE_SERVICE_ROLE_KEY no Vercel
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    key,
    {
      cookies: {
        getAll() { return [] },
        setAll() {}
      }
    }
  )
}
