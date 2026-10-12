import { NextResponse } from "next/server"
import { lerSessao, NOME_COOKIE } from "./session"

/**
 * Middleware — corre no runtime Edge.
 *
 * Por isso este ficheiro não pode importar o driver do Postgres nem nada do
 * módulo node:crypto. Só a leitura do token assinado, que a Web Crypto faz.
 *
 * O que estava aqui antes ia à base de dados buscar o perfil em cada pedido.
 * Agora o papel e o estado viajam dentro do token, e isto não toca na base de
 * dados nenhuma vez.
 *
 * Nota: o token pode ficar desatualizado se o papel mudar a meio da sessão.
 * Por isso isto é só um atalho rápido — as páginas e as ações voltam a
 * confirmar as permissões contra a base de dados, em lib/auth.
 */

const ROTAS_PROTEGIDAS = ["/dashboard", "/admin", "/library", "/learn", "/club", "/inbox", "/affiliate-panel"]

export async function updateSession(request) {
  const response = NextResponse.next({ request })
  const caminho = request.nextUrl.pathname

  // Cookie de afiliado a partir do ?ref= na URL
  const ref = request.nextUrl.searchParams.get("ref")
  if (ref) {
    response.cookies.set("ch_affiliate_ref", ref, {
      maxAge: 60 * 60 * 24 * 60,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    })
  }

  const sessao = await lerSessao(request.cookies.get(NOME_COOKIE)?.value)

  // Já tem sessão e tenta ir para o login ou registo
  if (sessao && (caminho.startsWith("/login") || caminho.startsWith("/signup"))) {
    const url = request.nextUrl.clone()
    url.pathname = "/dashboard"
    url.search = ""
    return NextResponse.redirect(url)
  }

  if (sessao) {
    const protegida = ROTAS_PROTEGIDAS.some((r) => caminho.startsWith(r))
    if (protegida && caminho !== "/pending" && sessao.estado === "pending" && sessao.papel !== "admin") {
      const url = request.nextUrl.clone()
      url.pathname = "/pending"
      url.search = ""
      return NextResponse.redirect(url)
    }
  }

  return response
}
