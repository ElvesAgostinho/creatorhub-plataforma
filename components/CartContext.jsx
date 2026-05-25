"use client"

import { createContext, useContext, useState, useEffect } from "react"

const CartContext = createContext()

export function CartProvider({ children }) {
  const [cart, setCart] = useState([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Load from local storage on mount
  useEffect(() => {
    setIsMounted(true)
    try {
      const saved = localStorage.getItem("above_cart")
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) {
          setCart(parsed)
        } else {
          setCart([])
        }
      }
    } catch (e) {
      setCart([])
    }
  }, [])

  // Save to local storage on change
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("above_cart", JSON.stringify(cart))
    }
  }, [cart, isMounted])

  const addToCart = (product) => {
    setCart(prev => {
      if (prev.find(p => p.id === product.id)) return prev
      return [...prev, product]
    })
    setIsCartOpen(true) // Auto open cart when adding
  }

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(p => p.id !== id))
  }

  const clearCart = () => {
    setCart([])
  }

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      clearCart,
      isCartOpen,
      setIsCartOpen,
      isMounted
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}
