"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import { submitReview } from "@/app/product/[slug]/actions"

export default function ReviewForm({ productId }) {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (rating === 0) {
      setMessage({ type: "error", text: "Por favor, seleciona uma classificação." })
      return
    }
    
    setIsSubmitting(true)
    setMessage(null)
    
    try {
      const res = await submitReview(productId, rating, comment)
      if (res?.error) {
        setMessage({ type: "error", text: res.error })
      } else {
        setMessage({ type: "success", text: "Avaliação submetida com sucesso!" })
        setComment("")
      }
    } catch (err) {
      setMessage({ type: "error", text: "Ocorreu um erro ao submeter." })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-neutral-50 rounded-2xl p-6 border border-neutral-200 mt-8">
      <h3 className="font-bold text-lg mb-4">Deixa a tua avaliação</h3>
      
      {message && (
        <div className={`p-4 mb-4 rounded-xl text-sm font-bold ${message.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="flex mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-8 h-8 cursor-pointer transition-colors ${
                star <= (hoverRating || rating) 
                  ? "text-yellow-500 fill-yellow-500" 
                  : "text-neutral-300 fill-neutral-300"
              }`}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(star)}
            />
          ))}
        </div>
        
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="O que achaste deste produto? (Opcional)"
          className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF4500] focus:border-transparent transition-all shadow-sm mb-4"
          rows="3"
        />
        
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-neutral-900 hover:bg-black text-white font-bold py-3 px-6 rounded-xl transition-colors disabled:opacity-50"
        >
          {isSubmitting ? "A submeter..." : "Submeter Avaliação"}
        </button>
      </form>
    </div>
  )
}
