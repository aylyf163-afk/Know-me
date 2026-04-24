import { useEffect, useRef } from 'react'

interface ParticlesBackgroundProps {
  className?: string
  color?: string
  count?: number
}

export default function ParticlesBackground({
  className = '',
  color = 'rgba(17, 24, 39, 0.28)',
  count = 72,
}: ParticlesBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const host = canvas.parentElement as HTMLElement | null
    if (!host) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const particles = Array.from({ length: count }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.0007,
      vy: (Math.random() - 0.5) * 0.0007,
      r: 0.9 + Math.random() * 1.8,
    }))

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      const width = host.clientWidth
      const height = host.clientHeight
      if (width === 0 || height === 0) return
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = '100%'
      canvas.style.height = '100%'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    resize()
    window.addEventListener('resize', resize)
    const observer = new ResizeObserver(() => resize())
    observer.observe(host)

    let raf = 0
    const draw = () => {
      const { width, height } = canvas.getBoundingClientRect()
      ctx.clearRect(0, 0, width, height)
      ctx.fillStyle = color

      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy

        if (p.x <= 0 || p.x >= 1) p.vx *= -1
        if (p.y <= 0 || p.y >= 1) p.vy *= -1

        const px = p.x * width
        const py = p.y * height

        ctx.beginPath()
        ctx.arc(px, py, p.r, 0, Math.PI * 2)
        ctx.fill()
      }

      raf = window.requestAnimationFrame(draw)
    }

    raf = window.requestAnimationFrame(draw)

    return () => {
      window.cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      observer.disconnect()
    }
  }, [color, count])

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />
}
