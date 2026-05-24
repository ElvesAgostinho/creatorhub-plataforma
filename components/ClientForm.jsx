"use client"

import { toast } from "react-hot-toast"

export default function ClientForm({ action, successMessage = "Guardado com sucesso!", errorMessage = "Ocorreu um erro.", className = "", children }) {
  async function handleAction(formData) {
    try {
      const promise = action(formData)
      toast.promise(promise, {
        loading: "A guardar...",
        success: successMessage,
        error: errorMessage
      })
      
      const result = await promise
      // Se a action retornar um erro específico { ok: false, error: "..." }
      if (result && result.ok === false && result.error) {
        toast.error(result.error)
      }
    } catch (error) {
      console.error(error)
      toast.error(errorMessage)
    }
  }

  return (
    <form action={handleAction} className={className}>
      {children}
    </form>
  )
}
