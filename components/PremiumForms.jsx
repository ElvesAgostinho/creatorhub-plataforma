"use client"

import React from 'react'

export function PremiumInput({ label, name, type = "text", helper, ...props }) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && <label htmlFor={name} className="text-sm font-bold text-neutral-800">{label}</label>}
      <input
        id={name}
        name={name}
        type={type}
        className="w-full bg-[#F8F7F5] border border-neutral-300 rounded-xl px-4 py-3.5 text-neutral-900 outline-none transition-all duration-300 focus:bg-white focus:border-[#FF4500] focus:ring-4 focus:ring-[#FF4500]/10 hover:border-neutral-400 font-medium"
        {...props}
      />
      {helper && <p className="text-xs text-neutral-500 font-medium ml-1">{helper}</p>}
    </div>
  )
}

export function PremiumTextarea({ label, name, helper, rows = 4, ...props }) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && <label htmlFor={name} className="text-sm font-bold text-neutral-800">{label}</label>}
      <textarea
        id={name}
        name={name}
        rows={rows}
        className="w-full bg-[#F8F7F5] border border-neutral-300 rounded-xl px-4 py-3.5 text-neutral-900 outline-none transition-all duration-300 focus:bg-white focus:border-[#FF4500] focus:ring-4 focus:ring-[#FF4500]/10 hover:border-neutral-400 font-medium resize-y"
        {...props}
      />
      {helper && <p className="text-xs text-neutral-500 font-medium ml-1">{helper}</p>}
    </div>
  )
}

export function PremiumSelect({ label, name, options = [], helper, ...props }) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && <label htmlFor={name} className="text-sm font-bold text-neutral-800">{label}</label>}
      <div className="relative">
        <select
          id={name}
          name={name}
          className="w-full appearance-none bg-[#F8F7F5] border border-neutral-300 rounded-xl pl-4 pr-10 py-3.5 text-neutral-900 outline-none transition-all duration-300 focus:bg-white focus:border-[#FF4500] focus:ring-4 focus:ring-[#FF4500]/10 hover:border-neutral-400 font-medium cursor-pointer"
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>{opt.label}</option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-neutral-500">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m6 9 6 6 6-6"/></svg>
        </div>
      </div>
      {helper && <p className="text-xs text-neutral-500 font-medium ml-1">{helper}</p>}
    </div>
  )
}

export function PremiumButton({ children, loading, variant = "primary", className = "", ...props }) {
  const baseStyle = "relative flex items-center justify-center gap-2 font-bold px-8 py-4 rounded-xl transition-all duration-300 overflow-hidden group w-full sm:w-auto"
  
  const variants = {
    primary: "bg-[#111] text-white hover:bg-black shadow-[0_4px_14px_0_rgba(0,0,0,0.15)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.23)] hover:-translate-y-0.5",
    orange: "bg-[#FF4500] text-white hover:bg-[#E03E00] shadow-[0_4px_14px_0_rgba(255,69,0,0.2)] hover:shadow-[0_6px_20px_rgba(255,69,0,0.3)] hover:-translate-y-0.5",
    secondary: "bg-white text-neutral-800 border border-neutral-300 hover:bg-neutral-50 hover:border-neutral-400"
  }

  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${loading ? "opacity-70 cursor-not-allowed" : ""} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      <span className="relative z-10">{children}</span>
      {/* Efeito de brilho ao passar o rato */}
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:animate-[shimmer_1.5s_infinite]"></div>
    </button>
  )
}
