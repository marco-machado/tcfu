import { Toggle } from 'tcfu'

export function States() {
  return (
    <div style={{ display: 'grid', gap: 4, minWidth: 360 }}>
      <Toggle label="Screen shake" checked onChange={() => {}} />
      <Toggle label="Damage numbers" checked={false} onChange={() => {}} />
    </div>
  )
}

export function WithHint() {
  return (
    <div style={{ minWidth: 360 }}>
      <Toggle
        label="Reduced flashes"
        hint="Softens explosions and boss telegraphs"
        checked
        onChange={() => {}}
      />
    </div>
  )
}
