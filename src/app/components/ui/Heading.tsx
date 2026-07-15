import { createElement, type ElementType, type HTMLAttributes, type ReactNode } from 'react'
import { cn } from './cn'

export type HeadingSize = 'sm' | 'md' | 'lg' | 'xl'

const DEFAULT_ELEMENT: Record<HeadingSize, ElementType> = {
  sm: 'h3',
  md: 'h2',
  lg: 'h2',
  xl: 'h1',
}

type Props = HTMLAttributes<HTMLHeadingElement> & {
  size?: HeadingSize
  as?: ElementType
  children?: ReactNode
}

export function Heading({ size = 'md', as, className, children, ...rest }: Props) {
  return createElement(
    as ?? DEFAULT_ELEMENT[size],
    { className: cn('heading', `heading--${size}`, className), ...rest },
    children,
  )
}
