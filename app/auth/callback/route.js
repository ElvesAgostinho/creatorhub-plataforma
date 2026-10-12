import { NextResponse } from "next/server"
import { consumirFicha, abrirSessao } from "@/lib/auth"

/**
 * Confirmação de email.
 *
 * Esta rota era o retorno do fluxo OAuth da Supabase. Com a autenticação
 * própria, passa a servir as ligações de confirmação de email: a ficha vem no
 * endereço, é gasta aqui, e a sessão abre.
 */
export async function GET(request) {
  const { searchParams, origin } = new URL(request.url)
  const ficha = searchParams.get("token") || searchParams.get("code")
  const seguinte = searchParams.get("next") ?? "/dashboard"

  if (!ficha) {
    return NextResponse.redirect(`${origin}/login?error=ligacao_invalida`)
  }

  const userId = await consumirFicha(ficha, "confirmacao_email")
  if (!userId) {
    return NextResponse.redirect(`${origin}/login?error=ligacao_expirada`)
  }

  await abrirSessao(userId)
  return NextResponse.redirect(`${origin}${seguinte}`)
}
