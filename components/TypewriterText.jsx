"use client"
import { useState, useEffect } from "react"

export default function TypewriterText({ text, className, delay = 0, speed = 50 }) {
  const [displayedText, setDisplayedText] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [isFinished, setIsFinished] = useState(false)

  useEffect(() => {
    let timeoutId
    let intervalId
    
    timeoutId = setTimeout(() => {
      setIsTyping(true)
      let index = 0
      
      intervalId = setInterval(() => {
        setDisplayedText(text.slice(0, index + 1))
        index++
        if (index >= text.length) {
          clearInterval(intervalId)
          setIsTyping(false)
          setIsFinished(true)
        }
      }, speed)
    }, delay)

    return () => {
      clearTimeout(timeoutId)
      clearInterval(intervalId)
    }
  }, [text, delay, speed])

  return (
    <span className={className}>
      {displayedText}
      <span className={`inline-block w-[3px] ml-1 bg-current ${!isTyping && !isFinished ? 'opacity-0' : 'animate-pulse'}`}>&nbsp;</span>
    </span>
  )
}
