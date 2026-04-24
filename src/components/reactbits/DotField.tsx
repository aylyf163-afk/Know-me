import { useEffect, useRef } from 'react'

interface DotFieldProps {
  dotSize?: number
  gap?: number
  dotColor?: string
  className?: string
}

export default function DotField({
  dotSize = 1.5,
  gap = 34,
  dotColor = 'rgba(17, 17, 17, 0.22)',
  className = '',
}: DotFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const context = canvas.getContext('2d')
    if (!context) return

    const pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    const target = { x: pointer.x, y: pointer.y }

    const handleMove = (event: MouseEvent) => {
      target.x = event.clientX
      target.y = event.clientY
    }

    window.addEventListener('mousemove', handleMove)

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      const { innerWidth, innerHeight } = window
      canvas.width = innerWidth * dpr
      canvas.height = innerHeight * dpr
      canvas.style.width = `${innerWidth}px`
      canvas.style.height = `${innerHeight}px`
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    resize()
    window.addEventListener('resize', resize)

    let rafId = 0
    const draw = (time: number) => {
      pointer.x += (target.x - pointer.x) * 0.08
      pointer.y += (target.y - pointer.y) * 0.08

      context.clearRect(0, 0, window.innerWidth, window.innerHeight)
      context.fillStyle = dotColor

      for (let y = gap / 2; y < window.innerHeight; y += gap) {
        for (let x = gap / 2; x < window.innerWidth; x += gap) {
          const dx = x - pointer.x
          const dy = y - pointer.y
          const distance = Math.max(Math.sqrt(dx * dx + dy * dy), 1)
          const wave = Math.sin(time * 0.0018 + (x + y) * 0.01) * 0.75
          const pull = Math.max(0, 1 - distance / 280) * 2.2
          const offsetX = (dx / distance) * pull * -4 + wave
          const offsetY = (dy / distance) * pull * -4 + wave

          context.beginPath()
          context.arc(x + offsetX, y + offsetY, dotSize, 0, Math.PI * 2)
          context.fill()
        }
      }

      rafId = window.requestAnimationFrame(draw)
    }

    rafId = window.requestAnimationFrame(draw)

    return () => {
      window.cancelAnimationFrame(rafId)
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('resize', resize)
    }
  }, [dotColor, dotSize, gap])

  return <canvas ref={canvasRef} className={`dot-field ${className}`} aria-hidden="true" />
}
