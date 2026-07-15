import { cn } from './cn'

type Option<T extends string> = { value: T; label: string }

type Props<T extends string> = {
  options: Option<T>[]
  value: T
  onChange: (next: T) => void
  label: string
}

export function Segmented<T extends string>({ options, value, onChange, label }: Props<T>) {
  // One focus stop for the whole group (menu focus treats a radiogroup as a
  // single ring entry). Left/Right step the selection between options.
  const step = (delta: number) => {
    const index = options.findIndex((o) => o.value === value)
    const next = Math.max(0, Math.min(options.length - 1, index + delta))
    if (next !== index) onChange(options[next]!.value)
  }

  return (
    <div
      className="segmented"
      role="radiogroup"
      aria-label={label}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.code === 'ArrowRight') {
          e.preventDefault()
          step(1)
        } else if (e.code === 'ArrowLeft') {
          e.preventDefault()
          step(-1)
        }
      }}
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          role="radio"
          tabIndex={-1}
          aria-checked={value === opt.value}
          className={cn(value === opt.value && 'is-active')}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
