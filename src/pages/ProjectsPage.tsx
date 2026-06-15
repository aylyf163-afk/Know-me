import { forwardRef } from 'react'
import i18n from '../i18n'
import ProjectsTimelineAll from '../components/projects/ProjectsTimelineAll'
import GalaxyBackground from '../components/reactbits/GalaxyBackground'
import './ProjectsPage.css'

export interface ProjectsPageProps {
  lang?: 'zh' | 'en'
}

const ProjectsPage = forwardRef<HTMLElement, ProjectsPageProps>(function ProjectsPage({ lang = 'zh' }, ref) {
  return (
    <section className="projects-section projects-section--grid" id="projects" ref={ref}>
      <div className="projects-galaxy-bg" aria-hidden>
        <GalaxyBackground
          density={2.4}
          speed={0.8}
          starSpeed={0.5}
          saturation={0}
          hueShift={0}
          glowIntensity={0.25}
          twinkleIntensity={0.5}
          rotationSpeed={0.02}
          mouseRepulsion={true}
          repulsionStrength={1.2}
          transparent={false}
        />
      </div>
      <div className="projects-header projects-header--grid">
        <h2>{i18n.t('projects.title')}</h2>
        <span className="projects-line" />
        <p className="projects-grid-subtitle">{i18n.t('projects.gallerySubtitle')}</p>
      </div>
      <ProjectsTimelineAll lang={lang} />
    </section>
  )
})

export default ProjectsPage
