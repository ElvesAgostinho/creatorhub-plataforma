"use server"

import { revalidatePath } from "next/cache"
import { sql } from "@/lib/db/pool"
import { exigirAdmin, registarAccao, admin as contas, definirPassword } from "@/lib/auth"
import { sendRoleApprovalNotification } from "@/lib/email"

/**
 * Ações de gestão de utilizadores.
 *
 * Todas começam por exigirAdmin(). Isto não é zelo a mais: a proteção que
 * antes vinha das políticas de RLS da base de dados deixou de existir, e é
 * aqui que ela passou a viver. Uma ação sem esta chamada fica aberta a
 * qualquer pessoa com sessão iniciada.
 */

async function comoAdmin(accao) {
  try {
    const administrador = await exigirAdmin()
    return await accao(administrador)
  } catch (e) {
    if (e.message === "NAO_AUTENTICADO") return { erro: "Sessão terminada. Entra outra vez." }
    if (e.message === "SEM_PERMISSAO") return { erro: "Só a administração pode fazer isto." }
    console.error("[utilizadores]", e)
    return { erro: e.message }
  }
}

function recarregar() {
  revalidatePath("/admin/utilizadores")
}

export async function aprovarUtilizador(id) {
  return comoAdmin(async (administrador) => {
    const { rows } = await sql(
      `UPDATE public.profiles SET status = 'active' WHERE id = $1 RETURNING full_name`,
      [id]
    )
    if (rows.length === 0) return { erro: "Utilizador não encontrado." }

    const { rows: u } = await sql(`SELECT email FROM auth.users WHERE id = $1`, [id])
    await registarAccao(administrador, "aprovar_utilizador", { alvoTipo: "utilizador", alvoId: id, detalhes: { email: u[0]?.email } })

    // O email é um extra: se o envio falhar, a aprovação não deve falhar com ele
    if (u[0]?.email) {
      sendRoleApprovalNotification(u[0].email, "Membro").catch((e) =>
        console.error("[email de aprovação]", e.message)
      )
    }

    recarregar()
    return { ok: true }
  })
}

export async function rejeitarUtilizador(id, motivo) {
  return comoAdmin(async (administrador) => {
    await sql(`UPDATE public.profiles SET status = 'rejected' WHERE id = $1`, [id])
    // Rejeitar tem de derrubar a sessão, senão a pessoa continua a navegar
    await sql(`UPDATE auth.sessions SET revoked_at = now() WHERE user_id = $1 AND revoked_at IS NULL`, [id])
    await registarAccao(administrador, "rejeitar_utilizador", { alvoTipo: "utilizador", alvoId: id, detalhes: { motivo: motivo || null } })
    recarregar()
    return { ok: true }
  })
}

export async function mudarPapel(id, papel) {
  return comoAdmin(async (administrador) => {
    if (!["student", "creator", "admin"].includes(papel)) {
      return { erro: "Papel inválido." }
    }
    if (id === administrador.id && papel !== "admin") {
      return { erro: "Não podes retirar-te a ti próprio a administração." }
    }
    await sql(`UPDATE public.profiles SET role = $1 WHERE id = $2`, [papel, id])
    // O papel viaja dentro do token de sessão; sem isto só mudava no próximo login
    await sql(`UPDATE auth.sessions SET revoked_at = now() WHERE user_id = $1 AND revoked_at IS NULL`, [id])
    await registarAccao(administrador, "mudar_papel", { alvoTipo: "utilizador", alvoId: id, detalhes: { papel } })
    recarregar()
    return { ok: true }
  })
}

export async function suspenderUtilizador(id, dias) {
  return comoAdmin(async (administrador) => {
    if (id === administrador.id) return { erro: "Não te podes suspender a ti próprio." }
    const ate = dias ? new Date(Date.now() + Number(dias) * 86400000) : new Date("2999-12-31")
    await contas.suspenderUtilizador(id, ate)
    await registarAccao(administrador, "suspender_utilizador", { alvoTipo: "utilizador", alvoId: id, detalhes: { ate } })
    recarregar()
    return { ok: true }
  })
}

export async function levantarSuspensao(id) {
  return comoAdmin(async (administrador) => {
    await sql(`UPDATE auth.users SET banned_until = NULL WHERE id = $1`, [id])
    await registarAccao(administrador, "levantar_suspensao", { alvoTipo: "utilizador", alvoId: id })
    recarregar()
    return { ok: true }
  })
}

export async function terminarSessoes(id) {
  return comoAdmin(async (administrador) => {
    await contas.terminarSessoes(id)
    await registarAccao(administrador, "terminar_sessoes", { alvoTipo: "utilizador", alvoId: id })
    recarregar()
    return { ok: true }
  })
}

export async function reporPassword(id, nova) {
  return comoAdmin(async (administrador) => {
    if (!nova || nova.length < 8) return { erro: "A palavra-passe tem de ter pelo menos 8 caracteres." }
    await definirPassword(id, nova)
    await registarAccao(administrador, "repor_password", { alvoTipo: "utilizador", alvoId: id })
    recarregar()
    return { ok: true }
  })
}

export async function apagarUtilizador(id) {
  return comoAdmin(async (administrador) => {
    if (id === administrador.id) return { erro: "Não podes apagar a tua própria conta." }

    const { rows } = await sql(`SELECT email FROM auth.users WHERE id = $1`, [id])
    await contas.deleteUser(id)
    await registarAccao(administrador, "apagar_utilizador", { alvoTipo: "utilizador", alvoId: id, detalhes: { email: rows[0]?.email } })
    recarregar()
    return { ok: true }
  })
}

export async function criarUtilizador(formData) {
  return comoAdmin(async (administrador) => {
    const email = String(formData.get("email") || "").trim().toLowerCase()
    const password = String(formData.get("password") || "")
    const papel = String(formData.get("papel") || "student")
    const nome = String(formData.get("nome") || "").trim()

    if (!email.includes("@")) return { erro: "Email inválido." }
    if (password.length < 8) return { erro: "A palavra-passe tem de ter pelo menos 8 caracteres." }

    const { rows: existe } = await sql(`SELECT id FROM auth.users WHERE lower(email) = $1`, [email])
    if (existe.length > 0) return { erro: "Já existe uma conta com este email." }

    const { data, error } = await contas.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: nome || email.split("@")[0] },
    })
    if (error) return { erro: error.message }

    // Criado pela administração entra já ativo: não faz sentido aprovar o que se acabou de criar
    await sql(
      `INSERT INTO public.profiles (id, full_name, role, status) VALUES ($1, $2, $3, 'active')
       ON CONFLICT (id) DO UPDATE SET role = $3, status = 'active', full_name = COALESCE(public.profiles.full_name, $2)`,
      [data.user.id, nome || email.split("@")[0], papel]
    )

    await registarAccao(administrador, "criar_utilizador", { alvoTipo: "utilizador", alvoId: data.user.id, detalhes: { email, papel } })
    recarregar()
    return { ok: true }
  })
}
