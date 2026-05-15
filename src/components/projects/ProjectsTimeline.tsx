import { useMemo, useState } from 'react'
import i18n from '../../i18n'
import './ProjectsTimeline.css'

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

export default function ProjectsTimeline({ lang = 'zh' }: { lang?: 'zh' | 'en' }) {
  const items = useMemo(() => {
    const arr = i18n.t('projects.scrolly.items', { lng: lang, returnObjects: true }) as TimelineItem[]
    return (arr ?? []).filter(Boolean)
  }, [lang])

  const [active, setActive] = useState(0)
  const activeItem = items[Math.min(Math.max(active, 0), Math.max(0, items.length - 1))]

  return (
    <div className="pt-wrap">
      <div className="pt-decor" aria-hidden="true">
        <span className="pt-orb pt-orb-a" />
        <span className="pt-orb pt-orb-b" />
        <span className="pt-orb pt-orb-c" />
      </div>

      <div className="pt-layout">
        <aside className="pt-rail" aria-label={i18n.t('projects.title', { lng: lang })}>
          <div className="pt-line" aria-hidden="true" />
          <div className="pt-nodes">
            {items.map((it, idx) => {
              const company = safeText(it.company) || safeText(it.title)
              const period = safeText(it.period)
              return (
                <button
                  key={`${company}-${idx}`}
                  type="button"
                  className={`pt-node ${idx === active ? 'is-active' : ''}`}
                  onClick={() => setActive(idx)}
                >
                  <span className="pt-dot" aria-hidden="true" />
                  <span className="pt-node-meta">
                    {period ? <span className="pt-period">{period}</span> : null}
                    <span className="pt-company">{company}</span>
                    {it.role ? <span className="pt-role">{it.role}</span> : null}
                  </span>
                </button>
              )
            })}
          </div>
        </aside>

        <section className="pt-card" aria-label={activeItem?.project ?? activeItem?.title ?? ''}>
          <div className="pt-card-left">
            <div className="pt-card-title-row">
              <h3 className="pt-project">{activeItem?.project ?? activeItem?.title ?? ''}</h3>
              <span className="pt-open" aria-hidden="true">
                ↗
              </span>
            </div>

            {activeItem?.summary ? <p className="pt-summary">{activeItem.summary}</p> : null}

            {activeItem?.stack?.length ? (
              <div className="pt-block">
                <div className="pt-block-title">{i18n.t('projects.galleryTech', { lng: lang })}</div>
                <div className="pt-tags">
                  {activeItem.stack.slice(0, 8).map((t) => (
                    <span key={t} className="pt-tag">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            {activeItem?.goals?.length ? (
              <div className="pt-block">
                <div className="pt-block-title">{i18n.t('projects.galleryOutcomes', { lng: lang })}</div>
                <ul className="pt-list">
                  {activeItem.goals.slice(0, 4).map((g) => (
                    <li key={g}>{g}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>

          <div className="pt-card-right" aria-hidden="true">
            <div className="pt-shot">
              {activeItem?.image ? <img className="pt-shot-img" src={activeItem.image} alt="" loading="lazy" /> : <div className="pt-shot-fallback" />}
            </div>
            <div className="pt-glow" />
          </div>
        </section>
      </div>
    </div>
  )
}

