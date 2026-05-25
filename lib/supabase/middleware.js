import { createServerClient } from "@supabase/ssr"
import { NextResponse } from "next/server"

export async function updateSession(request) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        }
      }
    }
  )

  // Triggera refresh do token se necessário
  const { data: { user } } = await supabase.auth.getUser()

  // Redirecionamento para utilizadores logados a tentar aceder a login/signup
  const path = request.nextUrl.pathname
  
  if (user && (path.startsWith('/login') || path.startsWith('/signup'))) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // Redirecionamento para utilizadores pendentes
  if (user) {
    const isProtected = path.startsWith('/dashboard') || path.startsWith('/admin') || path.startsWith('/library') || path.startsWith('/course') || path.startsWith('/academy') || path.startsWith('/club')
    
    if (isProtected && path !== '/pending') {
      const { data: profile } = await supabase.from('profiles').select('status, role').eq('id', user.id).single()
      
      if (profile?.status === 'pending' && profile?.role !== 'admin') {
        const url = request.nextUrl.clone()
        url.pathname = '/pending'
        return NextResponse.redirect(url)
      }
    }
  }

  return response
}
