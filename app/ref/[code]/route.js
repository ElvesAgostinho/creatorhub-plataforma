import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// We use a service role client here if RLS blocks anonymous reads of affiliate links,
// but our migration says "Anyone can read affiliate links", so standard client is fine.
// Actually, standard client requires cookies, so let's just do a direct fetch or use supabase-js without auth.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function GET(request, { params }) {
  const code = params.code

  if (!code) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Find the affiliate link by code
  const { data: link, error } = await supabase
    .from('affiliate_links')
    .select('affiliate_id, product_id, destination_type, destination_url, products(slug)')
    .eq('code', code)
    .single()

  if (error || !link) {
    console.error('Affiliate link not found:', error)
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Determine redirect URL
  let redirectUrl = '/'
  
  if (link.destination_type === 'product_page' && link.products?.slug) {
    redirectUrl = new URL(`/product/${link.products.slug}`, request.url).toString()
  } else if (link.destination_type === 'direct_checkout' && link.products?.slug) {
    redirectUrl = new URL(`/checkout/${link.products.slug}`, request.url).toString()
  } else if (link.destination_url) {
    // For creator_external_site or creator_social
    redirectUrl = link.destination_url
  } else {
    // Fallback
    redirectUrl = new URL('/', request.url).toString()
  }

  // Create response with redirect
  const response = NextResponse.redirect(redirectUrl)

  // Set Affiliate Tracking Cookies (valid for 60 days)
  const maxAge = 60 * 60 * 24 * 60 // 60 days
  
  response.cookies.set('ch_affiliate_id', link.affiliate_id, {
    maxAge: maxAge,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  })

  response.cookies.set('ch_affiliate_product', link.product_id, {
    maxAge: maxAge,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  })

  return response
}
