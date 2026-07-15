import type { ReactNode } from 'react'
import { cn } from './cn'
import { Heading } from './Heading'
import { Label } from './Label'

type Props = {
  title: ReactNode
  kicker?: ReactNode
  children?: ReactNode
  className?: string
}

export function ScreenHeader({ title, kicker, children, className }: Props) {
  return (
    <header className={cn('screen-header', className)}>
      <Heading size="lg">{title}</Heading>
      {kicker ? <Label variant="kicker">{kicker}</Label> : null}
      {children}
    </header>
  )
}
