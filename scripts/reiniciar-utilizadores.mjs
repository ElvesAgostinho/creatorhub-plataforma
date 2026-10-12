#!/usr/bin/env node
/**
 * Apaga todos os utilizadores e deixa um único superadministrador.
 *
 *   node scripts/reiniciar-utilizadores.mjs --admin email@dominio --password "..." --confirmar
 *
 * Isto apaga contas a sério. Tudo o que depende de um utilizador vai atrás por
 * cascata: perfis, compras, progresso de aulas, candidaturas, mensagens,
 * avaliações, links de afiliado. Por isso exige --confirmar e mostra primeiro
 * o que vai desaparecer.
 */

import { readFileSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"
import { randomBytes, scrypt as scryptCb } from "node:crypto"
import { promisify } from "node:util"
import pg from "pg"

const scrypt = promisify(scryptCb)
const raiz = join(dirname(fileURLToPath(import.meta.url)), "..")

function carregarEnv() {
  try {
    for (const linha of readFileSync(join(raiz, ".env.local"), "utf8").split("\n")) {
      const l = linha.trim()
      if (!l || l.startsWith("#")) continue
      const i = l.indexOf("=")
      if (i === -1) continue
      const k = l.slice(0, i).trim()
      if (!process.env[k]) process.env[k] = l.slice(i + 1).trim().replace(/^["']|["']$/g, "")
    }
  } catch {}
}
carregarEnv()

function arg(nome) {
  const i = process.argv.indexOf(`--${nome}`)
  return i === -1 ? null : process.argv[i + 1]
}

const email = arg("admin")
const password = arg("password")
const confirmado = process.argv.includes("--confirmar")

if (!email || !password) {
  console.error('Uso: node scripts/reiniciar-utilizadores.mjs --admin email@dominio --password "..." --confirmar')
  process.exit(1)
}
if (password.length < 8) {
  console.error("A palavra-passe tem de ter pelo menos 8 caracteres.")
  process.exit(1)
}

const url = process.env.DATABASE_URL
if (!url) {
  console.error("DATABASE_URL em falta.")
  process.exit(1)
}

const bd = new pg.Client({
  connectionString: url,
  ssl: /sslmode=require/.test(url) ? { rejectUnauthorized: false } : false,
})
await bd.connect()

// ---------------------------------------------------------------- 1. inventário

const { rows: antes } = await bd.query(`
  SELECT
    (SELECT count(*)::int FROM auth.users)                                  AS utilizadores,
    (SELECT count(*)::int FROM public.profiles)                             AS perfis,
    (SELECT count(*)::int FROM public.purchases)                            AS compras,
    (SELECT count(*)::int FROM public.products)                             AS produtos
`)

console.log("\nEstado atual")
console.log(`   utilizadores : ${antes[0].utilizadores}`)
console.log(`   perfis       : ${antes[0].perfis}`)
console.log(`   compras      : ${antes[0].compras}`)
console.log(`   produtos     : ${antes[0].produtos}  (os produtos ficam, mas perdem o dono)`)

if (!confirmado) {
  console.log("\nNada foi apagado. Para avançar mesmo, acrescenta --confirmar\n")
  await bd.end()
  process.exit(0)
}

// ---------------------------------------------------------------- 2. apagar

const limpo = email.trim().toLowerCase()
const sal = randomBytes(16)
const derivada = await scrypt(password.normalize("NFKC"), sal, 64, { N: 2 ** 16, r: 8, p: 1, maxmem: 256 * 1024 * 1024 })
const resumo = `scrypt$65536$8$1$${sal.toString("base64")}$${derivada.toString("base64")}`

try {
  await bd.query("BEGIN")

  // As chaves estrangeiras apagam em cascata a partir de auth.users
  const { rowCount } = await bd.query("DELETE FROM auth.users")
  console.log(`\n   ${rowCount} utilizadores apagados`)

  // Restos que não dependem de um utilizador por chave estrangeira
  await bd.query("DELETE FROM auth.sessions")
  await bd.query("DELETE FROM auth.one_time_tokens")

  const { rows: criado } = await bd.query(
    `INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, raw_user_meta_data)
     VALUES ($1, $2, now(), '{"full_name":"Elves Agostinho"}'::jsonb)
     RETURNING id`,
    [limpo, resumo]
  )
  const id = criado[0].id

  // O trigger cria o perfil como "pending"; o superadministrador tem de ficar ativo
  await bd.query(
    `INSERT INTO public.profiles (id, full_name, role, status)
     VALUES ($1, 'Elves Agostinho', 'admin', 'active')
     ON CONFLICT (id) DO UPDATE SET role = 'admin', status = 'active'`,
    [id]
  )

  await bd.query(
    `INSERT INTO public.admin_audit_log (actor_id, actor_email, accao, detalhes)
     VALUES ($1, $2, 'reiniciar_utilizadores', $3::jsonb)`,
    [id, limpo, JSON.stringify({ apagados: rowCount })]
  )

  await bd.query("COMMIT")
  console.log(`   ${limpo} criado como superadministrador`)
} catch (e) {
  await bd.query("ROLLBACK")
  console.error("\nFALHOU, nada foi alterado:", e.message)
  await bd.end()
  process.exit(1)
}

// ---------------------------------------------------------------- 3. confirmar

const { rows: depois } = await bd.query(
  `SELECT u.email, p.role, p.status FROM auth.users u LEFT JOIN public.profiles p ON p.id = u.id`
)

console.log("\nUtilizadores agora:")
for (const u of depois) console.log(`   ${u.email}  —  ${u.role} / ${u.status}`)
console.log("\nTodos os registos novos entram como 'pending' e só este utilizador os pode aprovar.\n")

await bd.end()
