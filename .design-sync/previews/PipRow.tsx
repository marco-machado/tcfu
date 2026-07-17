import { PipRow, Label } from 'tcfu'

const row = { display: 'grid', gap: 6 } as const

export function Shapes() {
  return (
    <div style={{ display: 'grid', gap: 14, minWidth: 240 }}>
      <div style={row}>
        <Label>Diamond</Label>
        <PipRow count={5} filled={3} shape="diamond" />
      </div>
      <div style={row}>
        <Label>Chevron</Label>
        <PipRow count={5} filled={2} shape="chevron" />
      </div>
      <div style={row}>
        <Label>Segment</Label>
        <PipRow count={6} filled={4} shape="segment" />
      </div>
      <div style={row}>
        <Label>Dot</Label>
        <PipRow count={4} filled={1} shape="dot" />
      </div>
    </div>
  )
}

export function IconPips() {
  return (
    <div style={{ display: 'grid', gap: 14, minWidth: 240 }}>
      <div style={row}>
        <Label>Lives</Label>
        <PipRow count={3} filled={2} icon="wing" tone="signal" />
      </div>
      <div style={row}>
        <Label>Bombs</Label>
        <PipRow count={3} filled={2} icon="bomb" tone="salvage" />
      </div>
    </div>
  )
}
