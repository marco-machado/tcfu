import { Chip } from 'tcfu'

export function Tones() {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
      <Chip icon="shield">Shield x2</Chip>
      <Chip tone="scrap" icon="scrap">
        1,240 scrap
      </Chip>
      <Chip tone="expiring" icon="overclock">
        Overclock 4s
      </Chip>
    </div>
  )
}

export function TextOnly() {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <Chip>Wave 12</Chip>
      <Chip tone="scrap">Best 84,300</Chip>
    </div>
  )
}
