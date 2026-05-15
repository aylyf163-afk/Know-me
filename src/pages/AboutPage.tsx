import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type MutableRefObject,
} from 'react'
import i18n from '../i18n'
import DotField from '../components/reactbits/DotField'
import './AboutPage.css'

export interface AboutPageProps {
  lang?: 'zh' | 'en'
}

const AboutPage = forwardRef<HTMLElement, AboutPageProps>(function AboutPage({ lang = 'zh' }, ref) {
  const sectionRef = useRef<HTMLElement | null>(null)
  const heroCopyRef = useRef<HTMLElement | null>(null)
  const cursorTargetRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 })
  const cursorCurrentRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 })
  const [maskPosition, setMaskPosition] = useState({ x: 0, y: 0 })
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [cursorEnabled, setCursorEnabled] = useState(false)
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

      const heroRect = sectionRef.current?.getBoundingClientRect()
      if (heroRect) {
        const inAboutArea =
          current.x >= heroRect.left &&
          current.x <= heroRect.right &&
          current.y >= heroRect.top &&
          current.y <= heroRect.bottom
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

  const setSectionRef = useCallback(
    (node: HTMLElement | null) => {
      sectionRef.current = node
      if (typeof ref === 'function') {
        ref(node)
      } else if (ref) {
        ;(ref as MutableRefObject<HTMLElement | null>).current = node
      }
    },
    [ref],
  )

  const handleContentMove = (event: ReactMouseEvent<HTMLElement>) => {
    cursorTargetRef.current = { x: event.clientX, y: event.clientY }
  }

  const handleContentLeave = () => {
    setTilt({ x: 0, y: 0 })
  }

  return (
    <section
      ref={setSectionRef}
      className="hero about-section"
      id="about"
      onMouseMove={handleContentMove}
      onMouseLeave={handleContentLeave}
    >
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
  )
})

export default AboutPage
