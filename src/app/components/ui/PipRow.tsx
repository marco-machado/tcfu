import type { HTMLAttributes } from 'react'
import { cn } from './cn'
import { Icon, type IconName } from './Icon'

export type PipShape = 'diamond' | 'chevron' | 'segment' | 'dot'
export type PipTone = 'signal' | 'salvage' | 'threat' | 'repair'

type Props = HTMLAttributes<HTMLSpanElement> & {
  count: number
  filled: number
  shape?: PipShape
  icon?: IconName
  tone?: PipTone
}

export function PipRow({
  count,
  filled,
  shape = 'diamond',
  icon,
  tone = 'signal',
  className,
  ...rest
}: Props) {
  return (
    <span
      className={cn('pip-row', !icon && `pip-row--${shape}`, `pip-row--${tone}`, className)}
      {...rest}
    >
      {Array.from({ length: count }, (_, i) => {
        const on = i < filled
        if (icon) {
          return <Icon key={i} name={icon} className={cn('pip', on && 'is-on')} />
        }
        return <span key={i} className={cn('pip', on && 'is-on')} />
      })}
    </span>
  )
}
