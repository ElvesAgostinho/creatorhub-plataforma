import PromoBanner from "@/components/PromoBanner"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import ToastProvider from "@/components/ToastProvider"
import { CartProvider } from "@/components/CartContext"
import CartDrawer from "@/components/CartDrawer"
import FloatingWhatsApp from "@/components/FloatingWhatsApp"
import { createClient } from "@/lib/supabase/server"
import "@/app/globals.css"

export const metadata = {
  title: "ABOVE — Cursos, Livros e Mentorias",
  description: "Aprende com criadores reais. Cursos, livros e mentorias num único lugar."
}

export default async function Layout({ children }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <html lang="pt">
      <head>
        <link rel="icon" href="/logo_a.svg?v=1" type="image/svg+xml" />
      </head>
      <body className="bg-white text-neutral-900 antialiased">
        <ToastProvider />
        <CartProvider>
          <Header />
          <CartDrawer />
          <main className="min-h-[60vh]">{children}</main>
          <Footer user={user} />
        </CartProvider>
        <FloatingWhatsApp user={user} />
      </body>
    </html>
  )
}
