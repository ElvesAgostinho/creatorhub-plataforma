import { Pool } from "pg"

/**
 * Ligação ao Postgres do EasyPanel.
 *
 * O Next recria módulos em desenvolvimento a cada alteração, o que criaria uma
 * nova pool de ligações de cada vez até esgotar o limite do servidor. Guardar a
 * pool em globalThis evita isso.
 */

const globalForPg = globalThis

function criarPool() {
  const connectionString = process.env.DATABASE_URL

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL não está definida. Define a ligação ao Postgres no .env.local e nas variáveis do serviço no EasyPanel."
    )
  }

  // Dentro da rede do EasyPanel a ligação é interna e não usa TLS;
  // a partir de fora usa, mas com certificado que não vamos validar.
  const externa = !/@[\w-]+:/.test(connectionString) || /sslmode=require/.test(connectionString)

  return new Pool({
    connectionString,
    ssl: externa ? { rejectUnauthorized: false } : false,
    max: Number(process.env.PGPOOL_MAX || 10),
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  })
}

/**
 * A pool só nasce no primeiro acesso à base de dados.
 * Se fosse criada ao importar o módulo, o `next build` falhava em qualquer
 * máquina sem DATABASE_URL definida — incluindo a que compila a imagem.
 */
export function obterPool() {
  if (!globalForPg.__abovePgPool) {
    const p = criarPool()
    p.on("error", (err) => console.error("[pg] erro numa ligação inativa:", err.message))
    globalForPg.__abovePgPool = p
  }
  return globalForPg.__abovePgPool
}

/** Executa SQL com parâmetros. Devolve { rows, rowCount }. */
export async function sql(text, params = []) {
  const inicio = Date.now()
  try {
    const res = await obterPool().query(text, params)
    const ms = Date.now() - inicio
    if (ms > 500) console.warn(`[pg] consulta lenta (${ms}ms):`, text.slice(0, 120))
    return res
  } catch (err) {
    // A mensagem do Postgres sozinha não diz onde foi; juntar o SQL ajuda a localizar.
    err.query = text
    err.params = params
    throw err
  }
}

/** Corre várias instruções numa transação. */
export async function transacao(fn) {
  const cliente = await obterPool().connect()
  try {
    await cliente.query("BEGIN")
    const resultado = await fn(cliente)
    await cliente.query("COMMIT")
    return resultado
  } catch (err) {
    await cliente.query("ROLLBACK")
    throw err
  } finally {
    cliente.release()
  }
}
