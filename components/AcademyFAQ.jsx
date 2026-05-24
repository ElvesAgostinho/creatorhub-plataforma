"use client"

import { useState } from "react"

const faqs = [
  {
    question: "O que é a Academia ABOVE e quantas posso criar?",
    answer: "A Academia ABOVE é a tua área de membros exclusiva onde podes alojar todos os teus cursos, ebooks e mentorias. Podes criar as áreas que precisares consoante a tua estratégia de negócio."
  },
  {
    question: "Como adiciono vídeos ao meu conteúdo?",
    answer: "Podes usar o Player ABOVE para fazer upload direto dos teus vídeos de forma segura e rápida, sem precisares de plataformas externas."
  },
  {
    question: "Como configuro um certificado para o meu curso?",
    answer: "Dentro das definições do teu curso na Academia, podes ativar a emissão automática de certificados de conclusão para os teus alunos."
  },
  {
    question: "Quem pode usar a Academia ABOVE?",
    answer: "Qualquer criador de conteúdo, especialista ou marca que pretenda vender e entregar conhecimento de forma profissional."
  },
  {
    question: "A Academia ABOVE é paga?",
    answer: "A criação da Academia é gratuita. Apenas pagas uma pequena taxa sobre as vendas que realizares, sem mensalidades fixas."
  },
  {
    question: "Como giro o acesso aos produtos?",
    answer: "O acesso é libertado automaticamente após a compra. Podes também adicionar alunos manualmente, criar turmas e definir prazos de acesso."
  },
  {
    question: "Como personalizo a minha área de membros?",
    answer: "Podes alterar cores, logótipos, banners, imagens de fundo e muito mais para que a Academia tenha a identidade visual da tua marca."
  }
]

export default function AcademyFAQ() {
  const [openIndex, setOpenIndex] = useState(null)

  const toggle = (index) => {
    if (openIndex === index) {
      setOpenIndex(null)
    } else {
      setOpenIndex(index)
    }
  }

  return (
    <div className="max-w-4xl mx-auto mt-16 space-y-4">
      {faqs.map((faq, index) => {
        const isOpen = openIndex === index
        return (
          <div key={index} className="border-b border-neutral-200">
            <button
              onClick={() => toggle(index)}
              className="w-full text-left py-6 flex justify-between items-center hover:text-[#FF4500] transition"
            >
              <span className="font-semibold text-lg">{index + 1}. {faq.question}</span>
              <span className="text-2xl font-light text-neutral-400">{isOpen ? "-" : "+"}</span>
            </button>
            {isOpen && (
              <div className="pb-6 text-neutral-600 leading-relaxed pr-8">
                {faq.answer}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
