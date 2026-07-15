import type { ReactNode } from 'react'

type Props = {
  label: ReactNode
  value: number
  onChange: (next: number) => void
  min?: number
  max?: number
}

export function Slider({ label, value, onChange, min = 0, max = 100 }: Props) {
  return (
    <label className="setting-row">
      <span className="setting-label">{label}</span>
      <span className="slider">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
        />
        <b className="slider-value">{value}</b>
      </span>
    </label>
  )
}
