import { useMemo, useEffect, useRef, useState, useCallback } from 'react'
import i18n from '../../i18n'
import SpotlightCard from '../reactbits/SpotlightCard'
import './ProjectsTimelineAll.css'

type TimelineItem = {
  company?: string
  period?: string
  role?: string
  project?: string
  title: string
  summary?: string
  image?: string
  stack?: string[]
  goals?: string[]
}

function safeText(s?: string) {
  return (s ?? '').trim()
}

function formatIndex(idx: number) {
  return String(idx + 1).padStart(3, '0')
}

function ProjectCard({ item, idx, isLeft }: { item: TimelineItem; idx: number; isLeft: boolean }) {
  const title = safeText(item.project) || safeText(item.title)
  const summary = safeText(item.summary)
  const indexLabel = formatIndex(idx)
  const tiltRef = useRef<HTMLDivElement>(null)
  const spotlightRef = useRef<HTMLDivElement>(null)
  const [spotlightActive, setSpotlightActive] = useState(false)

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const tilt = tiltRef.current
    const spotlight = spotlightRef.current
    if (!tilt || !spotlight) return

    const rect = tilt.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const nx = x / rect.width - 0.5
    const ny = y / rect.height - 0.5
    const maxTilt = 18
    const px = (x / rect.width) * 100
    const py = (y / rect.height) * 100

    tilt.style.setProperty('--pta-rx', `${(ny * maxTilt).toFixed(2)}deg`)
    tilt.style.setProperty('--pta-ry', `${(nx * maxTilt).toFixed(2)}deg`)
    spotlight.style.setProperty('--mouse-x', `${px}%`)
    spotlight.style.setProperty('--mouse-y', `${py}%`)
    setSpotlightActive(true)
  }, [])

  const handlePointerLeave = useCallback(() => {
    const tilt = tiltRef.current
    if (!tilt) return

    tilt.style.setProperty('--pta-rx', '0deg')
    tilt.style.setProperty('--pta-ry', '0deg')
    setSpotlightActive(false)
  }, [])

  return (
    <div
      ref={tiltRef}
      className="pta-card-tilt"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <div className={`pta-card-frame ${isLeft ? 'pta-card-frame--left' : 'pta-card-frame--right'}`}>
      <SpotlightCard
        ref={spotlightRef}
        active={spotlightActive}
        disablePointerTracking
        className={`pta-spotlight-card ${isLeft ? 'pta-spotlight-card--left' : 'pta-spotlight-card--right'}`}
        spotlightColor="rgba(255, 255, 255, 0.25)"
      >
        <div className={`pta-card-index ${isLeft ? '' : 'pta-card-index--right'}`}>
        {isLeft ? (
          <>
            <span className="pta-card-index-mark" aria-hidden />
            <span className="pta-card-index-num">{indexLabel}</span>
          </>
        ) : (
          <>
            <span className="pta-card-index-num">{indexLabel}</span>
            <span className="pta-card-index-mark" aria-hidden />
          </>
        )}
      </div>

      <div className="pta-card-mid">
        {item.image && (
          <div className="pta-card-img-wrap">
            <img className="pta-card-img" src={item.image} alt="" loading="lazy" />
          </div>
        )}
        <h3 className="pta-card-title">{title}</h3>
      </div>

      {summary && <p className="pta-card-desc">{summary}</p>}
      </SpotlightCard>
      </div>
    </div>
  )
}

const ICONS = [
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l2.4 7.4H22l-6 4.6 2.3 7L12 16.4 5.7 21l2.3-7-6-4.6h7.6z"/></svg>,
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>,
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>,
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>,
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
]

export default function ProjectsTimelineAll({ lang = 'zh' }: { lang?: 'zh' | 'en' }) {
  const items = useMemo(() => {
    const arr = i18n.t('projects.scrolly.items', { lng: lang, returnObjects: true }) as TimelineItem[]
    return (arr ?? []).filter(Boolean)
  }, [lang])

  const containerRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [lineTop, setLineTop] = useState(0)
  const [solidHeight, setSolidHeight] = useState(0)

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return
    const icons = containerRef.current.querySelectorAll<HTMLElement>('.pta-icon-row')
    if (icons.length === 0) return

    const containerRect = containerRef.current.getBoundingClientRect()
    const trigger = window.innerHeight * 0.6

    // 线从第一个 icon 中心开始
    const firstIcon = icons[0]
    const firstIconCenter = firstIcon.getBoundingClientRect().top + firstIcon.getBoundingClientRect().height / 2 - containerRect.top
    setLineTop(firstIconCenter)

    // 实线终点 = 容器高度（不限制在最后一个 icon）
    const totalLength = containerRect.height - firstIconCenter

    // 滚动触发线在容器内的相对位置
    const scrollPos = trigger - containerRect.top

    // 实线高度 = 滚动位置相对于第一个icon中心的距离
    const rawHeight = scrollPos - firstIconCenter
    const clampedHeight = Math.max(0, Math.min(rawHeight, totalLength))
    setSolidHeight(clampedHeight)

    // 激活的 icon：实线已经到达其中心位置的
    let lastActive = -1
    icons.forEach((icon, idx) => {
      const iconCenter = icon.getBoundingClientRect().top + icon.getBoundingClientRect().height / 2 - containerRect.top
      if (iconCenter - firstIconCenter <= clampedHeight) {
        lastActive = idx
      }
    })
    setActiveIndex(lastActive)
  }, [])

  useEffect(() => {
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  return (
    <div className="pta-wrap" ref={containerRef}>
      {/* 虚线：从第一个 icon 中心到底部 */}
      <div
        className="pta-timeline-track pta-timeline-dashed"
        style={{ top: `${lineTop}px` }}
      />
      {/* 实线覆盖：从第一个 icon 中心向下跟随滚动 */}
      <div
        className="pta-timeline-track pta-timeline-solid"
        style={{ top: `${lineTop}px`, height: `${solidHeight}px` }}
      />

      {items.map((item, idx) => {
        const isLeft = idx % 2 === 0
        const isActive = idx <= activeIndex
        const company = safeText(item.company) || safeText(item.title)
        const period = safeText(item.period)
        const cardKey = safeText(item.project) || safeText(item.title) || String(idx)
        return (
          <div
            key={`${cardKey}-${idx}`}
            className={`pta-section ${isActive ? 'pta-active' : ''}`}
          >
            {/* Icon 居中在时间线上 */}
            <div className={`pta-icon-row ${isActive ? 'pta-icon-active' : ''}`}>
              <div className="pta-icon-wrapper">
                <div className="pta-icon-ring" />
                <div className="pta-icon-circle">
                  {ICONS[idx % ICONS.length]}
                </div>
              </div>
            </div>

            {/* 内容区：卡片和公司信息左右交替 */}
            <div className={`pta-row ${isLeft ? 'pta-row--left' : 'pta-row--right'}`}>
              <div className="pta-col-left">
                {isLeft ? (
                  <ProjectCard item={item} idx={idx} isLeft />
                ) : (
                  <div className="pta-info pta-info--left">
                    {period && <div className="pta-period">{period}</div>}
                    <div className="pta-company">{company}</div>
                    {item.role && <div className="pta-role">{item.role}</div>}
                  </div>
                )}
              </div>
              <div className="pta-col-right">
                {isLeft ? (
                  <div className="pta-info pta-info--right">
                    {period && <div className="pta-period">{period}</div>}
                    <div className="pta-company">{company}</div>
                    {item.role && <div className="pta-role">{item.role}</div>}
                  </div>
                ) : (
                  <ProjectCard item={item} idx={idx} isLeft={false} />
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
