import { createElement, type ElementType, type HTMLAttributes, type ReactNode } from 'react'
import { cn } from './cn'

export type LabelVariant = 'default' | 'kicker'

type Props = HTMLAttributes<HTMLElement> & {
  variant?: LabelVariant
  as?: ElementType
  children?: ReactNode
}

export function Label({ variant = 'default', as, className, children, ...rest }: Props) {
  return createElement(
    as ?? 'span',
    { className: cn('label', variant !== 'default' && `label--${variant}`, className), ...rest },
    children,
  )
}
