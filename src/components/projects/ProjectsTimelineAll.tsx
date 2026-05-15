import { useMemo } from 'react'
import i18n from '../../i18n'
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

export default function ProjectsTimelineAll({ lang = 'zh' }: { lang?: 'zh' | 'en' }) {
  const items = useMemo(() => {
    const arr = i18n.t('projects.scrolly.items', { lng: lang, returnObjects: true }) as TimelineItem[]
    return (arr ?? []).filter(Boolean)
  }, [lang])

  const colors = ['#6366f1', '#f97316', '#6366f1', '#fbbf24', '#a855f7']

  return (
    <div className="pta-wrap">
      <div className="pta-container">
        <div className="pta-timeline-line-wrapper">
          {items.map((_, idx) => {
            if (idx === items.length - 1) return null
            const isLast = idx === items.length - 2
            return (
              <div
                key={idx}
                className="pta-continuous-line"
                style={{
                  background: isLast
                    ? 'linear-gradient(180deg, #e9e6f8 0%, rgba(233, 230, 248, 0) 100%)'
                    : '#e9e6f8'
                }}
              />
            )
          })}
        </div>

        {items.map((item, idx) => {
          const company = safeText(item.company) || safeText(item.title)
          const period = safeText(item.period)
          const dotColor = colors[idx % colors.length]

          return (
            <div key={`${company}-${idx}`} className="pta-row">
              <div className="pta-timeline-cell">
                <div className="pta-timeline-content">
                  <span
                    className="pta-dot"
                    aria-hidden="true"
                    style={{
                      background: dotColor,
                      '--dot-color': dotColor
                    } as React.CSSProperties}
                  />
                </div>
                <div className="pta-node-info">
                  {period ? <div className="pta-period">{period}</div> : null}
                  <div className="pta-company">{company}</div>
                  {item.role ? <div className="pta-role">{item.role}</div> : null}
                </div>
              </div>

              <article className="pta-card">
                <div className="pta-card-left">
                  <div className="pta-card-header">
                    <div className="pta-card-icon">
                      <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
                        <rect width="56" height="56" rx="12" fill="#6366f1" fillOpacity="0.1"/>
                        <path d="M14 21L28 14L42 21M14 21L28 28M14 21V35L28 42M42 21L28 28M42 21V35L28 42M28 28V42" stroke="#6366f1" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className="pta-card-intro">
                      <h3 className="pta-project">{item.project ?? item.title}</h3>
                      {item.summary ? <p className="pta-summary">{item.summary}</p> : null}
                    </div>
                  </div>

                  {item.stack?.length ? (
                    <div className="pta-block">
                      <div className="pta-block-title">{i18n.t('projects.galleryTech', { lng: lang })}</div>
                      <div className="pta-tags">
                        {item.stack.slice(0, 8).map((t) => (
                          <span key={t} className="pta-tag">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {item.goals?.length ? (
                    <div className="pta-block">
                      <div className="pta-block-title">{i18n.t('projects.galleryOutcomes', { lng: lang })}</div>
                      <div className="pta-goals-text">
                        {item.goals.map((g, gIdx) => (
                          <span key={gIdx}>
                            {g}
                            {gIdx < item.goals!.length - 1 ? '，' : '。'}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="pta-card-right" aria-hidden="true">
                  {/* 浮动装饰小球 */}
                  <div className="pta-float-orbs">
                    <div className="pta-orb pta-orb-1" />
                    <div className="pta-orb pta-orb-2" />
                    <div className="pta-orb pta-orb-3" />
                    <div className="pta-orb pta-orb-4" />
                  </div>

                  {/* 3D展示台场景 */}
                  <div className="pta-stage">
                    {/* 玻璃展示台 */}
                    <div className="pta-glass-platform">
                      <div className="pta-platform-top" />
                      <div className="pta-platform-glow" />
                    </div>

                    {/* 项目截图 */}
                    <div className="pta-screenshot">
                      {item.image ? (
                        <img className="pta-screenshot-img" src={item.image} alt="" loading="lazy" />
                      ) : (
                        <div className="pta-screenshot-fallback" />
                      )}
                    </div>
                  </div>
                </div>
              </article>
            </div>
          )
        })}
      </div>
    </div>
  )
}
