import PromoBanner from "@/components/PromoBanner"
import ConditionalHeader from "@/components/ConditionalHeader"
import ConditionalFooter from "@/components/ConditionalFooter"
import ToastProvider from "@/components/ToastProvider"
import { CartProvider } from "@/components/CartContext"
import CartDrawer from "@/components/CartDrawer"
import FloatingWhatsApp from "@/components/FloatingWhatsApp"
import { createClient } from "@/lib/supabase/server"
import "@/app/globals.css"

import Header from "@/components/Header"
import Footer from "@/components/Footer"

export const metadata = {
  title: "ABOVE — Cursos, Livros e Mentorias Online",
  description: "Aprende com os melhores criadores de Angola. Cursos, livros digitais e mentorias numa única plataforma. Começa a tua jornada hoje.",
  openGraph: {
    title: "ABOVE — Aprende o que realmente importa",
    description: "Plataforma de cursos online, livros digitais e mentorias criada por criadores reais para Angola e o mundo.",
    type: "website",
  },
}

export default async function Layout({ children }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <html lang="pt">
      <head>
        <link rel="icon" href="/logo_a.svg?v=1" type="image/svg+xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-white text-neutral-900 antialiased" style={{ fontFamily: "'Inter', sans-serif" }}>
        <ToastProvider />
        <CartProvider>
          <ConditionalHeader>
            <Header />
          </ConditionalHeader>
          <CartDrawer />
          <main className="min-h-[60vh] flex flex-col">{children}</main>
          <ConditionalFooter>
            <Footer user={user} />
          </ConditionalFooter>
        </CartProvider>
        <FloatingWhatsApp user={user} />
      </body>
    </html>
  )
}
