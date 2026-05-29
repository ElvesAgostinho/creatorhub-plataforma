"use client"

import { useState, useRef, useEffect } from "react"
import { MoreVertical, Link as LinkIcon, Trash2, PowerOff, Power } from "lucide-react"

export default function ProductActionsDropdown({ product }) {
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const copyCheckoutLink = () => {
    const url = `${window.location.origin}/checkout/${product.slug}`
    navigator.clipboard.writeText(url)
    alert("Link de checkout copiado!")
    setOpen(false)
  }

  const toggleStatus = async () => {
    alert("Funcionalidade de alterar status em breve.")
    setOpen(false)
  }

  const deleteProduct = async () => {
    if (confirm("Tens a certeza que queres eliminar este produto? Esta ação não pode ser desfeita.")) {
      alert("Para eliminar um produto, por favor contacta o suporte para evitar perda de dados de alunos.")
    }
    setOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setOpen(!open)}
        className="p-2 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
      >
        <MoreVertical size={18} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-neutral-200 rounded-lg shadow-lg z-50 py-1 flex flex-col">
          <button 
            onClick={copyCheckoutLink}
            className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 text-left"
          >
            <LinkIcon size={14} /> Copiar Checkout
          </button>
          
          <button 
            onClick={toggleStatus}
            className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 text-left"
          >
            {product.published ? <PowerOff size={14} /> : <Power size={14} />} 
            {product.published ? "Desativar Produto" : "Ativar Produto"}
          </button>

          <div className="h-px bg-neutral-100 my-1" />

          <button 
            onClick={deleteProduct}
            className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left font-medium"
          >
            <Trash2 size={14} /> Eliminar
          </button>
        </div>
      )}
    </div>
  )
}
