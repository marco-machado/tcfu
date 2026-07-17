import { Meter, Label } from 'tcfu'

const row = { display: 'grid', gap: 6 } as const

export function Tones() {
  return (
    <div style={{ display: 'grid', gap: 14, minWidth: 260 }}>
      <div style={row}>
        <Label>Signal</Label>
        <Meter value={0.65} tone="signal" />
      </div>
      <div style={row}>
        <Label>Salvage</Label>
        <Meter value={0.4} tone="salvage" />
      </div>
      <div style={row}>
        <Label>Threat</Label>
        <Meter value={0.85} tone="threat" />
      </div>
      <div style={row}>
        <Label>Repair</Label>
        <Meter value={0.3} tone="repair" />
      </div>
    </div>
  )
}

export function Segmented() {
  return (
    <div style={{ display: 'grid', gap: 6, minWidth: 260 }}>
      <Label>Boss hull</Label>
      <Meter value={0.55} tone="threat" segments />
    </div>
  )
}

export function Extremes() {
  return (
    <div style={{ display: 'grid', gap: 14, minWidth: 260 }}>
      <div style={row}>
        <Label>Empty</Label>
        <Meter value={0} tone="signal" />
      </div>
      <div style={row}>
        <Label>Full</Label>
        <Meter value={1} tone="salvage" />
      </div>
    </div>
  )
}
