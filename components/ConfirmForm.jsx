"use client"

export default function ConfirmForm({ action, message, children, className }) {
  return (
    <form
      action={action}
      className={className}
      onSubmit={(e) => {
        if (!confirm(message || "Confirmar?")) e.preventDefault()
      }}
    >
      {children}
    </form>
  )
}
