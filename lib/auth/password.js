import { randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto"
import { promisify } from "node:util"

const scrypt = promisify(scryptCb)

/**
 * Resumo de palavras-passe com scrypt, do módulo crypto do Node.
 *
 * Escolhido em vez do bcrypt por não trazer dependência nenhuma e por ser
 * resistente a ataques com hardware dedicado. Os parâmetros seguem a
 * recomendação do OWASP: N=2^16, r=8, p=1.
 */

const N = 2 ** 16
const r = 8
const p = 1
const TAMANHO = 64

export async function criarResumo(password) {
  if (typeof password !== "string" || password.length < 8) {
    throw new Error("A palavra-passe tem de ter pelo menos 8 caracteres.")
  }
  const sal = randomBytes(16)
  const derivada = await scrypt(password.normalize("NFKC"), sal, TAMANHO, { N, r, p, maxmem: 256 * 1024 * 1024 })
  return `scrypt$${N}$${r}$${p}$${sal.toString("base64")}$${derivada.toString("base64")}`
}

export async function verificarResumo(password, resumo) {
  if (!resumo || typeof password !== "string") return false

  const partes = resumo.split("$")
  if (partes[0] !== "scrypt" || partes.length !== 6) return false

  const [, n, rr, pp, salB64, esperadoB64] = partes
  const sal = Buffer.from(salB64, "base64")
  const esperado = Buffer.from(esperadoB64, "base64")

  let derivada
  try {
    derivada = await scrypt(password.normalize("NFKC"), sal, esperado.length, {
      N: Number(n), r: Number(rr), p: Number(pp), maxmem: 256 * 1024 * 1024,
    })
  } catch {
    return false
  }

  // Comparação de tempo constante: comparar com === revelaria,
  // pelo tempo que demora, quantos bytes iniciais estavam certos.
  return derivada.length === esperado.length && timingSafeEqual(derivada, esperado)
}

/** Ficha aleatória para confirmar email ou repor palavra-passe. */
export function gerarFicha() {
  return randomBytes(32).toString("base64url")
}
