import localFont from "next/font/local"
import QRCode from "qrcode"

// A mesma fonte manuscrita que o gerador de PDF embute no certificado real
const dancing = localFont({
  src: "../../public/DancingScript.ttf",
  display: "swap",
  variable: "--font-dancing",
})

/**
 * Réplica fiel do certificado gerado em /api/certificate: folha A4 horizontal,
 * moldura dourada dupla, "ABOVE Exchange" ao canto, nome do aluno em Dancing
 * Script e QR Code de verificação — gerado aqui de verdade, não desenhado.
 */
export default async function CertificateMock({
  name = "Joana Capita",
  course = "Marketing Digital na Prática",
  trainer = "Hélder Nascimento",
  date = "12/10/2026",
  verifyUrl = "https://above.exchange/verify",
}) {
  let qr = null
  try {
    qr = await QRCode.toDataURL(verifyUrl, {
      width: 200,
      margin: 0,
      color: { dark: "#111111", light: "#FFFFFF" },
    })
  } catch {
    qr = null
  }

  return (
    <div
      // container-type permite dimensionar o texto em cqw (relativo à largura do
      // certificado), para a folha escalar como uma folha e não como a viewport
      style={{ containerType: "inline-size" }}
      className={`${dancing.variable} relative aspect-[841.89/595.28] w-full overflow-hidden rounded-lg bg-white p-[2.5%] shadow-float`}
    >
      {/* Moldura dourada dupla, como no PDF */}
      <div className="absolute inset-[2%] border-[3px] border-[#D9A633]" />
      <div className="absolute inset-[3.2%] border border-[#D9A633]" />

      <div className="relative flex h-full flex-col items-center justify-between px-[7%] py-[5%] text-center">
        {/* Topo */}
        <div className="flex w-full items-start justify-between">
          <span className="text-[clamp(7px,1.5cqw,13px)] font-extrabold tracking-tight text-ink-800">
            ABOVE Exchange
          </span>

          <span className="flex flex-col items-center gap-0.5">
            {qr ? (
              <img loading="lazy" decoding="async" src={qr} alt="" aria-hidden="true" className="h-[clamp(22px,5%,46px)] w-auto" />
            ) : (
              <span className="block h-[clamp(22px,5%,46px)] w-[clamp(22px,5%,46px)] bg-neutral-100" />
            )}
            <span className="text-[clamp(3px,0.6cqw,5px)] font-bold tracking-wide text-neutral-400">
              VERIFICAÇÃO DE AUTENTICIDADE
            </span>
          </span>
        </div>

        {/* Corpo */}
        <div className="-mt-[2%] flex flex-col items-center">
          <div className="text-[clamp(10px,2.4cqw,24px)] font-extrabold tracking-tight text-neutral-800">
            CERTIFICADO DE CONCLUSÃO
          </div>
          <div className="mt-[3%] text-[clamp(5px,1.1cqw,12px)] font-medium text-neutral-500">
            Certificamos com orgulho que
          </div>
          <div
            className="mt-[2%] text-[clamp(18px,4.6cqw,48px)] leading-none text-[#D9A633]"
            style={{ fontFamily: "var(--font-dancing), cursive" }}
          >
            {name}
          </div>
          <div className="mt-[3%] text-[clamp(5px,1.1cqw,12px)] font-medium text-neutral-500">
            concluiu com sucesso o programa de formação em
          </div>
          <div className="mt-[1.5%] text-[clamp(8px,1.9cqw,19px)] font-extrabold text-ink-800">
            {course}
          </div>
        </div>

        {/* Assinaturas */}
        <div className="flex w-full items-end justify-center gap-[16%] text-[clamp(4px,0.95cqw,10px)] font-medium text-neutral-600">
          <span className="flex flex-col items-center">
            <span className="mb-1 block h-px w-[clamp(60px,18cqw,190px)] bg-neutral-400" />
            Formador: {trainer}
          </span>
          <span className="flex flex-col items-center">
            <span className="mb-1 block h-px w-[clamp(60px,18cqw,190px)] bg-neutral-400" />
            Concluído a {date}
          </span>
        </div>
      </div>
    </div>
  )
}
