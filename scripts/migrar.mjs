#!/usr/bin/env node
/**
 * Aplica as migrations ao Postgres do EasyPanel.
 *
 *   node scripts/migrar.mjs            aplica o que falta
 *   node scripts/migrar.mjs --estado   só mostra o que está por aplicar
 *
 * Cada ficheiro corre dentro da sua própria transação: se uma instrução
 * falhar, essa migration é desfeita por inteiro e o processo pára, em vez de
 * deixar a base de dados a meio.
 */

import { readFileSync, readdirSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"
import pg from "pg"

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..")

// Lê o .env.local sem depender de pacotes extra
function carregarEnv() {
  try {
    const texto = readFileSync(join(raiz, ".env.local"), "utf8")
    for (const linha of texto.split("\n")) {
      const limpa = linha.trim()
      if (!limpa || limpa.startsWith("#")) continue
      const i = limpa.indexOf("=")
      if (i === -1) continue
      const chave = limpa.slice(0, i).trim()
      const valor = limpa.slice(i + 1).trim().replace(/^["']|["']$/g, "")
      if (!process.env[chave]) process.env[chave] = valor
    }
  } catch {
    // sem .env.local — espera-se que as variáveis venham do ambiente
  }
}
carregarEnv()

const url = process.env.DATABASE_URL
if (!url) {
  console.error("DATABASE_URL não está definida. Põe a ligação ao Postgres no .env.local.")
  process.exit(1)
}

const soEstado = process.argv.includes("--estado")

const cliente = new pg.Client({
  connectionString: url,
  ssl: /sslmode=require/.test(url) ? { rejectUnauthorized: false } : false,
})

try {
  await cliente.connect()
} catch (e) {
  console.error("Não consegui ligar ao Postgres:", e.message)
  process.exit(1)
}

await cliente.query(`
  CREATE TABLE IF NOT EXISTS public.schema_migrations (
    nome text PRIMARY KEY,
    aplicada_em timestamptz NOT NULL DEFAULT now()
  )
`)

const { rows: jaAplicadas } = await cliente.query("SELECT nome FROM public.schema_migrations")
const aplicadas = new Set(jaAplicadas.map((r) => r.nome))

const pasta = join(raiz, "supabase", "migrations")
const ficheiros = readdirSync(pasta).filter((f) => f.endsWith(".sql")).sort()

const porAplicar = ficheiros.filter((f) => !aplicadas.has(f))

console.log(`\n${ficheiros.length} migrations no total, ${aplicadas.size} já aplicadas.\n`)

if (porAplicar.length === 0) {
  console.log("Nada por aplicar. A base de dados está em dia.")
  await cliente.end()
  process.exit(0)
}

if (soEstado) {
  console.log("Por aplicar:")
  for (const f of porAplicar) console.log("   " + f)
  await cliente.end()
  process.exit(0)
}

for (const ficheiro of porAplicar) {
  const sql = readFileSync(join(pasta, ficheiro), "utf8")
  process.stdout.write(`   ${ficheiro} ... `)
  try {
    await cliente.query("BEGIN")
    await cliente.query(sql)
    await cliente.query("INSERT INTO public.schema_migrations (nome) VALUES ($1)", [ficheiro])
    await cliente.query("COMMIT")
    console.log("ok")
  } catch (e) {
    await cliente.query("ROLLBACK")
    console.log("FALHOU")
    console.error(`\n${e.message}`)
    if (e.position) {
      const pos = Number(e.position)
      console.error(`\nPerto de:\n   ...${sql.slice(Math.max(0, pos - 160), pos + 160)}...`)
    }
    console.error("\nNada foi aplicado desta migration. Corrige e volta a correr.")
    await cliente.end()
    process.exit(1)
  }
}

console.log(`\n${porAplicar.length} migrations aplicadas.`)
await cliente.end()
