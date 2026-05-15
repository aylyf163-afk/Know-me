import { useEffect, useRef } from 'react'
import AboutPage from '../../pages/AboutPage.tsx'
import SkillsPage from '../../pages/SkillsPage.tsx'
import ProjectsPage from '../../pages/ProjectsPage.tsx'
import ContactPage from '../../pages/ContactPage.tsx'
import type { SectionId } from '../../pages/constants.ts'
import './HomeContent.css'

interface HomeContentProps {
  onSectionChange?: (id: SectionId) => void
  lang?: 'zh' | 'en'
}

export default function HomeContent({ onSectionChange, lang = 'zh' }: HomeContentProps) {
  const aboutRef = useRef<HTMLElement | null>(null)
  const skillsRef = useRef<HTMLElement | null>(null)
  const projectsRef = useRef<HTMLElement | null>(null)
  const contactRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!onSectionChange) return

    const getSections = (): { id: SectionId; el: HTMLElement }[] => {
      const pairs: { id: SectionId; el: HTMLElement | null }[] = [
        { id: 'about', el: aboutRef.current },
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

  return (
    <main className="content-area">
      <AboutPage ref={aboutRef} lang={lang} />
      <SkillsPage ref={skillsRef} />
      <ProjectsPage ref={projectsRef} lang={lang} />
      <ContactPage ref={contactRef} />
    </main>
  )
}
