import { forwardRef, type ReactNode } from 'react'
import BorderGlow, { type BorderGlowProps } from './BorderGlow'
import SpotlightCard, { type SpotlightCardProps } from './SpotlightCard'

export type SpotlightBorderCardProps = BorderGlowProps &
  Pick<SpotlightCardProps, 'spotlightColor' | 'spotlightOpacity'> & {
    children: ReactNode
    spotlightClassName?: string
  }

/**
 * 组合 [SpotlightCard](https://reactbits.dev/components/spotlight-card) 内部聚光
 * 与 [BorderGlow](https://reactbits.dev/components/border-glow) 边缘光效。
 */
const SpotlightBorderCard = forwardRef<HTMLDivElement, SpotlightBorderCardProps>(function SpotlightBorderCard(
  {
    children,
    spotlightColor,
    spotlightOpacity,
    spotlightClassName = '',
    ...borderProps
  },
  ref,
) {
  return (
    <BorderGlow ref={ref} {...borderProps}>
      <SpotlightCard
        className={spotlightClassName}
        spotlightColor={spotlightColor}
        spotlightOpacity={spotlightOpacity}
      >
        {children}
      </SpotlightCard>
    </BorderGlow>
  )
})

export default SpotlightBorderCard
