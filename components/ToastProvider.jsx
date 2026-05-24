"use client"

import { Toaster } from "react-hot-toast"

export default function ToastProvider() {
  return (
    <Toaster 
      position="bottom-center"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#333',
          color: '#fff',
          borderRadius: '12px',
          fontWeight: 'bold',
          padding: '16px 24px'
        },
        success: {
          iconTheme: {
            primary: '#10B981',
            secondary: '#fff',
          },
        },
      }}
    />
  )
}
