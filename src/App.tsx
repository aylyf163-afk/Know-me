import './App.css'
import HeaderBar from './components/layout/HeaderBar'
import HomeContent from './components/layout/HomeContent'
import { useMemo, useState } from 'react'
import i18n from './i18n'
import { SECTION_ORDER, type SectionId } from './pages/constants.ts'

function App() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [lang, setLang] = useState<'zh' | 'en'>('zh')
  const menuItems = useMemo(
    () => [
      { label: i18n.t('nav.about'), href: '#about' },
      { label: i18n.t('nav.skills'), href: '#skills' },
      { label: i18n.t('nav.projects'), href: '#projects' },
      { label: i18n.t('nav.contact'), href: '#contact' },
    ],
    [lang],
  )

  return (
    <div className="app-shell">
      <HeaderBar
        menuItems={menuItems}
        activeIndex={activeIndex}
        onActiveIndexChange={setActiveIndex}
        lang={lang}
        onToggleLang={() =>
          setLang((prev) => {
            const next = prev === 'zh' ? 'en' : 'zh'
            i18n.changeLanguage(next)
            return next
          })
        }
      />
      <HomeContent
        lang={lang}
        onSectionChange={(id) => {
          const idx = SECTION_ORDER.indexOf(id as SectionId)
          if (idx !== -1) setActiveIndex(idx)
        }}
      />
    </div>
  )
}

export default App
