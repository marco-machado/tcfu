import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from './cn'
import { Icon, type IconName } from './Icon'

export type ChipTone = 'default' | 'scrap' | 'expiring'

type Props = HTMLAttributes<HTMLSpanElement> & {
  tone?: ChipTone
  icon?: IconName
  children?: ReactNode
}

export function Chip({ tone = 'default', icon, className, children, ...rest }: Props) {
  return (
    <span className={cn('chip', tone !== 'default' && `chip--${tone}`, className)} {...rest}>
      {icon ? <Icon name={icon} /> : null}
      {children}
    </span>
  )
}
