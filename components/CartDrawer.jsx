"use client"

import { useCart } from "./CartContext"
import { ShoppingCart, X, Trash2, ArrowRight } from "lucide-react"

export default function CartDrawer() {
  const { cart, isCartOpen, setIsCartOpen, removeFromCart, isMounted } = useCart()

  if (!isMounted) return null

  const total = cart.reduce((acc, item) => acc + (item.price || 0), 0)
  const fmt = n => n.toLocaleString("pt-PT")

  const handleCheckout = () => {
    if (cart.length > 0) {
      // Como o sistema de pagamento atual é por produto,
      // encaminha para o checkout do primeiro item do carrinho.
      window.location.href = `/checkout/${cart[0].slug}`
      setIsCartOpen(false)
    }
  }

  return (
    <>
      {/* Overlay Background */}
      {isCartOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] transition-opacity"
          onClick={() => setIsCartOpen(false)}
        />
      )}

      {/* Drawer */}
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-[#0A0A0A] border-l border-neutral-800 shadow-2xl z-[101] transform transition-transform duration-300 ease-in-out flex flex-col ${
          isCartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-6 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-5 h-5 text-[#FF4500]" />
            <h2 className="text-lg font-bold text-white">O teu Carrinho</h2>
            <span className="bg-[#FF4500]/20 text-[#FF4500] text-xs font-bold px-2 py-0.5 rounded-full">
              {cart.length}
            </span>
          </div>
          <button 
            onClick={() => setIsCartOpen(false)}
            className="text-neutral-400 hover:text-white transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-neutral-900 flex items-center justify-center text-neutral-600">
                <ShoppingCart className="w-8 h-8" />
              </div>
              <div>
                <p className="text-white font-semibold">O teu carrinho está vazio</p>
                <p className="text-sm text-neutral-500 mt-1">Descobre os nossos cursos e mentorias no marketplace.</p>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="mt-4 px-6 py-2 bg-white text-black font-bold text-sm rounded-full hover:bg-neutral-200 transition"
              >
                Explorar Produtos
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-4 p-3 bg-neutral-900/50 border border-neutral-800 rounded-xl">
                  <div className="w-20 h-14 bg-neutral-800 rounded-lg overflow-hidden relative shrink-0">
                    {item.image ? (
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-neutral-500">Sem capa</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-white truncate">{item.title}</h3>
                    <p className="text-xs text-neutral-500 truncate">{item.instructor}</p>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-emerald-400 font-bold text-sm">{fmt(item.price)} Kz</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="shrink-0 text-neutral-500 hover:text-red-500 transition self-center p-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-6 border-t border-neutral-800 bg-[#0A0A0A]">
            <div className="flex items-center justify-between mb-4">
              <span className="text-neutral-400 text-sm font-medium">Subtotal</span>
              <span className="text-white text-xl font-bold">{fmt(total)} Kz</span>
            </div>
            <button 
              onClick={handleCheckout}
              className="w-full py-3.5 bg-gradient-to-r from-[#FF4500] to-orange-600 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(255,69,0,0.3)] transition-all hover:scale-[1.02]"
            >
              Finalizar compras <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-center text-[10px] text-neutral-500 mt-3">
              Pagamentos seguros via TPA, Multicaixa Express ou Transferência bancária assistida.
            </p>
          </div>
        )}
      </div>
    </>
  )
}
