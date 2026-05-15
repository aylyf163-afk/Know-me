import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import * as THREE from 'three'
import i18n from '../../i18n'
import './V0CardScanner.css'

type ExperienceItem = {
  title: string
  summary?: string
  image?: string
  stack?: string[]
  goals?: string[]
}

const codeChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789(){}[]<>;:,._-+=!@#$%^&*|\\/\"'`~?"

function normalizeSource(s: string) {
  return s.replace(/\s+/g, ' ').trim()
}

function makeAsciiFromSource(source: string, width: number, height: number) {
  const normalized = normalizeSource(source)
  const seed = normalized.length || 1
  const rand = (i: number) => {
    const x = Math.sin((i + seed) * 999.123) * 10000
    return x - Math.floor(x)
  }
  const base = normalized.length ? normalized : 'v0 scanner'

  const total = width * height
  let out = ''
  for (let i = 0; i < total; i++) {
    const baseChar = base.charCodeAt(i % base.length) || 32
    const pick = Math.floor(((baseChar % 97) / 96 + rand(i) * 0.32) * (codeChars.length - 1))
    out += codeChars[Math.max(0, Math.min(codeChars.length - 1, pick))]
    if ((i + 1) % width === 0 && i !== total - 1) out += '\n'
  }
  return out
}

export default function V0CardScanner({ lang = 'zh' }: { lang?: 'zh' | 'en' }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const particleCanvasRef = useRef<HTMLCanvasElement>(null)
  const scannerCanvasRef = useRef<HTMLCanvasElement>(null)
  const cardStreamRef = useRef<HTMLDivElement>(null)
  const cardLineRef = useRef<HTMLDivElement>(null)
  const [activeItem, setActiveItem] = useState<ExperienceItem | null>(null)

  const items = useMemo(() => {
    const arr = i18n.t('projects.scrolly.items', { lng: lang, returnObjects: true }) as ExperienceItem[]
    return (arr ?? []).filter(Boolean)
  }, [lang])

  useEffect(() => {
    if (!activeItem) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [activeItem])

  useEffect(() => {
    if (!cardLineRef.current || !particleCanvasRef.current || !scannerCanvasRef.current || !cardStreamRef.current) return

    const cardWidth = 400
    const cardHeight = 250
    const cardGap = 60

    class CardStreamController {
      container: HTMLElement
      cardLine: HTMLElement
      position = 0
      velocity = 120
      direction = -1
      isAnimating = true
      isDragging = false
      lastTime = 0
      lastMouseX = 0
      mouseVelocity = 0
      friction = 0.95
      minVelocity = 30
      containerWidth = 0
      cardLineWidth = 0
      savedVelocity = 120
      savedDirection = -1
      isPausedByHover = false
      pointerDownX = 0
      pointerDownAt = 0
      hoverRaf = 0
      isMouseOverCard = false
      destroyed = false
      animateRaf = 0
      clippingRaf = 0
      asciiInterval: number | null = null

      constructor(container: HTMLElement, cardLine: HTMLElement) {
        this.container = container
        this.cardLine = cardLine
        this.init()
      }

      init() {
        this.populateCardLine()
        this.calculateDimensions()
        this.setupEventListeners()
        this.updateCardPosition()
        this.animate()
        this.startPeriodicUpdates()
      }

      calculateDimensions() {
        this.containerWidth = this.container.offsetWidth
        const cardCount = this.cardLine.children.length
        this.cardLineWidth = (cardWidth + cardGap) * cardCount
      }

      setupEventListeners() {
        // Use a non-moving hit area to avoid enter/leave oscillation while the line is translating.
        this.container.addEventListener('mousedown', (e) => this.startDrag(e))
        document.addEventListener('mousemove', (e) => this.onDrag(e))
        document.addEventListener('mouseup', () => this.endDrag())

        this.container.addEventListener('touchstart', (e) => this.startDrag(e.touches[0]), { passive: false })
        document.addEventListener('touchmove', (e) => this.onDrag(e.touches[0]), { passive: false })
        document.addEventListener('touchend', () => this.endDrag())

        this.container.addEventListener('wheel', (e) => this.onWheel(e), { passive: false })
        this.container.addEventListener('selectstart', (e) => e.preventDefault())
        this.container.addEventListener('dragstart', (e) => e.preventDefault())

        const updateHoverState = (clientX: number, clientY: number) => {
          if (this.hoverRaf) return
          this.hoverRaf = requestAnimationFrame(() => {
            this.hoverRaf = 0
            if (this.isDragging) return
            const el = document.elementFromPoint(clientX, clientY) as Element | null
            const overCard = Boolean(el?.closest('.v0cs-card-wrapper'))
            if (overCard !== this.isMouseOverCard) {
              this.isMouseOverCard = overCard
              if (overCard) this.pauseByHover()
              else this.resumeFromHover()
            }
          })
        }

        this.container.addEventListener('mousemove', (e) => updateHoverState(e.clientX, e.clientY))
        this.container.addEventListener('mouseleave', () => {
          this.isMouseOverCard = false
          this.resumeFromHover()
        })

        window.addEventListener('resize', () => this.calculateDimensions())
      }

      pauseByHover() {
        if (this.isDragging) return
        if (this.isPausedByHover) return
        this.savedVelocity = this.velocity
        this.savedDirection = this.direction
        this.isPausedByHover = true
        this.isAnimating = false
      }

      resumeFromHover() {
        if (!this.isPausedByHover) return
        this.isPausedByHover = false
        this.velocity = this.savedVelocity
        this.direction = this.savedDirection
        this.isAnimating = true
      }

      startDrag(e: MouseEvent | Touch) {
        if ('preventDefault' in e) {
          ;(e as MouseEvent).preventDefault()
        }
        this.pointerDownX = e.clientX
        this.pointerDownAt = performance.now()
        this.isDragging = true
        this.isAnimating = false
        this.lastMouseX = e.clientX
        this.mouseVelocity = 0

        const transform = window.getComputedStyle(this.cardLine).transform
        if (transform !== 'none') {
          const matrix = new DOMMatrix(transform)
          this.position = matrix.m41
        }

        ;(this.cardLine as HTMLElement).style.animation = 'none'
        this.cardLine.classList.add('dragging')
        document.body.style.userSelect = 'none'
        document.body.style.cursor = 'grabbing'
      }

      onDrag(e: MouseEvent | Touch) {
        if (!this.isDragging) return
        if ('preventDefault' in e) {
          ;(e as MouseEvent).preventDefault()
        }

        const deltaX = e.clientX - this.lastMouseX
        this.position += deltaX
        this.mouseVelocity = deltaX * 60
        this.lastMouseX = e.clientX

        ;(this.cardLine as HTMLElement).style.transform = `translateX(${this.position}px)`
        this.updateCardClipping()
      }

      endDrag() {
        if (!this.isDragging) return
        this.isDragging = false
        this.cardLine.classList.remove('dragging')

        if (Math.abs(this.mouseVelocity) > this.minVelocity) {
          this.velocity = Math.abs(this.mouseVelocity)
          this.direction = this.mouseVelocity > 0 ? 1 : -1
        } else {
          this.velocity = 120
        }

        this.isAnimating = true
        document.body.style.userSelect = ''
        document.body.style.cursor = ''
      }

      animate() {
        if (this.destroyed) return
        const currentTime = performance.now()
        const deltaTime = (currentTime - this.lastTime) / 1000
        this.lastTime = currentTime

        if (this.isAnimating && !this.isDragging) {
          if (this.velocity > this.minVelocity) {
            this.velocity *= this.friction
          } else {
            this.velocity = Math.max(this.minVelocity, this.velocity)
          }
          this.position += this.velocity * this.direction * deltaTime
          this.updateCardPosition()
        }

        this.animateRaf = requestAnimationFrame(() => this.animate())
      }

      updateCardPosition() {
        const containerWidth = this.containerWidth
        const cardLineWidth = this.cardLineWidth

        if (this.position < -cardLineWidth) {
          this.position = containerWidth
        } else if (this.position > containerWidth) {
          this.position = -cardLineWidth
        }

        ;(this.cardLine as HTMLElement).style.transform = `translateX(${this.position}px)`
        this.updateCardClipping()
      }

      onWheel(e: WheelEvent) {
        e.preventDefault()
        if (this.isPausedByHover && !this.isDragging) return
        const scrollSpeed = 20
        const delta = e.deltaY > 0 ? scrollSpeed : -scrollSpeed
        this.position += delta
        this.updateCardPosition()
        this.updateCardClipping()
      }

      calculateCodeDimensions() {
        const fontSize = 11
        const lineHeight = 13
        const charWidth = 6
        const width = Math.floor(cardWidth / charWidth)
        const height = Math.floor(cardHeight / lineHeight)
        return { width, height, fontSize, lineHeight }
      }

      createCardWrapper(index: number): HTMLDivElement {
        const wrapper = document.createElement('div')
        wrapper.className = 'v0cs-card-wrapper'

        const normalCard = document.createElement('div')
        normalCard.className = 'v0cs-card v0cs-card-normal'

        const item = items[index % Math.max(1, items.length)]
        const header = document.createElement('div')
        header.className = 'v0cs-card-head'

        const badge = document.createElement('div')
        badge.className = 'v0cs-card-badge'
        badge.textContent = `0${(index % Math.max(1, items.length)) + 1}`.slice(-2)

        const titleWrap = document.createElement('div')
        titleWrap.className = 'v0cs-card-titlewrap'

        const title = document.createElement('div')
        title.className = 'v0cs-card-title'
        title.textContent = item?.title || ''

        const status = document.createElement('div')
        status.className = 'v0cs-card-status'
        status.textContent = i18n.t('projects.galleryViewDetails', { lng: lang })

        titleWrap.appendChild(title)
        titleWrap.appendChild(status)
        header.appendChild(badge)
        header.appendChild(titleWrap)

        const desc = document.createElement('div')
        desc.className = 'v0cs-card-desc'
        desc.textContent = item?.summary || (item?.goals?.[0] ?? '')

        const tags = document.createElement('div')
        tags.className = 'v0cs-card-tags'
        ;(item?.stack ?? []).slice(0, 4).forEach((t) => {
          const tag = document.createElement('span')
          tag.className = 'v0cs-card-tag'
          tag.textContent = t
          tags.appendChild(tag)
        })

        const footer = document.createElement('div')
        footer.className = 'v0cs-card-foot'

        const metric = document.createElement('div')
        metric.className = 'v0cs-card-metric'
        const metricLabel = document.createElement('span')
        metricLabel.className = 'v0cs-card-metric-label'
        metricLabel.textContent = i18n.t('projects.galleryOutcomes', { lng: lang })
        const metricValue = document.createElement('span')
        metricValue.className = 'v0cs-card-metric-value'
        metricValue.textContent = item?.goals?.[0] || ''
        metric.appendChild(metricLabel)
        metric.appendChild(metricValue)

        const thumb = document.createElement('div')
        thumb.className = 'v0cs-card-thumb'
        if (item?.image) {
          const thumbImg = document.createElement('img')
          thumbImg.className = 'v0cs-card-thumb-img'
          thumbImg.src = item.image
          thumbImg.alt = ''
          thumb.appendChild(thumbImg)
        } else {
          const thumbFallback = document.createElement('div')
          thumbFallback.className = 'v0cs-card-thumb-fallback'
          thumb.appendChild(thumbFallback)
        }

        footer.appendChild(metric)
        footer.appendChild(thumb)

        const meta = document.createElement('div')
        meta.className = 'v0cs-card-meta'
        meta.appendChild(header)
        meta.appendChild(desc)
        meta.appendChild(tags)
        meta.appendChild(footer)
        normalCard.appendChild(meta)

        const asciiCard = document.createElement('div')
        asciiCard.className = 'v0cs-card v0cs-card-ascii'

        const asciiContent = document.createElement('div')
        asciiContent.className = 'v0cs-ascii-content'
        const { width, height, fontSize, lineHeight } = this.calculateCodeDimensions()
        asciiContent.style.fontSize = `${fontSize}px`
        asciiContent.style.lineHeight = `${lineHeight}px`

        const src = [
          item?.title ?? '',
          item?.summary ?? '',
          (item?.stack ?? []).join(' / '),
          (item?.goals ?? []).join(' · '),
        ]
          .filter(Boolean)
          .join(' | ')

        asciiContent.textContent = makeAsciiFromSource(src, width, height)
        asciiCard.appendChild(asciiContent)

        wrapper.appendChild(normalCard)
        wrapper.appendChild(asciiCard)

        wrapper.addEventListener('pointerdown', (e) => {
          this.pointerDownX = e.clientX
          this.pointerDownAt = performance.now()
        })
        wrapper.addEventListener('click', (e) => {
          e.preventDefault()
          if (this.isDragging) return
          const dx = Math.abs((e as MouseEvent).clientX - this.pointerDownX)
          const dt = performance.now() - this.pointerDownAt
          if (dx > 8 || dt > 600) return
          if (!item) return
          setActiveItem(item)
        })

        return wrapper
      }

      updateCardClipping() {
        const rect = containerRef.current?.getBoundingClientRect()
        const scannerX = (rect?.left ?? 0) + (rect?.width ?? window.innerWidth) / 2
        const scannerWidth = 8
        const scannerLeft = scannerX - scannerWidth / 2
        const scannerRight = scannerX + scannerWidth / 2
        let anyScanningActive = false

        document.querySelectorAll('.v0cs-card-wrapper').forEach((wrapper) => {
          const r = (wrapper as HTMLElement).getBoundingClientRect()
          const cardLeft = r.left
          const cardRight = r.right
          const w = r.width || 1

          const normalCard = (wrapper as HTMLElement).querySelector('.v0cs-card-normal') as HTMLElement | null
          const asciiCard = (wrapper as HTMLElement).querySelector('.v0cs-card-ascii') as HTMLElement | null
          if (!normalCard || !asciiCard) return

          if (cardLeft < scannerRight && cardRight > scannerLeft) {
            anyScanningActive = true
            const scannerIntersectLeft = Math.max(scannerLeft - cardLeft, 0)
            const scannerIntersectRight = Math.min(scannerRight - cardLeft, w)

            const normalClipRight = (scannerIntersectLeft / w) * 100
            const asciiClipLeft = (scannerIntersectRight / w) * 100

            normalCard.style.setProperty('--clip-right', `${normalClipRight}%`)
            asciiCard.style.setProperty('--clip-left', `${asciiClipLeft}%`)

            if (!(wrapper as HTMLElement).hasAttribute('data-scanned') && scannerIntersectLeft > 0) {
              ;(wrapper as HTMLElement).setAttribute('data-scanned', 'true')
              const scanEffect = document.createElement('div')
              scanEffect.className = 'v0cs-scan-effect'
              wrapper.appendChild(scanEffect)
              window.setTimeout(() => scanEffect.parentNode?.removeChild(scanEffect), 600)
            }
          } else {
            if (cardRight < scannerLeft) {
              normalCard.style.setProperty('--clip-right', '100%')
              asciiCard.style.setProperty('--clip-left', '100%')
            } else if (cardLeft > scannerRight) {
              normalCard.style.setProperty('--clip-right', '0%')
              asciiCard.style.setProperty('--clip-left', '0%')
            }
            ;(wrapper as HTMLElement).removeAttribute('data-scanned')
          }
        })

        window.__v0ScannerSetScanning?.(anyScanningActive)
      }

      updateAsciiContent() {
        const { width, height } = this.calculateCodeDimensions()
        document.querySelectorAll('.v0cs-ascii-content').forEach((content, idx) => {
          if (Math.random() < 0.15) {
            const item = items[idx % Math.max(1, items.length)]
            const src = [
              item?.title ?? '',
              item?.summary ?? '',
              (item?.stack ?? []).join(' / '),
              (item?.goals ?? []).join(' · '),
            ]
              .filter(Boolean)
              .join(' | ')
            ;(content as HTMLElement).textContent = makeAsciiFromSource(src, width, height)
          }
        })
      }

      populateCardLine() {
        this.cardLine.innerHTML = ''
        const cardsCount = Math.max(18, items.length * 6)
        for (let i = 0; i < cardsCount; i++) {
          this.cardLine.appendChild(this.createCardWrapper(i))
        }
      }

      startPeriodicUpdates() {
        this.asciiInterval = window.setInterval(() => this.updateAsciiContent(), 200)
        const updateClipping = () => {
          if (this.destroyed) return
          this.updateCardClipping()
          this.clippingRaf = requestAnimationFrame(updateClipping)
        }
        updateClipping()
      }

      destroy() {
        this.destroyed = true
        if (this.hoverRaf) cancelAnimationFrame(this.hoverRaf)
        if (this.animateRaf) cancelAnimationFrame(this.animateRaf)
        if (this.clippingRaf) cancelAnimationFrame(this.clippingRaf)
        if (this.asciiInterval) window.clearInterval(this.asciiInterval)
        this.asciiInterval = null
        document.body.style.userSelect = ''
        document.body.style.cursor = ''
      }
    }

    class ParticleSystem {
      scene = new THREE.Scene()
      camera = new THREE.OrthographicCamera(-window.innerWidth / 2, window.innerWidth / 2, 125, -125, 1, 1000)
      renderer: THREE.WebGLRenderer
      particles: THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial> | null = null
      particleCount = 400
      velocities = new Float32Array(0)
      raf = 0
      destroyed = false

      constructor(canvas: HTMLCanvasElement) {
        this.camera.position.z = 100
        this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
        this.renderer.setSize(window.innerWidth, 250)
        this.renderer.setClearColor(0x000000, 0)
        this.createParticles()
        this.animate()
        window.addEventListener('resize', () => this.onWindowResize())
      }

      createParticles() {
        const geometry = new THREE.BufferGeometry()
        const positions = new Float32Array(this.particleCount * 3)
        const colors = new Float32Array(this.particleCount * 3)
        const sizes = new Float32Array(this.particleCount)
        const velocities = new Float32Array(this.particleCount)

        const c = document.createElement('canvas')
        c.width = 100
        c.height = 100
        const ctx = c.getContext('2d')
        if (!ctx) return
        const half = c.width / 2
        const hue = 217
        const gradient = ctx.createRadialGradient(half, half, 0, half, half, half)
        gradient.addColorStop(0.025, '#fff')
        gradient.addColorStop(0.1, `hsl(${hue}, 61%, 33%)`)
        gradient.addColorStop(0.25, `hsl(${hue}, 64%, 6%)`)
        gradient.addColorStop(1, 'transparent')
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(half, half, half, 0, Math.PI * 2)
        ctx.fill()
        const texture = new THREE.CanvasTexture(c)

        const alphas = new Float32Array(this.particleCount)
        for (let i = 0; i < this.particleCount; i++) {
          positions[i * 3] = (Math.random() - 0.5) * window.innerWidth * 2
          positions[i * 3 + 1] = (Math.random() - 0.5) * 250
          positions[i * 3 + 2] = 0
          colors[i * 3] = 1
          colors[i * 3 + 1] = 1
          colors[i * 3 + 2] = 1
          const orbitRadius = Math.random() * 200 + 100
          sizes[i] = (Math.random() * (orbitRadius - 60) + 60) / 8
          velocities[i] = Math.random() * 60 + 30
          alphas[i] = (Math.random() * 8 + 2) / 10
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))
        geometry.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1))
        this.velocities = velocities

        const material = new THREE.ShaderMaterial({
          uniforms: { pointTexture: { value: texture }, size: { value: 15.0 } },
          vertexShader: `
            attribute float alpha;
            varying float vAlpha;
            varying vec3 vColor;
            uniform float size;
            void main() {
              vAlpha = alpha;
              vColor = color;
              vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
              gl_PointSize = size;
              gl_Position = projectionMatrix * mvPosition;
            }
          `,
          fragmentShader: `
            uniform sampler2D pointTexture;
            varying float vAlpha;
            varying vec3 vColor;
            void main() {
              gl_FragColor = vec4(vColor, vAlpha) * texture2D(pointTexture, gl_PointCoord);
            }
          `,
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          vertexColors: true,
        })

        this.particles = new THREE.Points(geometry, material)
        this.scene.add(this.particles)
      }

      animate() {
        if (this.destroyed) return
        this.raf = requestAnimationFrame(() => this.animate())
        if (this.particles) {
          const pos = this.particles.geometry.attributes.position.array as Float32Array
          const alpha = this.particles.geometry.attributes.alpha.array as Float32Array
          const time = Date.now() * 0.001
          for (let i = 0; i < this.particleCount; i++) {
            pos[i * 3] += this.velocities[i] * 0.016
            if (pos[i * 3] > window.innerWidth / 2 + 100) {
              pos[i * 3] = -window.innerWidth / 2 - 100
              pos[i * 3 + 1] = (Math.random() - 0.5) * 250
            }
            pos[i * 3 + 1] += Math.sin(time + i * 0.1) * 0.5
            const twinkle = Math.floor(Math.random() * 10)
            if (twinkle === 1 && alpha[i] > 0) alpha[i] -= 0.05
            else if (twinkle === 2 && alpha[i] < 1) alpha[i] += 0.05
            alpha[i] = Math.max(0, Math.min(1, alpha[i]))
          }
          this.particles.geometry.attributes.position.needsUpdate = true
          this.particles.geometry.attributes.alpha.needsUpdate = true
        }
        this.renderer.render(this.scene, this.camera)
      }

      onWindowResize() {
        this.camera.left = -window.innerWidth / 2
        this.camera.right = window.innerWidth / 2
        this.camera.updateProjectionMatrix()
        this.renderer.setSize(window.innerWidth, 250)
      }

      destroy() {
        this.destroyed = true
        if (this.raf) cancelAnimationFrame(this.raf)
        this.renderer.dispose()
        if (this.particles) {
          this.scene.remove(this.particles)
          this.particles.geometry.dispose()
          this.particles.material.dispose()
        }
      }
    }

    type GlowParticle = {
      x: number
      y: number
      vx: number
      vy: number
      radius: number
      alpha: number
      decay: number
      originalAlpha: number
      life: number
      time: number
      startX: number
      twinkleSpeed: number
      twinkleAmount: number
    }

    class ParticleScanner {
      canvas: HTMLCanvasElement
      ctx: CanvasRenderingContext2D
      animationId: number | null = null
      w = window.innerWidth
      h = 300
      particles: GlowParticle[] = []
      maxParticles = 800
      intensity = 0.8
      lightBarX = this.w / 2
      lightBarWidth = 3
      fadeZone = 60
      scanTargetIntensity = 1.8
      scanTargetParticles = 2500
      scanTargetFadeZone = 35
      scanningActive = false
      baseIntensity = this.intensity
      baseMaxParticles = this.maxParticles
      baseFadeZone = this.fadeZone
      currentIntensity = this.intensity
      currentMaxParticles = this.maxParticles
      currentFadeZone = this.fadeZone
      transitionSpeed = 0.05
      gradientCanvas: HTMLCanvasElement
      gradientCtx: CanvasRenderingContext2D
      currentGlowIntensity = 1

      constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas
        this.ctx = canvas.getContext('2d')!
        this.gradientCanvas = document.createElement('canvas')
        this.gradientCtx = this.gradientCanvas.getContext('2d')!
        this.setupCanvas()
        this.createGradientCache()
        this.initParticles()
        this.animate()
        window.addEventListener('resize', () => this.onResize())
      }

      setupCanvas() {
        this.canvas.width = this.w
        this.canvas.height = this.h
        this.canvas.style.width = `${this.w}px`
        this.canvas.style.height = `${this.h}px`
        this.ctx.clearRect(0, 0, this.w, this.h)
      }

      onResize() {
        this.w = window.innerWidth
        this.lightBarX = this.w / 2
        this.setupCanvas()
      }

      createGradientCache() {
        this.gradientCanvas.width = 16
        this.gradientCanvas.height = 16
        const half = this.gradientCanvas.width / 2
        const gradient = this.gradientCtx.createRadialGradient(half, half, 0, half, half, half)
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)')
        gradient.addColorStop(0.3, 'rgba(173, 216, 230, 0.8)')
        gradient.addColorStop(0.7, 'rgba(135, 206, 250, 0.4)')
        gradient.addColorStop(1, 'transparent')
        this.gradientCtx.fillStyle = gradient
        this.gradientCtx.beginPath()
        this.gradientCtx.arc(half, half, half, 0, Math.PI * 2)
        this.gradientCtx.fill()
      }

      randomFloat(min: number, max: number) {
        return Math.random() * (max - min) + min
      }

      createParticle(): GlowParticle {
        const intensityRatio = this.intensity / this.baseIntensity
        const speedMultiplier = 1 + (intensityRatio - 1) * 1.2
        const sizeMultiplier = 1 + (intensityRatio - 1) * 0.7
        return {
          x: this.lightBarX + this.randomFloat(-this.lightBarWidth / 2, this.lightBarWidth / 2),
          y: this.randomFloat(0, this.h),
          vx: this.randomFloat(0.2, 1.0) * speedMultiplier,
          vy: this.randomFloat(-0.15, 0.15) * speedMultiplier,
          radius: this.randomFloat(0.4, 1) * sizeMultiplier,
          alpha: this.randomFloat(0.6, 1),
          decay: this.randomFloat(0.005, 0.025) * (2 - intensityRatio * 0.5),
          originalAlpha: 0,
          life: 1.0,
          time: 0,
          startX: 0,
          twinkleSpeed: this.randomFloat(0.02, 0.08) * speedMultiplier,
          twinkleAmount: this.randomFloat(0.1, 0.25),
        }
      }

      initParticles() {
        this.particles = []
        for (let i = 0; i < this.maxParticles; i++) {
          const p = this.createParticle()
          p.originalAlpha = p.alpha
          p.startX = p.x
          this.particles.push(p)
        }
      }

      updateParticle(p: GlowParticle) {
        p.x += p.vx
        p.y += p.vy
        p.time++
        p.alpha = p.originalAlpha * p.life + Math.sin(p.time * p.twinkleSpeed) * p.twinkleAmount
        p.life -= p.decay
        if (p.x > this.w + 10 || p.life <= 0) this.resetParticle(p)
      }

      resetParticle(p: GlowParticle) {
        p.x = this.lightBarX + this.randomFloat(-this.lightBarWidth / 2, this.lightBarWidth / 2)
        p.y = this.randomFloat(0, this.h)
        p.vx = this.randomFloat(0.2, 1.0)
        p.vy = this.randomFloat(-0.15, 0.15)
        p.alpha = this.randomFloat(0.6, 1)
        p.originalAlpha = p.alpha
        p.life = 1.0
        p.time = 0
        p.startX = p.x
      }

      drawParticle(p: GlowParticle) {
        if (p.life <= 0) return
        let fadeAlpha = 1
        if (p.y < this.fadeZone) fadeAlpha = p.y / this.fadeZone
        else if (p.y > this.h - this.fadeZone) fadeAlpha = (this.h - p.y) / this.fadeZone
        fadeAlpha = Math.max(0, Math.min(1, fadeAlpha))
        this.ctx.globalAlpha = p.alpha * fadeAlpha
        this.ctx.drawImage(this.gradientCanvas, p.x - p.radius, p.y - p.radius, p.radius * 2, p.radius * 2)
      }

      drawLightBar() {
        const idleHeight = cardHeight * 0.8
        const currentHeight = this.scanningActive ? cardHeight : idleHeight
        const drawY = (this.h - currentHeight) / 2
        const currentFadeZone = this.scanningActive ? 5 : this.fadeZone

        const verticalGradient = this.ctx.createLinearGradient(0, drawY, 0, drawY + currentHeight)
        verticalGradient.addColorStop(0, 'rgba(255, 255, 255, 0)')
        verticalGradient.addColorStop(Math.min(0.5, currentFadeZone / currentHeight), 'rgba(255, 255, 255, 1)')
        verticalGradient.addColorStop(Math.max(0.5, 1 - currentFadeZone / currentHeight), 'rgba(255, 255, 255, 1)')
        verticalGradient.addColorStop(1, 'rgba(255, 255, 255, 0)')

        this.ctx.globalCompositeOperation = 'lighter'
        const targetGlowIntensity = this.scanningActive ? 3.5 : 1
        this.currentGlowIntensity += (targetGlowIntensity - this.currentGlowIntensity) * this.transitionSpeed
        const glowIntensity = this.currentGlowIntensity
        const lineWidth = this.lightBarWidth

        const coreGradient = this.ctx.createLinearGradient(this.lightBarX - lineWidth / 2, 0, this.lightBarX + lineWidth / 2, 0)
        coreGradient.addColorStop(0, 'rgba(255, 255, 255, 0)')
        coreGradient.addColorStop(0.3, `rgba(255, 255, 255, ${0.9 * glowIntensity})`)
        coreGradient.addColorStop(0.5, `rgba(255, 255, 255, ${1 * glowIntensity})`)
        coreGradient.addColorStop(0.7, `rgba(255, 255, 255, ${0.9 * glowIntensity})`)
        coreGradient.addColorStop(1, 'rgba(255, 255, 255, 0)')

        this.ctx.globalAlpha = 1
        this.ctx.fillStyle = coreGradient
        this.ctx.fillRect(this.lightBarX - lineWidth / 2, drawY, lineWidth, currentHeight)

        this.ctx.globalCompositeOperation = 'destination-in'
        this.ctx.globalAlpha = 1
        this.ctx.fillStyle = verticalGradient
        this.ctx.fillRect(0, drawY, this.w, currentHeight)
      }

      render() {
        const targetIntensity = this.scanningActive ? this.scanTargetIntensity : this.baseIntensity
        const targetMaxParticles = this.scanningActive ? this.scanTargetParticles : this.baseMaxParticles
        const targetFadeZone = this.scanningActive ? this.scanTargetFadeZone : this.baseFadeZone

        this.currentIntensity += (targetIntensity - this.currentIntensity) * this.transitionSpeed
        this.currentMaxParticles += (targetMaxParticles - this.currentMaxParticles) * this.transitionSpeed
        this.currentFadeZone += (targetFadeZone - this.currentFadeZone) * this.transitionSpeed

        this.intensity = this.currentIntensity
        this.maxParticles = Math.floor(this.currentMaxParticles)
        this.fadeZone = this.currentFadeZone

        this.ctx.globalCompositeOperation = 'source-over'
        this.ctx.clearRect(0, 0, this.w, this.h)
        this.drawLightBar()

        this.ctx.globalCompositeOperation = 'lighter'
        for (let i = 0; i < this.particles.length; i++) {
          const p = this.particles[i]
          this.updateParticle(p)
          this.drawParticle(p)
        }

        if (Math.random() < this.intensity && this.particles.length < this.maxParticles) {
          const p = this.createParticle()
          p.originalAlpha = p.alpha
          p.startX = p.x
          this.particles.push(p)
        }

        if (this.particles.length > this.maxParticles + 200) {
          this.particles.splice(this.maxParticles, this.particles.length - this.maxParticles)
        }
      }

      animate() {
        this.render()
        this.animationId = requestAnimationFrame(() => this.animate())
      }

      setScanningActive(active: boolean) {
        this.scanningActive = active
      }

      destroy() {
        if (this.animationId) cancelAnimationFrame(this.animationId)
        this.particles = []
      }
    }

    const cardLineEl = cardLineRef.current
    const controller = new CardStreamController(cardStreamRef.current, cardLineEl)
    const particleSystem = new ParticleSystem(particleCanvasRef.current)
    const particleScanner = new ParticleScanner(scannerCanvasRef.current)
    window.__v0ScannerSetScanning = (active: boolean) => particleScanner.setScanningActive(active)

    return () => {
      controller.destroy()
      particleSystem.destroy()
      particleScanner.destroy()
      window.__v0ScannerSetScanning = undefined
      cardLineEl.replaceChildren()
    }
  }, [items])

  return (
    <>
      <div className="v0cs-container" ref={containerRef}>
        <canvas ref={particleCanvasRef} className="v0cs-particle-canvas" />
        <canvas ref={scannerCanvasRef} className="v0cs-scanner-canvas" />
        <div className="v0cs-card-stream" ref={cardStreamRef}>
          <div className="v0cs-card-line" ref={cardLineRef} />
        </div>
      </div>

      {activeItem
        ? createPortal(
            <div className="v0cs-modal-backdrop" role="dialog" aria-modal="true" aria-label={activeItem.title} onClick={() => setActiveItem(null)}>
              <div className="v0cs-modal" onClick={(e) => e.stopPropagation()}>
                <button className="v0cs-modal-close" type="button" onClick={() => setActiveItem(null)} aria-label={i18n.t('projects.galleryClose', { lng: lang })}>
                  {i18n.t('projects.galleryClose', { lng: lang })}
                </button>
                <div className="v0cs-modal-body">
                  <div className="v0cs-modal-head">
                    <h3 className="v0cs-modal-title">{activeItem.title}</h3>
                    {activeItem.summary ? <p className="v0cs-modal-summary">{activeItem.summary}</p> : null}
                  </div>

                  {activeItem.image ? <img className="v0cs-modal-image" src={activeItem.image} alt="" loading="lazy" /> : null}

                  {activeItem.stack?.length ? (
                    <section className="v0cs-modal-section">
                      <div className="v0cs-modal-section-title">{i18n.t('projects.galleryTech', { lng: lang })}</div>
                      <div className="v0cs-modal-tags">
                        {activeItem.stack.map((t) => (
                          <span key={t} className="v0cs-modal-tag">
                            {t}
                          </span>
                        ))}
                      </div>
                    </section>
                  ) : null}

                  {activeItem.goals?.length ? (
                    <section className="v0cs-modal-section">
                      <div className="v0cs-modal-section-title">{i18n.t('projects.galleryOutcomes', { lng: lang })}</div>
                      <ul className="v0cs-modal-list">
                        {activeItem.goals.map((g) => (
                          <li key={g}>{g}</li>
                        ))}
                      </ul>
                    </section>
                  ) : null}
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  )
}

declare global {
  interface Window {
    __v0ScannerSetScanning?: (active: boolean) => void
  }
}

