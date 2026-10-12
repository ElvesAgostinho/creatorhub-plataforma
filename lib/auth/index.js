import { cookies, headers } from "next/headers"
import { sql } from "@/lib/db/pool"
import { criarResumo, verificarResumo, gerarFicha } from "./password"
import { assinarSessao, lerSessao, NOME_COOKIE, opcoesCookie, DURACAO_DIAS } from "./session"
import { createHash } from "node:crypto"

/**
 * Autenticação própria, com a mesma forma de resposta que o código já espera:
 * { data: { user }, error }.
 *
 * A diferença importante para o que havia antes: a autorização deixou de estar
 * nas políticas de RLS da base de dados e passou para aqui. Quem chama tem de
 * verificar o papel — ver exigirAdmin() e exigirCriador() no fim do ficheiro.
 */

function resumoFicha(ficha) {
  return createHash("sha256").update(ficha).digest("hex")
}

function paraUtilizador(linha) {
  if (!linha) return null
  return {
    id: linha.id,
    email: linha.email,
    created_at: linha.created_at,
    last_sign_in_at: linha.last_sign_in_at,
    email_confirmed_at: linha.email_confirmed_at,
    user_metadata: linha.raw_user_meta_data || {},
  }
}

// ---------------------------------------------------------------- leitura

/**
 * Quem está autenticado neste pedido.
 * Confirma o token e, por omissão, confirma também que a sessão não foi
 * revogada — é isso que faz "terminar sessão em todos os dispositivos" e a
 * suspensão de contas terem efeito imediato.
 */
export async function getUser({ verificarRevogacao = true } = {}) {
  const token = cookies().get(NOME_COOKIE)?.value
  const sessao = await lerSessao(token)
  if (!sessao) return { data: { user: null }, error: null }

  try {
    return await lerUtilizadorDaSessao(sessao, verificarRevogacao)
  } catch (e) {
    // Base de dados em baixo: tratar como "sem sessão" em vez de rebentar a
    // página inteira. O erro fica no registo para quem está a diagnosticar.
    console.error("[auth] não foi possível confirmar a sessão:", e.message)
    return { data: { user: null }, error: { message: "Serviço indisponível." } }
  }
}

async function lerUtilizadorDaSessao(sessao, verificarRevogacao) {
  if (verificarRevogacao) {
    const { rows } = await sql(
      `SELECT s.id, u.banned_until
         FROM auth.sessions s
         JOIN auth.users u ON u.id = s.user_id
        WHERE s.id = $1 AND s.revoked_at IS NULL AND s.expires_at > now()`,
      [sessao.sessaoId]
    )
    if (rows.length === 0) return { data: { user: null }, error: null }
    if (rows[0].banned_until && new Date(rows[0].banned_until) > new Date()) {
      return { data: { user: null }, error: { message: "Conta suspensa." } }
    }
    // Marca atividade sem bloquear a resposta
    sql(`UPDATE auth.sessions SET last_seen_at = now() WHERE id = $1`, [sessao.sessaoId]).catch(() => {})
  }

  const { rows } = await sql(`SELECT * FROM auth.users WHERE id = $1`, [sessao.userId])
  return { data: { user: paraUtilizador(rows[0]) }, error: null }
}

export async function getSession() {
  const { data } = await getUser()
  return { data: { session: data.user ? { user: data.user } : null }, error: null }
}

// ---------------------------------------------------------------- escrita

export async function signUp({ email, password, options = {} }) {
  const limpo = String(email || "").trim().toLowerCase()
  if (!limpo.includes("@")) return { data: { user: null }, error: { message: "Email inválido." } }

  const { rows: existe } = await sql(`SELECT id FROM auth.users WHERE lower(email) = $1`, [limpo])
  if (existe.length > 0) {
    return { data: { user: null }, error: { message: "Já existe uma conta com este email." } }
  }

  let resumo
  try {
    resumo = await criarResumo(password)
  } catch (e) {
    return { data: { user: null }, error: { message: e.message } }
  }

  const metadados = options.data || {}

  // O trigger on_auth_user_created cria a linha em public.profiles
  const { rows } = await sql(
    `INSERT INTO auth.users (email, encrypted_password, raw_user_meta_data, email_confirmed_at)
     VALUES ($1, $2, $3::jsonb, $4) RETURNING *`,
    [limpo, resumo, JSON.stringify(metadados), process.env.AUTH_EXIGIR_CONFIRMACAO === "true" ? null : new Date()]
  )

  const utilizador = paraUtilizador(rows[0])
  await abrirSessao(utilizador.id)
  return { data: { user: utilizador }, error: null }
}

export async function signInWithPassword({ email, password }) {
  const limpo = String(email || "").trim().toLowerCase()

  const { rows } = await sql(
    `SELECT u.*, p.role, p.status
       FROM auth.users u
       LEFT JOIN public.profiles p ON p.id = u.id
      WHERE lower(u.email) = $1`,
    [limpo]
  )
  const linha = rows[0]

  // Mesmo sem utilizador, gastamos tempo a verificar: responder depressa a um
  // email inexistente revelaria quais os emails registados.
  const ok = linha
    ? await verificarResumo(password, linha.encrypted_password)
    : await verificarResumo(password, "scrypt$65536$8$1$AAAAAAAAAAAAAAAAAAAAAA==$AAAA")

  if (!linha || !ok) {
    return { data: { user: null }, error: { message: "Email ou palavra-passe incorretos." } }
  }

  if (linha.banned_until && new Date(linha.banned_until) > new Date()) {
    return { data: { user: null }, error: { message: "Esta conta está suspensa." } }
  }

  if (process.env.AUTH_EXIGIR_CONFIRMACAO === "true" && !linha.email_confirmed_at) {
    return { data: { user: null }, error: { message: "Confirma o teu email antes de entrares." } }
  }

  await sql(`UPDATE auth.users SET last_sign_in_at = now() WHERE id = $1`, [linha.id])
  await abrirSessao(linha.id, { papel: linha.role, estado: linha.status, email: linha.email })

  return { data: { user: paraUtilizador(linha) }, error: null }
}

export async function signOut() {
  const token = cookies().get(NOME_COOKIE)?.value
  const sessao = await lerSessao(token)
  if (sessao) {
    await sql(`UPDATE auth.sessions SET revoked_at = now() WHERE id = $1`, [sessao.sessaoId])
  }
  cookies().delete(NOME_COOKIE)
  return { error: null }
}

/** Cria a sessão em base de dados e põe o cookie assinado. */
export async function abrirSessao(userId, dados = {}) {
  let { papel, estado, email } = dados

  if (papel === undefined || estado === undefined || email === undefined) {
    const { rows } = await sql(
      `SELECT u.email, p.role, p.status
         FROM auth.users u LEFT JOIN public.profiles p ON p.id = u.id
        WHERE u.id = $1`,
      [userId]
    )
    papel = papel ?? rows[0]?.role ?? "student"
    estado = estado ?? rows[0]?.status ?? "active"
    email = email ?? rows[0]?.email ?? null
  }

  let agente = null
  let ip = null
  try {
    const h = headers()
    agente = h.get("user-agent")?.slice(0, 400) || null
    ip = (h.get("x-forwarded-for") || "").split(",")[0].trim() || null
  } catch {
    // fora de um pedido HTTP
  }

  const expira = new Date(Date.now() + DURACAO_DIAS * 24 * 60 * 60 * 1000)
  const { rows } = await sql(
    `INSERT INTO auth.sessions (user_id, expires_at, user_agent, ip) VALUES ($1, $2, $3, $4) RETURNING id`,
    [userId, expira, agente, ip]
  )

  const token = await assinarSessao({
    userId,
    sessaoId: rows[0].id,
    papel: papel || "student",
    estado: estado || "active",
    email,
  })

  cookies().set(NOME_COOKIE, token, opcoesCookie())
  return token
}

// ---------------------------------------------------------------- fichas

export async function criarFicha(userId, tipo, minutos = 60) {
  const ficha = gerarFicha()
  await sql(
    `INSERT INTO auth.one_time_tokens (user_id, token_hash, tipo, expires_at)
     VALUES ($1, $2, $3, now() + ($4 || ' minutes')::interval)`,
    [userId, resumoFicha(ficha), tipo, String(minutos)]
  )
  return ficha
}

export async function consumirFicha(ficha, tipo) {
  const { rows } = await sql(
    `UPDATE auth.one_time_tokens SET used_at = now()
      WHERE token_hash = $1 AND tipo = $2 AND used_at IS NULL AND expires_at > now()
      RETURNING user_id`,
    [resumoFicha(ficha), tipo]
  )
  return rows[0]?.user_id || null
}

export async function definirPassword(userId, novaPassword) {
  const resumo = await criarResumo(novaPassword)
  await sql(`UPDATE auth.users SET encrypted_password = $1, updated_at = now() WHERE id = $2`, [resumo, userId])
  // Quem muda a palavra-passe espera que as outras sessões caiam
  await sql(`UPDATE auth.sessions SET revoked_at = now() WHERE user_id = $1 AND revoked_at IS NULL`, [userId])
}

// ---------------------------------------------------------------- administração

export const admin = {
  async listUsers({ page = 1, perPage = 1000 } = {}) {
    const { rows } = await sql(
      `SELECT * FROM auth.users ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      [perPage, (page - 1) * perPage]
    )
    return { data: { users: rows.map(paraUtilizador) }, error: null }
  },

  async getUserById(id) {
    const { rows } = await sql(`SELECT * FROM auth.users WHERE id = $1`, [id])
    return { data: { user: paraUtilizador(rows[0]) }, error: null }
  },

  async createUser({ email, password, email_confirm = true, user_metadata = {} }) {
    const limpo = String(email).trim().toLowerCase()
    const resumo = password ? await criarResumo(password) : null
    const { rows } = await sql(
      `INSERT INTO auth.users (email, encrypted_password, raw_user_meta_data, email_confirmed_at)
       VALUES ($1, $2, $3::jsonb, $4) RETURNING *`,
      [limpo, resumo, JSON.stringify(user_metadata), email_confirm ? new Date() : null]
    )
    return { data: { user: paraUtilizador(rows[0]) }, error: null }
  },

  async deleteUser(id) {
    await sql(`DELETE FROM auth.users WHERE id = $1`, [id])
    return { data: null, error: null }
  },

  async suspenderUtilizador(id, ate) {
    await sql(`UPDATE auth.users SET banned_until = $1 WHERE id = $2`, [ate, id])
    await sql(`UPDATE auth.sessions SET revoked_at = now() WHERE user_id = $1 AND revoked_at IS NULL`, [id])
    return { data: null, error: null }
  },

  async terminarSessoes(id) {
    await sql(`UPDATE auth.sessions SET revoked_at = now() WHERE user_id = $1 AND revoked_at IS NULL`, [id])
    return { data: null, error: null }
  },
}

// ---------------------------------------------------------------- autorização

/**
 * A rede de segurança que a RLS dava deixou de existir. Estas funções são o
 * que a substitui: chamá-las no início de cada ação ou página protegida.
 */

export async function exigirSessao() {
  const { data } = await getUser()
  if (!data.user) throw new Error("NAO_AUTENTICADO")
  return data.user
}

export async function papelDe(userId) {
  const { rows } = await sql(`SELECT role, status FROM public.profiles WHERE id = $1`, [userId])
  return { papel: rows[0]?.role || "student", estado: rows[0]?.status || "pending" }
}

export async function exigirAdmin() {
  const utilizador = await exigirSessao()
  const { papel } = await papelDe(utilizador.id)
  if (papel !== "admin") throw new Error("SEM_PERMISSAO")
  return utilizador
}

export async function exigirCriador() {
  const utilizador = await exigirSessao()
  const { papel } = await papelDe(utilizador.id)
  if (papel !== "admin" && papel !== "creator") throw new Error("SEM_PERMISSAO")
  return { utilizador, papel }
}

/** Escreve no registo de auditoria do painel de administração. */
export async function registarAccao(actor, accao, { alvoTipo, alvoId, detalhes } = {}) {
  let ip = null
  try { ip = (headers().get("x-forwarded-for") || "").split(",")[0].trim() || null } catch {}
  await sql(
    `INSERT INTO public.admin_audit_log (actor_id, actor_email, accao, alvo_tipo, alvo_id, detalhes, ip)
     VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7)`,
    [actor?.id || null, actor?.email || null, accao, alvoTipo || null, alvoId ? String(alvoId) : null, JSON.stringify(detalhes || {}), ip]
  ).catch((e) => console.error("[auditoria]", e.message))
}
