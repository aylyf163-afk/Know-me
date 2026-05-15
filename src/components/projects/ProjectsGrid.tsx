import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import i18n from '../../i18n'
import './ProjectsGrid.css'

type ExperienceItem = {
  title: string
  summary?: string
  image?: string
  stack?: string[]
  goals?: string[]
}

function ProjectCard({
  item,
  index,
  flipped,
  onToggle,
}: {
  item: ExperienceItem
  index: number
  flipped: boolean
  onToggle: () => void
}) {
  const cardRef = useRef<HTMLButtonElement | null>(null)
  const rafRef = useRef(0)
  const target = useRef(new THREE.Vector2(0, 0))
  const current = useRef(new THREE.Vector2(0, 0))
  const isActive = useRef(false)

  useEffect(() => {
    const el = cardRef.current
    if (!el) return

    const onMove = (clientX: number, clientY: number) => {
      const rect = el.getBoundingClientRect()
      const px = (clientX - rect.left) / rect.width
      const py = (clientY - rect.top) / rect.height
      target.current.set(THREE.MathUtils.clamp(px * 2 - 1, -1, 1), THREE.MathUtils.clamp(py * 2 - 1, -1, 1))
      isActive.current = true
    }

    const animate = () => {
      rafRef.current = requestAnimationFrame(animate)
      const lerp = 0.12
      current.current.x = THREE.MathUtils.lerp(current.current.x, target.current.x, lerp)
      current.current.y = THREE.MathUtils.lerp(current.current.y, target.current.y, lerp)

      const rx = isActive.current ? current.current.y * -8 : 0
      const ry = isActive.current ? current.current.x * 10 : 0
      const ty = isActive.current ? -3 : 0
      el.style.setProperty('--pg-rx', `${rx}deg`)
      el.style.setProperty('--pg-ry', `${ry}deg`)
      el.style.setProperty('--pg-ty', `${ty}px`)
    }

    animate()

    const handlePointerMove = (e: PointerEvent) => onMove(e.clientX, e.clientY)
    const handlePointerLeave = () => {
      isActive.current = false
      target.current.set(0, 0)
    }

    el.addEventListener('pointermove', handlePointerMove)
    el.addEventListener('pointerleave', handlePointerLeave)
    el.addEventListener('blur', handlePointerLeave)

    return () => {
      cancelAnimationFrame(rafRef.current)
      el.removeEventListener('pointermove', handlePointerMove)
      el.removeEventListener('pointerleave', handlePointerLeave)
      el.removeEventListener('blur', handlePointerLeave)
    }
  }, [])

  return (
    <button
      ref={cardRef}
      type="button"
      className={`pg-card ${flipped ? 'is-flipped' : ''}`}
      style={{ ['--pg-delay' as never]: `${index * 60}ms` }}
      onClick={onToggle}
      aria-label={item.title}
    >
      <span className="pg-card-inner" aria-hidden="true">
        <span className="pg-face pg-face-front">
          <span className="pg-face-top">
            <span className="pg-company">{item.title}</span>
            <span className="pg-subtitle">{item.summary ?? ''}</span>
          </span>
          {item.stack?.length ? (
            <span className="pg-badges">
              {item.stack.slice(0, 6).map((t) => (
                <span key={t} className="pg-badge">
                  {t}
                </span>
              ))}
            </span>
          ) : null}
          <span className="pg-hint">{i18n.t('projects.galleryViewDetails')}</span>
        </span>

        <span className="pg-face pg-face-back">
          <span className="pg-back-title">{i18n.t('projects.galleryOutcomes')}</span>
          {item.goals?.length ? (
            <span className="pg-back-list">
              {item.goals.slice(0, 4).map((g) => (
                <span key={g} className="pg-back-item">
                  {g}
                </span>
              ))}
            </span>
          ) : (
            <span className="pg-back-empty">{item.summary ?? ''}</span>
          )}

          {item.image ? (
            <span className="pg-thumb">
              <img className="pg-thumb-img" src={item.image} alt="" loading="lazy" />
            </span>
          ) : null}
        </span>
      </span>
    </button>
  )
}

export default function ProjectsGrid({ lang = 'zh' }: { lang?: 'zh' | 'en' }) {
  const items = useMemo(() => {
    const arr = i18n.t('projects.scrolly.items', { lng: lang, returnObjects: true }) as ExperienceItem[]
    return (arr ?? []).filter(Boolean)
  }, [lang])

  const [flippedIndex, setFlippedIndex] = useState<number | null>(null)

  return (
    <div className="pg-wrap">
      <div className="pg-grid" role="list">
        {items.map((item, idx) => (
          <div key={`${item.title}-${idx}`} role="listitem" className="pg-item">
            <ProjectCard
              item={item}
              index={idx}
              flipped={flippedIndex === idx}
              onToggle={() => setFlippedIndex((prev) => (prev === idx ? null : idx))}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

