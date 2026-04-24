import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react'
import i18n from '../../i18n'
import DotField from '../reactbits/DotField'
import CountUp from '../reactbits/CountUp'
import LightRaysBackground from '../reactbits/LightRaysBackground'
import ProfileCard from '../reactbits/ProfileCard'
import BlurText from '../reactbits/BlurText'
import SpaceCapsuleScene from '../space-capsule/SpaceCapsuleScene'
import './HomeContent.css'

type SectionId = 'about' | 'skills' | 'projects' | 'contact'

interface HomeContentProps {
  onSectionChange?: (id: SectionId) => void
  lang?: 'zh' | 'en'
}

export default function HomeContent({ onSectionChange, lang = 'zh' }: HomeContentProps) {
  const heroRef = useRef<HTMLElement | null>(null)
  const skillsRef = useRef<HTMLElement | null>(null)
  const projectsRef = useRef<HTMLElement | null>(null)
  const contactRef = useRef<HTMLElement | null>(null)
  const heroCopyRef = useRef<HTMLElement | null>(null)
  const cursorTargetRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 })
  const cursorCurrentRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 })
  const [maskPosition, setMaskPosition] = useState({ x: 0, y: 0 })
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [cursorEnabled, setCursorEnabled] = useState(false)
  const [activeSkillIndex, setActiveSkillIndex] = useState<number | null>(null)
  const cursorRadius = 118

  const tFor = <T,>(key: string, lng: 'zh' | 'en') => i18n.t(key, { lng, returnObjects: true }) as T
  const outerLng: 'zh' | 'en' = lang === 'en' ? 'en' : 'zh'
  const innerLng: 'zh' | 'en' = lang === 'en' ? 'zh' : 'en'

  const outerHero = {
    prefix: tFor<string>('about.heroPrefix', outerLng),
    name: tFor<string>('about.heroName', outerLng),
    subtitle: tFor<string[]>('about.heroSubtitle', outerLng),
  }

  const innerHero = {
    prefix: tFor<string>('about.heroPrefix', innerLng),
    name: tFor<string>('about.heroName', innerLng),
    subtitle: tFor<string[]>('about.heroSubtitle', innerLng),
  }

  const outerSubtitleItems = [outerHero.subtitle[0], '/', outerHero.subtitle[1], '/', outerHero.subtitle[2]]
  const innerSubtitleItems = [innerHero.subtitle[0], '/', innerHero.subtitle[1], '/', innerHero.subtitle[2]]
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
  const tiltTransform = `perspective(950px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`

  useEffect(() => {
    let rafId = 0
    const handleWindowMove = (event: globalThis.MouseEvent) => {
      cursorTargetRef.current = { x: event.clientX, y: event.clientY }
    }
    const handleWindowLeave = () => {
      setCursorEnabled(false)
    }

    window.addEventListener('mousemove', handleWindowMove)
    window.addEventListener('mouseleave', handleWindowLeave)

    const animate = () => {
      cursorCurrentRef.current.x += (cursorTargetRef.current.x - cursorCurrentRef.current.x) * 0.2
      cursorCurrentRef.current.y += (cursorTargetRef.current.y - cursorCurrentRef.current.y) * 0.2
      const current = { x: cursorCurrentRef.current.x, y: cursorCurrentRef.current.y }

      const heroRect = heroRef.current?.getBoundingClientRect()
      if (heroRect) {
        const inAboutArea =
          current.x >= heroRect.left && current.x <= heroRect.right && current.y >= heroRect.top && current.y <= heroRect.bottom
        setCursorEnabled(inAboutArea)

        const ratioX = (current.x - heroRect.left) / heroRect.width
        const ratioY = (current.y - heroRect.top) / heroRect.height
        const offsetX = ratioX - 0.5
        const offsetY = ratioY - 0.5
        const distance = Math.min(1, Math.sqrt(offsetX * offsetX + offsetY * offsetY) / 0.71)
        const intensity = 1 + distance * 0.55
        if (inAboutArea) {
          setTilt({
            x: (0.5 - ratioY) * 24 * intensity,
            y: (ratioX - 0.5) * 28 * intensity,
          })
        } else {
          setTilt({ x: 0, y: 0 })
        }
      }

      const copyRect = heroCopyRef.current?.getBoundingClientRect()
      if (copyRect) {
        setMaskPosition({ x: current.x - copyRect.left, y: current.y - copyRect.top })
      }

      rafId = window.requestAnimationFrame(animate)
    }

    rafId = window.requestAnimationFrame(animate)
    return () => {
      window.cancelAnimationFrame(rafId)
      window.removeEventListener('mousemove', handleWindowMove)
      window.removeEventListener('mouseleave', handleWindowLeave)
    }
  }, [])

  useEffect(() => {
    if (!onSectionChange) return

    const getSections = (): { id: SectionId; el: HTMLElement }[] => {
      const pairs: { id: SectionId; el: HTMLElement | null }[] = [
        { id: 'about', el: heroRef.current },
        { id: 'skills', el: skillsRef.current },
        { id: 'projects', el: projectsRef.current },
        { id: 'contact', el: contactRef.current },
      ]
      return pairs.filter((s): s is { id: SectionId; el: HTMLElement } => Boolean(s.el))
    }

    let current: SectionId | null = null
    let ticking = false

    const evaluate = () => {
      ticking = false
      const sections = getSections()
      if (sections.length === 0) return

      const viewportMid = window.innerHeight * 0.35
      let bestId: SectionId | null = null
      let bestDist = Number.POSITIVE_INFINITY

      for (const { id, el } of sections) {
        const rect = el.getBoundingClientRect()
        if (rect.bottom <= 0 || rect.top >= window.innerHeight) continue
        const mid = rect.top + rect.height / 2
        const dist = Math.abs(mid - viewportMid)
        if (dist < bestDist) {
          bestDist = dist
          bestId = id
        }
      }

      if (bestId && bestId !== current) {
        current = bestId
        onSectionChange(bestId)
      }
    }

    const onScrollOrResize = () => {
      if (ticking) return
      ticking = true
      window.requestAnimationFrame(evaluate)
    }

    window.addEventListener('scroll', onScrollOrResize, { passive: true })
    window.addEventListener('resize', onScrollOrResize)
    evaluate()

    return () => {
      window.removeEventListener('scroll', onScrollOrResize)
      window.removeEventListener('resize', onScrollOrResize)
    }
  }, [onSectionChange])

  const handleContentMove = (event: ReactMouseEvent<HTMLElement>) => {
    cursorTargetRef.current = { x: event.clientX, y: event.clientY }
  }

  const handleContentLeave = () => {
    setTilt({ x: 0, y: 0 })
  }

  return (
    <main className="content-area" onMouseMove={handleContentMove} onMouseLeave={handleContentLeave}>
      <section className="hero about-section" id="about" ref={heroRef}>
        <DotField />
        <section className="hero-copy" ref={heroCopyRef}>
          <div className="hero-text-layer hero-text-en" style={{ transform: tiltTransform }}>
            <h1 className="hero-title">
              <span className="hero-title-main">{outerHero.prefix}</span>
              <span className="hero-title-name">{outerHero.name}</span>
            </h1>
            <p className="hero-subtitle">
              {outerSubtitleItems.map((text, index) => (
                <span key={index} className="hero-subtitle-item">
                  {text}
                </span>
              ))}
            </p>
          </div>

          <div
            className={`cursor-orb ${cursorEnabled ? 'is-visible' : ''}`}
            aria-hidden="true"
            style={{ transform: `translate3d(${maskPosition.x - cursorRadius}px, ${maskPosition.y - cursorRadius}px, 0)` }}
          />

          <div
            className="hero-text-layer hero-text-zh"
            style={{
              transform: tiltTransform,
              clipPath: `circle(${cursorRadius}px at ${maskPosition.x}px ${maskPosition.y}px)`,
              WebkitClipPath: `circle(${cursorRadius}px at ${maskPosition.x}px ${maskPosition.y}px)`,
            }}
          >
            <h1 className="hero-title">
              <span className="hero-title-main">{innerHero.prefix}</span>
              <span className="hero-title-name">{innerHero.name}</span>
            </h1>
            <p className="hero-subtitle">
              {innerSubtitleItems.map((text, index) => (
                <span key={index} className="hero-subtitle-item">
                  {text}
                </span>
              ))}
            </p>
          </div>
        </section>
        <p className="bottom-hint">{i18n.t('about.hint')}</p>
      </section>

      <section className="skills-section" id="skills" ref={skillsRef}>
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
                        <span>
                          {i18n.t(item.labelKey)}
                        </span>
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

      <section className="projects-section projects-section--showcase" id="projects" ref={projectsRef}>
        <div className="projects-showcase">
          <div className="projects-showcase__viewport">
            <SpaceCapsuleScene />
          </div>
        </div>
      </section>

      <section className="contact-section" id="contact" ref={contactRef}>
        <LightRaysBackground
          className="contact-light-rays"
          raysOrigin="top-center"
          raysColor="#9ac4ff"
          raysSpeed={0.85}
          lightSpread={0.95}
          rayLength={2.1}
          fadeDistance={1.15}
          saturation={1}
          followMouse={false}
          mouseInfluence={0}
          noiseAmount={0.04}
          distortion={0.06}
        />
        <div className="contact-header">
          <div className="contact-header-left">
            <h2>{i18n.t('contact.title')}</h2>
            <span className="contact-line" />
          </div>
          <p className="contact-intro">{i18n.t('contact.intro')}</p>
        </div>
        <div className="contact-card-wrap">
          <ProfileCard
            className="contact-profile-card"
            name={i18n.t('contact.profileName')}
            title={i18n.t('contact.profileTitle')}
            handle="pinkman"
            status={i18n.t('contact.status')}
            contactText={i18n.t('contact.contactButton')}
            showUserInfo={false}
            avatarUrl="/assets/demo/person.webp"
            miniAvatarUrl="/assets/demo/person.webp"
            iconUrl="/assets/demo/iconpattern.png"
            grainUrl="/assets/demo/grain.webp"
            enableMobileTilt
          />
          <div className="contact-card-info">
            <p>{i18n.t('contact.cardTitle')}</p>
            <BlurText text={i18n.t('contact.email')} className="contact-card-info-line" animateBy="letters" />
            <BlurText text={i18n.t('contact.phone')} className="contact-card-info-line" animateBy="letters" />
          </div>
        </div>
      </section>
    </main>
  )
}
