// Importado pelos caminhos específicos: o ponto de entrada principal do jose
// arrasta o código de JWE comprimido, que usa CompressionStream e não existe
// no runtime Edge — dava aviso em cada compilação, para nada.
import { SignJWT } from "jose/jwt/sign"
import { jwtVerify } from "jose/jwt/verify"

/**
 * Sessão num cookie assinado.
 *
 * Este ficheiro não pode importar nada do Node: é usado pelo middleware, que
 * corre no runtime Edge. Usa só a biblioteca jose, que assenta na Web Crypto.
 *
 * O token leva o papel e o estado do utilizador lá dentro, para o middleware
 * poder decidir redirecionamentos sem ir à base de dados — hoje faz uma
 * consulta em cada pedido.
 */

export const NOME_COOKIE = "above_sessao"
export const DURACAO_DIAS = 30

function segredo() {
  const s = process.env.AUTH_SECRET
  if (!s || s.length < 32) {
    throw new Error(
      "AUTH_SECRET em falta ou demasiado curta. Gera 32+ caracteres aleatórios e define a variável no .env.local e no EasyPanel."
    )
  }
  return new TextEncoder().encode(s)
}

export async function assinarSessao({ userId, sessaoId, papel, estado, email }) {
  return new SignJWT({ sid: sessaoId, papel, estado, email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${DURACAO_DIAS}d`)
    .sign(segredo())
}

/** Devolve o conteúdo do token, ou null se for inválido, adulterado ou expirado. */
export async function lerSessao(token) {
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, segredo(), { algorithms: ["HS256"] })
    return {
      userId: payload.sub,
      sessaoId: payload.sid,
      papel: payload.papel || "student",
      estado: payload.estado || "active",
      email: payload.email || null,
      expiraEm: payload.exp,
    }
  } catch {
    return null
  }
}

export function opcoesCookie() {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: DURACAO_DIAS * 24 * 60 * 60,
  }
}
