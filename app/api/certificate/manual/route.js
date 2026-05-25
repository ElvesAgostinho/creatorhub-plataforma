import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { PDFDocument, rgb, StandardFonts } from "pdf-lib"
import fontkit from "@pdf-lib/fontkit"
import fs from "fs/promises"
import path from "path"

export async function POST(req) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const formData = await req.formData()
  const studentName = formData.get("student_name")
  let courseTitle = formData.get("course_title")
  const customCourseTitle = formData.get("custom_course_title")
  const trainerName = formData.get("trainer_name")
  const startDate = formData.get("start_date")
  const endDate = formData.get("end_date")

  if (courseTitle === "custom" && customCourseTitle) {
    courseTitle = customCourseTitle
  }

  if (!studentName || !courseTitle || !trainerName || !startDate || !endDate) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 })
  }
  
  try {
    // Criar um novo documento PDF limpo
    const pdfDoc = await PDFDocument.create()
    pdfDoc.registerFontkit(fontkit)

    // Formato A4 Landscape
    const page = pdfDoc.addPage([841.89, 595.28])
    const { width, height } = page.getSize()

    // Desenhar Borda Dourada
    page.drawRectangle({
      x: 20, y: 20,
      width: width - 40, height: height - 40,
      borderColor: rgb(0.85, 0.65, 0.2), // Dourado
      borderWidth: 4,
    })
    page.drawRectangle({
      x: 28, y: 28,
      width: width - 56, height: height - 56,
      borderColor: rgb(0.85, 0.65, 0.2),
      borderWidth: 1,
    })

    // Carregar e desenhar o Novo Logo "S"
    try {
      const logoPath = path.join(process.cwd(), "public", "logo.png")
      const logoBytes = await fs.readFile(logoPath)
      const logoImage = await pdfDoc.embedPng(logoBytes)
      const logoDims = logoImage.scale(0.3)
      page.drawImage(logoImage, {
        x: width / 2 - logoDims.width / 2,
        y: height - 120,
        width: logoDims.width,
        height: logoDims.height,
      })
    } catch (err) {
      console.warn("Logo S não encontrado ou inválido, saltando logo no PDF.", err)
    }

    // Carregar a fonte manuscrita
    const fontPath = path.join(process.cwd(), "public", "DancingScript.ttf")
    const fontBytes = await fs.readFile(fontPath)
    const customFont = await pdfDoc.embedFont(fontBytes)
    const standardFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

    // Título Principal
    const titleText = "CERTIFICADO DE CONCLUSÃO"
    const titleWidth = boldFont.widthOfTextAtSize(titleText, 28)
    page.drawText(titleText, {
      x: width / 2 - titleWidth / 2,
      y: height - 200,
      size: 28,
      font: boldFont,
      color: rgb(0.2, 0.2, 0.2),
    })

    // Subtítulo
    const subText = "Certificamos com orgulho que"
    const subWidth = standardFont.widthOfTextAtSize(subText, 14)
    page.drawText(subText, {
      x: width / 2 - subWidth / 2,
      y: height - 240,
      size: 14,
      font: standardFont,
      color: rgb(0.4, 0.4, 0.4),
    })

    // Nome do Aluno (Estilo Manual)
    const nameWidth = customFont.widthOfTextAtSize(studentName, 56)
    page.drawText(studentName, {
      x: width / 2 - nameWidth / 2,
      y: height - 320,
      size: 56,
      font: customFont,
      color: rgb(0.85, 0.65, 0.2),
    })

    // Texto de Razão
    const reasonText = `concluiu com sucesso o programa de formação em`
    const reasonWidth = standardFont.widthOfTextAtSize(reasonText, 14)
    page.drawText(reasonText, {
      x: width / 2 - reasonWidth / 2,
      y: height - 380,
      size: 14,
      font: standardFont,
      color: rgb(0.4, 0.4, 0.4),
    })

    // Nome do Curso
    const courseWidth = boldFont.widthOfTextAtSize(courseTitle, 22)
    page.drawText(courseTitle, {
      x: width / 2 - courseWidth / 2,
      y: height - 420,
      size: 22,
      font: boldFont,
      color: rgb(0.1, 0.1, 0.1),
    })

    // Formador e Datas (Rodapé)
    const footerY = 100
    
    // Assinatura Formador (Esquerda)
    page.drawLine({
      start: { x: 150, y: footerY + 20 },
      end: { x: 350, y: footerY + 20 },
      thickness: 1,
      color: rgb(0.6, 0.6, 0.6)
    })
    const trainerLabel = `Formador: ${trainerName}`
    page.drawText(trainerLabel, {
      x: 250 - (standardFont.widthOfTextAtSize(trainerLabel, 12) / 2),
      y: footerY,
      size: 12,
      font: standardFont,
      color: rgb(0.3, 0.3, 0.3),
    })

    // Datas (Direita)
    page.drawLine({
      start: { x: width - 350, y: footerY + 20 },
      end: { x: width - 150, y: footerY + 20 },
      thickness: 1,
      color: rgb(0.6, 0.6, 0.6)
    })
    
    // Formatar datas simples
    const formatDate = (d) => new Date(d).toLocaleDateString('pt-PT')
    const dateLabel = `Realizado de ${formatDate(startDate)} a ${formatDate(endDate)}`
    
    page.drawText(dateLabel, {
      x: (width - 250) - (standardFont.widthOfTextAtSize(dateLabel, 12) / 2),
      y: footerY,
      size: 12,
      font: standardFont,
      color: rgb(0.3, 0.3, 0.3),
    })

    // Adicionar "ABOVE Exchange" no canto superior esquerdo
    page.drawText("ABOVE Exchange", {
      x: 50,
      y: height - 60,
      size: 18,
      font: boldFont,
      color: rgb(0.1, 0.1, 0.1),
    })

    // Adicionar QR Code
    try {
      const QRCode = require('qrcode')
      const verifyUrl = `https://above.exchange/verify?id=${Date.now()}`
      const qrDataUrl = await QRCode.toDataURL(verifyUrl, { width: 200, margin: 1, color: { dark: '#111111', light: '#FFFFFF' } })
      const qrImageBytes = Buffer.from(qrDataUrl.split(',')[1], 'base64')
      const qrImage = await pdfDoc.embedPng(qrImageBytes)
      
      page.drawImage(qrImage, {
        x: width - 110,
        y: height - 110,
        width: 70,
        height: 70,
      })
      
      page.drawText("VERIFICAÇÃO DE AUTENTICIDADE", {
        x: width - 130,
        y: height - 125,
        size: 6,
        font: boldFont,
        color: rgb(0.5, 0.5, 0.5),
      })
    } catch(err) {
      console.warn("Falha ao gerar QR Code", err)
    }

    // Serializar o PDF
    const pdfBytes = await pdfDoc.save()

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Certificado_${studentName.replace(/\s+/g, "_")}.pdf"`,
      },
    })
  } catch (error) {
    console.error("Error generating PDF:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
