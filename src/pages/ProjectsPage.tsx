import { forwardRef } from 'react'
import i18n from '../i18n'
import ProjectsTimelineAll from '../components/projects/ProjectsTimelineAll'
import ShapeGrid from '../components/reactbits/ShapeGrid.tsx'
import './ProjectsPage.css'

export interface ProjectsPageProps {
  lang?: 'zh' | 'en'
}

const ProjectsPage = forwardRef<HTMLElement, ProjectsPageProps>(function ProjectsPage({ lang = 'zh' }, ref) {
  return (
    <section className="projects-section projects-section--grid" id="projects" ref={ref}>
      <div className="projects-shape-grid-bg" aria-hidden>
        <ShapeGrid
          direction="diagonal"
          speed={0.55}
          borderColor="#f6f6f9"
          squareSize={35}
          hoverFillColor="rgba(99, 102, 241, 0.52)"
          shape="square"
          hoverTrailAmount={4}
          interactive={true}
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
