import { forwardRef, useState } from 'react'
import i18n from '../i18n'
import CountUp from '../components/reactbits/CountUp'
import './SkillsPage.css'

export interface SkillsPageProps {}

const SkillsPage = forwardRef<HTMLElement, SkillsPageProps>(function SkillsPage(_props, ref) {
  const [activeSkillIndex, setActiveSkillIndex] = useState<number | null>(null)

  const skillGroups = [
    {
      badge: 'AI',
      title: i18n.t('skills.groups.ai.title'),
      desc: i18n.t('skills.groups.ai.desc'),
      stats: [
        { end: 3, suffix: '+', labelKey: 'skills.stats.coreSkills' },
        { end: 3, suffix: '', labelKey: 'skills.stats.focusAreas' },
        { end: 80, suffix: '%', labelKey: 'skills.stats.fulfillment' },
      ],
      details: i18n.t('skills.groups.ai.details', { returnObjects: true }) as { name: string; level: string }[],
    },
    {
      badge: i18n.t('skills.badges.base'),
      title: i18n.t('skills.groups.base.title'),
      desc: i18n.t('skills.groups.base.desc'),
      stats: [
        { end: 15, suffix: '+', labelKey: 'skills.stats.coreSkills' },
        { end: 12, suffix: '', labelKey: 'skills.stats.focusAreas' },
        { end: 92, suffix: '%', labelKey: 'skills.stats.fulfillment' },
      ],
      details: i18n.t('skills.groups.base.details', { returnObjects: true }) as { name: string; level: string }[],
    },
    {
      badge: 'Vue',
      title: i18n.t('skills.groups.vue.title'),
      desc: i18n.t('skills.groups.vue.desc'),
      stats: [
        { end: 4, suffix: '+', labelKey: 'skills.stats.projects' },
        { end: 3, suffix: '', labelKey: 'skills.stats.stacks' },
        { end: 100, suffix: '%', decimals: 1, labelKey: 'skills.stats.reliability' },
      ],
      details: i18n.t('skills.groups.vue.details', { returnObjects: true }) as { name: string; level: string }[],
    },
    {
      badge: 'React',
      title: i18n.t('skills.groups.react.title'),
      desc: i18n.t('skills.groups.react.desc'),
      stats: [
        { end: 2, suffix: '+', labelKey: 'skills.stats.projects' },
        { end: 1, suffix: '', labelKey: 'skills.stats.stacks' },
        { end: 100, suffix: '%', decimals: 1, labelKey: 'skills.stats.reliability' },
      ],
      details: i18n.t('skills.groups.react.details', { returnObjects: true }) as { name: string; level: string }[],
    },
  ]

  return (
    <section className="skills-section" id="skills" ref={ref}>
      <div className="skills-shape-grid" aria-hidden="true" />
      <div className="skills-header">
        <h2>{i18n.t('skills.title')}</h2>
        <span className="skills-line" />
      </div>

      <div className="skills-list">
        {skillGroups.map((group, index) => (
          <article
            key={group.title}
            className={`skill-card ${activeSkillIndex === index ? 'is-flipped' : ''}`}
            onClick={() => setActiveSkillIndex((prev) => (prev === index ? null : index))}
          >
            <div className="skill-card-inner">
              <div className="skill-face skill-face-front">
                <div className="skill-head">
                  <span className="skill-badge">{group.badge}</span>
                  <div className="skill-meta">
                    <h3>{group.title}</h3>
                    <p>{group.desc}</p>
                  </div>
                </div>

                <div className="skill-stats">
                  {group.stats.map((item) => (
                    <div key={item.labelKey} className="skill-stat-item">
                      <strong>
                        <CountUp end={item.end} suffix={item.suffix} decimals={item.decimals ?? 0} durationMs={1200} />
                      </strong>
                      <span>{i18n.t(item.labelKey)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="skill-face skill-face-back">
                <div className="skill-head skill-head-back">
                  <span className="skill-badge">{group.badge}</span>
                  <div className="skill-meta">
                    <h3>{group.title}</h3>
                  </div>
                </div>

                <div className="skill-detail-list">
                  {group.details.map((item) => (
                    <div key={item.name} className="skill-detail-row">
                      <span className="skill-detail-name">{item.name}</span>
                      <span className="skill-detail-level">{item.level}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
})

export default SkillsPage
