import type { HTMLAttributes } from 'react'
import { cn } from './cn'

export type MeterTone = 'signal' | 'salvage' | 'threat' | 'repair'

type Props = Omit<HTMLAttributes<HTMLDivElement>, 'role'> & {
  value: number
  tone?: MeterTone
  segments?: boolean
}

export function Meter({ value, tone = 'signal', segments = false, className, ...rest }: Props) {
  const clamped = Math.max(0, Math.min(1, value))
  const pct = clamped * 100
  return (
    <div
      role="meter"
      className={cn('meter', `meter--${tone}`, segments && 'meter--segmented', className)}
      aria-valuemin={0}
      aria-valuemax={1}
      aria-valuenow={clamped}
      {...rest}
    >
      <span className="meter__fill" style={{ width: `${pct}%` }} />
    </div>
  )
}
