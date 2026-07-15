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
        onKeyDown={(e) => {
          // Menu focus drives value edits with Left/Right; Right turns on, Left off.
          if (e.code === 'ArrowRight') {
            e.preventDefault()
            onChange(true)
          } else if (e.code === 'ArrowLeft') {
            e.preventDefault()
            onChange(false)
          }
        }}
      >
        <span className="toggle-thumb" />
        <span className="toggle-state">{checked ? 'On' : 'Off'}</span>
      </button>
    </label>
  )
}
