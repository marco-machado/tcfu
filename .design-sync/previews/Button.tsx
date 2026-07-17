import { Button } from 'tcfu'

export function Variants() {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
      <Button variant="primary">Launch sortie</Button>
      <Button variant="secondary">Return to hangar</Button>
      <Button variant="tertiary">View flight records</Button>
      <Button variant="danger">Abandon run</Button>
      <Button variant="ghost">Skip briefing</Button>
    </div>
  )
}

export function WithIcons() {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
      <Button variant="primary" icon="launch">
        Launch
      </Button>
      <Button variant="secondary" icon="back">
        Back
      </Button>
      <Button variant="danger" icon="bomb">
        Purge cargo
      </Button>
    </div>
  )
}

export function Disabled() {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <Button variant="primary" disabled>
        Launch sortie
      </Button>
      <Button variant="secondary" disabled>
        Return to hangar
      </Button>
    </div>
  )
}
