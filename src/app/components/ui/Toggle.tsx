import type { ReactNode } from 'react'
import { cn } from './cn'

type Props = {
  label: ReactNode
  hint?: string
  checked: boolean
  onChange: (next: boolean) => void
}

export function Toggle({ label, hint, checked, onChange }: Props) {
  return (
    <label className="setting-row">
      <span className="setting-label">
        {label}
        {hint ? <small>{hint}</small> : null}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        className={cn('toggle', checked && 'is-on')}
        onClick={() => onChange(!checked)}
      >
        <span className="toggle-thumb" />
        <span className="toggle-state">{checked ? 'On' : 'Off'}</span>
      </button>
    </label>
  )
}
