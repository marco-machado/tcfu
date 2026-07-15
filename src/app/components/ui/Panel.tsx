import { createElement, type ElementType, type HTMLAttributes, type ReactNode } from 'react'
import { cn } from './cn'

export type PanelSize = 'sm' | 'md' | 'lg'
export type PanelTone = 'default' | 'danger'

type Props = HTMLAttributes<HTMLElement> & {
  size?: PanelSize
  tone?: PanelTone
  as?: ElementType
  children?: ReactNode
  // Forwarded when rendered as an interactive element (e.g. a selectable card).
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
}

export function Panel({ as, size = 'md', tone = 'default', className, children, ...rest }: Props) {
  return createElement(
    as ?? 'div',
    {
      className: cn('panel', `panel--${size}`, tone !== 'default' && `panel--${tone}`, className),
      ...rest,
    },
    children,
  )
}
