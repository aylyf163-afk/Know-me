import { useMemo, useState } from 'react'
import { motion } from 'motion/react'
import './BubbleMenu.css'

export interface BubbleMenuItem {
  label: string
  href: string
}

interface BubbleMenuProps {
  items: BubbleMenuItem[]
  initialActiveIndex?: number
  className?: string
  activeIndex?: number
  onActiveIndexChange?: (index: number) => void
}

export default function BubbleMenu({
  items,
  initialActiveIndex = 0,
  className = '',
  activeIndex: controlledActiveIndex,
  onActiveIndexChange,
}: BubbleMenuProps) {
  const safeInitialIndex = useMemo(() => {
    if (items.length === 0) return -1
    if (initialActiveIndex < 0) return 0
    if (initialActiveIndex >= items.length) return items.length - 1
    return initialActiveIndex
  }, [initialActiveIndex, items.length])

  const [uncontrolledActiveIndex, setUncontrolledActiveIndex] = useState(safeInitialIndex)
  const isControlled = controlledActiveIndex != null && controlledActiveIndex >= 0
  const activeIndex = isControlled ? controlledActiveIndex : uncontrolledActiveIndex

  const setActiveIndex = (index: number) => {
    if (!isControlled) {
      setUncontrolledActiveIndex(index)
    }
    onActiveIndexChange?.(index)
  }

  if (items.length === 0) return null

  return (
    <ul className={`bubble-menu ${className}`} role="list">
      {items.map((item, index) => {
        const isActive = index === activeIndex

        return (
          <li key={item.label} className="bubble-menu-item">
            <a
              className={`bubble-menu-link ${isActive ? 'is-active' : ''}`}
              href={item.href}
              onMouseEnter={() => setActiveIndex(index)}
              onFocus={() => setActiveIndex(index)}
            >
              {isActive && <motion.span className="bubble-menu-pill" layoutId="bubble-pill" transition={{ duration: 0.25 }} />}
              <span className="bubble-menu-text">{item.label}</span>
            </a>
          </li>
        )
      })}
    </ul>
  )
}
