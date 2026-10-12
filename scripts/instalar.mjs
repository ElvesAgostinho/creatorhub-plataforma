#!/usr/bin/env node
/**
 * Instalação inicial, depois das migrations.
 *
 *   node scripts/instalar.mjs --admin teu@email.ao --password "..."
 *
 * Faz três coisas: verifica a ligação, cria os contentores de ficheiros no
 * MinIO, e cria (ou promove) a conta de administração. Pode ser corrido mais
 * do que uma vez sem estragar nada.
 */

import { readFileSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"
import { randomBytes, scrypt as scryptCb } from "node:crypto"
import { promisify } from "node:util"
import pg from "pg"
import { Client as Minio } from "minio"

const scrypt = promisify(scryptCb)
const raiz = join(dirname(fileURLToPath(import.meta.url)), "..")

function carregarEnv() {
  try {
    for (const linha of readFileSync(join(raiz, ".env.local"), "utf8").split("\n")) {
      const limpa = linha.trim()
      if (!limpa || limpa.startsWith("#")) continue
      const i = limpa.indexOf("=")
      if (i === -1) continue
      const chave = limpa.slice(0, i).trim()
      if (!process.env[chave]) process.env[chave] = limpa.slice(i + 1).trim().replace(/^["']|["']$/g, "")
    }
  } catch {}
}
carregarEnv()

function argumento(nome) {
  const i = process.argv.indexOf(`--${nome}`)
  return i === -1 ? null : process.argv[i + 1]
}

async function criarResumo(password) {
  const sal = randomBytes(16)
  const derivada = await scrypt(password.normalize("NFKC"), sal, 64, { N: 2 ** 16, r: 8, p: 1, maxmem: 256 * 1024 * 1024 })
  return `scrypt$65536$8$1$${sal.toString("base64")}$${derivada.toString("base64")}`
}

const CONTENTORES = {
  images: true, uploads: true,     // públicos
  lessons: false, books: false, audio: false, // só por URL assinado
}

// ------------------------------------------------------------------ 1. Postgres

const url = process.env.DATABASE_URL
if (!url) {
  console.error("DATABASE_URL em falta.")
  process.exit(1)
}

const bd = new pg.Client({
  connectionString: url,
  ssl: /sslmode=require/.test(url) ? { rejectUnauthorized: false } : false,
})

console.log("\n1. Postgres")
try {
  await bd.connect()
  const { rows } = await bd.query("SELECT version()")
  console.log("   ligado —", rows[0].version.split(",")[0])
} catch (e) {
  console.error("   FALHOU:", e.message)
  process.exit(1)
}

const { rows: tabelas } = await bd.query(
  "SELECT count(*)::int AS n FROM information_schema.tables WHERE table_schema IN ('public','auth')"
)
console.log(`   ${tabelas[0].n} tabelas nos esquemas public e auth`)

if (tabelas[0].n < 10) {
  console.error("\n   Parece que as migrations ainda não correram. Faz primeiro:\n      node scripts/migrar.mjs\n")
  await bd.end()
  process.exit(1)
}

// ------------------------------------------------------------------ 2. MinIO

console.log("\n2. Ficheiros (MinIO)")
if (!process.env.S3_ENDPOINT) {
  console.log("   S3_ENDPOINT não definido — a saltar. Define-o para os uploads funcionarem.")
} else {
  try {
    const minio = new Minio({
      endPoint: process.env.S3_ENDPOINT.replace(/^https?:\/\//, "").split(":")[0],
      port: Number(process.env.S3_PORT || (process.env.S3_SSL === "false" ? 9000 : 443)),
      useSSL: process.env.S3_SSL !== "false",
      accessKey: process.env.S3_ACCESS_KEY,
      secretKey: process.env.S3_SECRET_KEY,
      region: process.env.S3_REGION || "us-east-1",
    })

    for (const [nome, publico] of Object.entries(CONTENTORES)) {
      const existe = await minio.bucketExists(nome).catch(() => false)
      if (!existe) {
        await minio.makeBucket(nome, process.env.S3_REGION || "us-east-1")
        console.log(`   criado: ${nome}${publico ? " (público)" : ""}`)
      } else {
        console.log(`   existe: ${nome}`)
      }
      if (publico) {
        await minio.setBucketPolicy(nome, JSON.stringify({
          Version: "2012-10-17",
          Statement: [{ Effect: "Allow", Principal: { AWS: ["*"] }, Action: ["s3:GetObject"], Resource: [`arn:aws:s3:::${nome}/*`] }],
        })).catch((e) => console.log(`   aviso na política de ${nome}: ${e.message}`))
      }
    }
  } catch (e) {
    console.error("   FALHOU:", e.message)
  }
}

// ------------------------------------------------------------------ 3. Administrador

const email = argumento("admin")
const password = argumento("password")

console.log("\n3. Conta de administração")
if (!email) {
  console.log("   nenhuma indicada — passa --admin teu@email.ao --password \"...\"")
} else if (!password || password.length < 8) {
  console.error("   a palavra-passe tem de ter pelo menos 8 caracteres.")
} else {
  const limpo = email.trim().toLowerCase()
  const resumo = await criarResumo(password)

  const { rows: existe } = await bd.query("SELECT id FROM auth.users WHERE lower(email) = $1", [limpo])

  let id
  if (existe.length > 0) {
    id = existe[0].id
    await bd.query("UPDATE auth.users SET encrypted_password = $1, email_confirmed_at = now() WHERE id = $2", [resumo, id])
    console.log("   conta já existia — palavra-passe reposta")
  } else {
    const { rows } = await bd.query(
      `INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, raw_user_meta_data)
       VALUES ($1, $2, now(), '{"full_name":"Administrador"}'::jsonb) RETURNING id`,
      [limpo, resumo]
    )
    id = rows[0].id
    console.log("   conta criada")
  }

  // O trigger cria o perfil; garantir o papel e o estado
  await bd.query(
    `INSERT INTO public.profiles (id, full_name, role, status) VALUES ($1, 'Administrador', 'admin', 'active')
     ON CONFLICT (id) DO UPDATE SET role = 'admin', status = 'active'`,
    [id]
  )
  console.log(`   ${limpo} é administrador`)
}

// ------------------------------------------------------------------ resumo

const { rows: contagem } = await bd.query("SELECT count(*)::int AS n FROM auth.users")
console.log(`\nPronto. ${contagem[0].n} utilizadores na base de dados.\n`)

await bd.end()
