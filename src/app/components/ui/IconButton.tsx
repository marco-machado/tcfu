import type { ButtonHTMLAttributes } from 'react'
import { cn } from './cn'
import { Icon, type IconName } from './Icon'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: IconName
  label: string
}

export function IconButton({ icon, label, className, type = 'button', ...rest }: Props) {
  return (
    <button type={type} className={cn('icon-btn', className)} aria-label={label} {...rest}>
      <Icon name={icon} />
    </button>
  )
}
