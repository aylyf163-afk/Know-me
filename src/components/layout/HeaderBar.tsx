import BubbleMenu, { type BubbleMenuItem } from '../reactbits/BubbleMenu'
import './HeaderBar.css'
import i18n from '../../i18n'

interface HeaderBarProps {
  menuItems: BubbleMenuItem[]
  activeIndex?: number
  onActiveIndexChange?: (index: number) => void
  lang?: 'zh' | 'en'
  onToggleLang?: () => void
}

export default function HeaderBar({ menuItems, activeIndex, onActiveIndexChange, lang = 'zh', onToggleLang }: HeaderBarProps) {
  return (
    <header className="header-bar">
      <span className="brand">
        {i18n.t('header.brand')}
      </span>

      <nav className="nav-links" aria-label={i18n.t('header.navAriaLabel')}>
        <BubbleMenu
          items={menuItems}
          initialActiveIndex={0}
          activeIndex={activeIndex}
          onActiveIndexChange={onActiveIndexChange}
        />
      </nav>

      <div className="nav-right">
        <span>{i18n.t('header.city')}</span>
        <button
          type="button"
          className="lang-switch"
          aria-label={lang === 'zh' ? i18n.t('header.switchToEnglish') : i18n.t('header.switchToChinese')}
          onClick={onToggleLang}
        >
          {lang === 'zh' ? i18n.t('header.switchShortEn') : i18n.t('header.switchShortZh')}
        </button>
      </div>
    </header>
  )
}
