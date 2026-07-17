import { Panel, Heading, Label, Meter } from 'tcfu'

export function Sizes() {
  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'stretch', flexWrap: 'wrap' }}>
      <Panel size="sm" style={{ padding: 12 }}>
        <Label>Notch sm</Label>
      </Panel>
      <Panel size="md" style={{ padding: 16 }}>
        <Label>Notch md</Label>
      </Panel>
      <Panel size="lg" style={{ padding: 20 }}>
        <Label>Notch lg</Label>
      </Panel>
    </div>
  )
}

export function TelemetryCard() {
  return (
    <Panel size="lg" style={{ padding: 20, maxWidth: 340, display: 'grid', gap: 10 }}>
      <Label variant="kicker">Bay 03 // Vanguard</Label>
      <Heading size="md">Hull integrity</Heading>
      <Meter value={0.72} tone="repair" />
      <p style={{ margin: 0 }}>
        Plating holds at 72 percent. Salvage crews report the port intake still carries
        scoring from the last corridor run.
      </p>
    </Panel>
  )
}

export function DangerTone() {
  return (
    <Panel tone="danger" size="md" style={{ padding: 16, maxWidth: 300, display: 'grid', gap: 8 }}>
      <Label variant="kicker">Warning</Label>
      <Heading size="sm">Reactor overclock</Heading>
      <p style={{ margin: 0 }}>Heat threshold exceeded. Disengage before the next wave.</p>
    </Panel>
  )
}
