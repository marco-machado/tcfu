import type { ButtonHTMLAttributes, ReactNode, Ref } from 'react'
import { cn } from './cn'
import { Icon, type IconName } from './Icon'

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'danger' | 'ghost'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  icon?: IconName
  children?: ReactNode
  ref?: Ref<HTMLButtonElement>
}

export function Button({
  variant = 'secondary',
  icon,
  className,
  children,
  type = 'button',
  ref,
  ...rest
}: Props) {
  return (
    <button ref={ref} type={type} className={cn('btn', `btn--${variant}`, className)} {...rest}>
      {icon ? <Icon name={icon} /> : null}
      {children}
    </button>
  )
}
