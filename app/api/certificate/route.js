import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { PDFDocument, rgb, StandardFonts } from "pdf-lib"
import fontkit from "@pdf-lib/fontkit"
import fs from "fs/promises"
import path from "path"

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const productId = searchParams.get("productId")

  if (!productId) {
    return NextResponse.json({ error: "Product ID missing" }, { status: 400 })
  }

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Obter detalhes do utilizador
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single()

  const userName = profile?.full_name || user.email.split("@")[0]

  // Obter detalhes do curso
  const { data: product } = await supabase
    .from("products")
    .select("title, instructor_name")
    .eq("id", productId)
    .single()

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 })
  }

  const trainerName = product.instructor_name || "Membros ABOVE"
  const endDate = new Date().toLocaleDateString('pt-PT')

  try {
    const pdfDoc = await PDFDocument.create()
    pdfDoc.registerFontkit(fontkit)

    const page = pdfDoc.addPage([841.89, 595.28])
    const { width, height } = page.getSize()

    page.drawRectangle({
      x: 20, y: 20,
      width: width - 40, height: height - 40,
      borderColor: rgb(0.85, 0.65, 0.2), 
      borderWidth: 4,
    })
    page.drawRectangle({
      x: 28, y: 28,
      width: width - 56, height: height - 56,
      borderColor: rgb(0.85, 0.65, 0.2),
      borderWidth: 1,
    })

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
      console.warn("Logo S não encontrado.", err)
    }

    const fontPath = path.join(process.cwd(), "public", "DancingScript.ttf")
    const fontBytes = await fs.readFile(fontPath)
    const customFont = await pdfDoc.embedFont(fontBytes)
    const standardFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

    const titleText = "CERTIFICADO DE CONCLUSÃO"
    const titleWidth = boldFont.widthOfTextAtSize(titleText, 28)
    page.drawText(titleText, {
      x: width / 2 - titleWidth / 2,
      y: height - 200,
      size: 28,
      font: boldFont,
      color: rgb(0.2, 0.2, 0.2),
    })

    const subText = "Certificamos com orgulho que"
    const subWidth = standardFont.widthOfTextAtSize(subText, 14)
    page.drawText(subText, {
      x: width / 2 - subWidth / 2,
      y: height - 240,
      size: 14,
      font: standardFont,
      color: rgb(0.4, 0.4, 0.4),
    })

    const nameWidth = customFont.widthOfTextAtSize(userName, 56)
    page.drawText(userName, {
      x: width / 2 - nameWidth / 2,
      y: height - 320,
      size: 56,
      font: customFont,
      color: rgb(0.85, 0.65, 0.2),
    })

    const reasonText = `concluiu com sucesso o programa de formação em`
    const reasonWidth = standardFont.widthOfTextAtSize(reasonText, 14)
    page.drawText(reasonText, {
      x: width / 2 - reasonWidth / 2,
      y: height - 380,
      size: 14,
      font: standardFont,
      color: rgb(0.4, 0.4, 0.4),
    })

    const courseWidth = boldFont.widthOfTextAtSize(product.title, 22)
    page.drawText(product.title, {
      x: width / 2 - courseWidth / 2,
      y: height - 420,
      size: 22,
      font: boldFont,
      color: rgb(0.1, 0.1, 0.1),
    })

    const footerY = 100
    
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

    page.drawLine({
      start: { x: width - 350, y: footerY + 20 },
      end: { x: width - 150, y: footerY + 20 },
      thickness: 1,
      color: rgb(0.6, 0.6, 0.6)
    })
    
    const dateLabel = `Concluído a ${endDate}`
    page.drawText(dateLabel, {
      x: (width - 250) - (standardFont.widthOfTextAtSize(dateLabel, 12) / 2),
      y: footerY,
      size: 12,
      font: standardFont,
      color: rgb(0.3, 0.3, 0.3),
    })

    const pdfBytes = await pdfDoc.save()

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Certificado_${userName.replace(/\s+/g, "_")}.pdf"`,
      },
    })
  } catch (error) {
    console.error("Error generating PDF:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
