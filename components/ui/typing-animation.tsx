"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/core/utils"

interface TypingAnimationProps {
  text: string
  duration?: number
  className?: string
}

export default function TypingAnimation({
  text,
  duration = 200,
  className,
}: TypingAnimationProps) {
  const [displayedText, setDisplayedText] = useState<string>("")
  const [currentIndex, setCurrentIndex] = useState<number>(0)

  useEffect(() => {
    setDisplayedText("")
    setCurrentIndex(0)
  }, [text])

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(text.substring(0, currentIndex + 1))
        setCurrentIndex(currentIndex + 1)
      }, duration)

      return () => clearTimeout(timeout)
    }
  }, [currentIndex, text, duration])

  return (
    <h1
      className={cn(
        "font-display text-center text-4xl font-bold leading-tight tracking-[-0.02em] drop-shadow-sm",
        className,
      )}
    >
      {displayedText}
      <span className="animate-pulse">|</span>
    </h1>
  )
}