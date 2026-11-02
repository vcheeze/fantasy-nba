'use client'

import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useState } from 'react'

type LoadingTextProps = {
  text: string
}
export function LoadingText({ text }: LoadingTextProps) {
  const reduce = useReducedMotion()
  return (
    <div aria-live="polite" className="relative min-h-7">
      <AnimatePresence mode="wait">
        <motion.p
          animate={{ opacity: 1, y: 0 }}
          className="w-full font-medium text-lg"
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
          initial={reduce ? false : { opacity: 0, y: 8 }}
          key={text}
          transition={{ type: 'spring', stiffness: 260, damping: 26 }}
        >
          {text}
        </motion.p>
      </AnimatePresence>
    </div>
  )
}
type LoadingProps = {
  messages: string[]
  interval?: number
}
export function TextLoader({ messages, interval = 2000 }: LoadingProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  useEffect(() => {
    const messageInterval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % messages.length)
    }, interval)
    return () => clearInterval(messageInterval)
  }, [messages.length, interval])

  return (
    <output className="block space-y-3 rounded-md border bg-card px-5 py-5">
      <LoadingText text={messages[currentIndex]} />
      <div className="relative h-1 w-full overflow-hidden rounded-full bg-muted">
        <div className="absolute inset-y-0 left-0 w-2/5 animate-indeterminate rounded-full bg-signal" />
      </div>
    </output>
  )
}
