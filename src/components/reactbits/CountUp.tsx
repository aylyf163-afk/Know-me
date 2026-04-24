import { useEffect, useRef, useState } from 'react'

interface CountUpProps {
  end: number
  durationMs?: number
  decimals?: number
  suffix?: string
}

export default function CountUp({ end, durationMs = 1100, decimals = 0, suffix = '' }: CountUpProps) {
  const [value, setValue] = useState(0)
  const [hasStarted, setHasStarted] = useState(false)
  const hostRef = useRef<HTMLSpanElement | null>(null)

  useEffect(() => {
    const el = hostRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0]
        if (first?.isIntersecting) {
          setHasStarted(true)
          observer.disconnect()
        }
      },
      { threshold: 0.35 },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!hasStarted) return

    let rafId = 0
    const start = performance.now()

    const tick = (time: number) => {
      const progress = Math.min(1, (time - start) / durationMs)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(end * eased)
      if (progress < 1) rafId = window.requestAnimationFrame(tick)
    }

    rafId = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(rafId)
  }, [durationMs, end, hasStarted])

  return (
    <span ref={hostRef}>
      {value.toFixed(decimals)}
      {suffix}
    </span>
  )
}
