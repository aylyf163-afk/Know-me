import { useRef, useCallback, forwardRef, type CSSProperties, type ReactNode } from 'react'
import './SpotlightCard.css'

export interface SpotlightCardProps {
  children: ReactNode
  className?: string
  spotlightColor?: string
  /** 由父级控制聚光位置时关闭内部 pointer 追踪 */
  disablePointerTracking?: boolean
  /** 由父级控制 hover 显示 */
  active?: boolean
}

const SpotlightCard = forwardRef<HTMLDivElement, SpotlightCardProps>(function SpotlightCard(
  {
    children,
    className = '',
    spotlightColor = 'rgba(255, 255, 255, 0.25)',
    disablePointerTracking = false,
    active = false,
  },
  ref,
) {
  const innerRef = useRef<HTMLDivElement>(null)

  const setRefs = useCallback(
    (node: HTMLDivElement | null) => {
      innerRef.current = node
      if (typeof ref === 'function') ref(node)
      else if (ref) ref.current = node
    },
    [ref],
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (disablePointerTracking) return
      const el = innerRef.current
      if (!el) return

      const rect = el.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      el.style.setProperty('--mouse-x', `${x}px`)
      el.style.setProperty('--mouse-y', `${y}px`)
      el.style.setProperty('--spotlight-color', spotlightColor)
    },
    [disablePointerTracking, spotlightColor],
  )

  return (
    <div
      ref={setRefs}
      onMouseMove={disablePointerTracking ? undefined : handleMouseMove}
      className={[
        'card-spotlight',
        active ? 'card-spotlight--active' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ '--spotlight-color': spotlightColor } as CSSProperties}
    >
      {children}
    </div>
  )
})

export default SpotlightCard
