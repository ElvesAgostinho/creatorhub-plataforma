import { Client } from "minio"

/**
 * Armazenamento de ficheiros em MinIO, com a mesma forma de API que o código
 * já usa: storage.from("lessons").createSignedUrl(caminho, segundos).
 *
 * Os cinco contentores do projeto — images, uploads, lessons, books, audio —
 * são criados à cabeça se não existirem. Só "images" e "uploads" são públicos;
 * aulas, livros e áudio só se abrem com URL assinado, que é o que mantém o
 * conteúdo pago fora do alcance de quem não comprou.
 */

export const CONTENTORES = {
  images: { publico: true },
  uploads: { publico: true },
  lessons: { publico: false },
  books: { publico: false },
  audio: { publico: false },
}

let clienteCache = null

function cliente() {
  if (clienteCache) return clienteCache

  const endPoint = process.env.S3_ENDPOINT
  if (!endPoint) {
    throw new Error("S3_ENDPOINT em falta. Define o endereço do MinIO no .env.local e no EasyPanel.")
  }

  clienteCache = new Client({
    endPoint: endPoint.replace(/^https?:\/\//, "").split(":")[0],
    port: Number(process.env.S3_PORT || (process.env.S3_SSL === "false" ? 9000 : 443)),
    useSSL: process.env.S3_SSL !== "false",
    accessKey: process.env.S3_ACCESS_KEY,
    secretKey: process.env.S3_SECRET_KEY,
    region: process.env.S3_REGION || "us-east-1",
  })
  return clienteCache
}

function urlPublica(contentor, caminho) {
  const base = (process.env.S3_PUBLIC_URL || process.env.S3_ENDPOINT || "").replace(/\/+$/, "")
  return `${base}/${contentor}/${caminho}`
}

class Contentor {
  constructor(nome) {
    this.nome = nome
  }

  async upload(caminho, ficheiro, opcoes = {}) {
    try {
      const c = cliente()
      let corpo = ficheiro
      if (ficheiro instanceof Blob || typeof ficheiro?.arrayBuffer === "function") {
        corpo = Buffer.from(await ficheiro.arrayBuffer())
      } else if (ficheiro instanceof ArrayBuffer) {
        corpo = Buffer.from(ficheiro)
      }

      const metadados = {}
      if (opcoes.contentType || ficheiro?.type) {
        metadados["Content-Type"] = opcoes.contentType || ficheiro.type
      }
      if (opcoes.cacheControl) metadados["Cache-Control"] = opcoes.cacheControl

      if (!opcoes.upsert) {
        try {
          await c.statObject(this.nome, caminho)
          return { data: null, error: { message: "Já existe um ficheiro neste caminho." } }
        } catch {
          // não existe — é o que queremos
        }
      }

      await c.putObject(this.nome, caminho, corpo, corpo.length, metadados)
      return { data: { path: caminho, fullPath: `${this.nome}/${caminho}` }, error: null }
    } catch (err) {
      console.error(`[storage] upload ${this.nome}/${caminho}:`, err.message)
      return { data: null, error: { message: err.message } }
    }
  }

  async download(caminho) {
    try {
      const fluxo = await cliente().getObject(this.nome, caminho)
      const pedacos = []
      for await (const p of fluxo) pedacos.push(p)
      const buffer = Buffer.concat(pedacos)
      return { data: new Blob([buffer]), error: null }
    } catch (err) {
      return { data: null, error: { message: err.message } }
    }
  }

  async remove(caminhos) {
    try {
      const lista = Array.isArray(caminhos) ? caminhos : [caminhos]
      await cliente().removeObjects(this.nome, lista)
      return { data: lista.map((p) => ({ name: p })), error: null }
    } catch (err) {
      return { data: null, error: { message: err.message } }
    }
  }

  async createSignedUrl(caminho, segundos = 3600) {
    try {
      const url = await cliente().presignedGetObject(this.nome, caminho, Math.max(1, Math.floor(segundos)))
      return { data: { signedUrl: url, signedURL: url }, error: null }
    } catch (err) {
      console.error(`[storage] assinatura ${this.nome}/${caminho}:`, err.message)
      return { data: null, error: { message: err.message } }
    }
  }

  async createSignedUrls(caminhos, segundos = 3600) {
    const resultados = await Promise.all(
      caminhos.map(async (p) => {
        const { data, error } = await this.createSignedUrl(p, segundos)
        return { path: p, signedUrl: data?.signedUrl || null, error: error?.message || null }
      })
    )
    return { data: resultados, error: null }
  }

  getPublicUrl(caminho) {
    return { data: { publicUrl: urlPublica(this.nome, caminho) } }
  }

  async list(prefixo = "", opcoes = {}) {
    try {
      const c = cliente()
      const fluxo = c.listObjectsV2(this.nome, prefixo, true)
      const itens = []
      for await (const obj of fluxo) {
        itens.push({
          name: obj.name,
          id: obj.etag,
          updated_at: obj.lastModified,
          metadata: { size: obj.size },
        })
        if (opcoes.limit && itens.length >= opcoes.limit) break
      }
      return { data: itens, error: null }
    } catch (err) {
      return { data: null, error: { message: err.message } }
    }
  }
}

export const storage = {
  from(nome) {
    return new Contentor(nome)
  },

  /** Cria os contentores em falta e abre ao público os que têm de o ser. */
  async garantirContentores() {
    const c = cliente()
    const criados = []
    for (const [nome, { publico }] of Object.entries(CONTENTORES)) {
      const existe = await c.bucketExists(nome).catch(() => false)
      if (!existe) {
        await c.makeBucket(nome, process.env.S3_REGION || "us-east-1")
        criados.push(nome)
      }
      if (publico) {
        await c.setBucketPolicy(nome, JSON.stringify({
          Version: "2012-10-17",
          Statement: [{
            Effect: "Allow",
            Principal: { AWS: ["*"] },
            Action: ["s3:GetObject"],
            Resource: [`arn:aws:s3:::${nome}/*`],
          }],
        })).catch((e) => console.warn(`[storage] política de ${nome}:`, e.message))
      }
    }
    return criados
  },

  /** Ocupação por prefixo de utilizador, para o painel de armazenamento. */
  async ocupacao(contentor, prefixo = "") {
    const c = cliente()
    let bytes = 0
    let ficheiros = 0
    const fluxo = c.listObjectsV2(contentor, prefixo, true)
    for await (const obj of fluxo) {
      bytes += obj.size
      ficheiros++
    }
    return { bytes, ficheiros }
  },
}
