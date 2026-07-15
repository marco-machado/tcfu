import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from './cn'

export type OverlayTone = 'default' | 'pause' | 'death'

type Props = HTMLAttributes<HTMLDivElement> & {
  tone?: OverlayTone
  children?: ReactNode
}

export function Overlay({ tone = 'default', className, children, ...rest }: Props) {
  return (
    <div className={cn('overlay', tone !== 'default' && `overlay--${tone}`, className)} {...rest}>
      {children}
    </div>
  )
}
