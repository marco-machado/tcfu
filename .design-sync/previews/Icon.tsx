import { Icon, Label } from 'tcfu'

const NAMES = [
  'aegis',
  'arsenal',
  'audio',
  'back',
  'bomb',
  'bounty',
  'career',
  'controls',
  'display',
  'hull',
  'lance',
  'launch',
  'lock',
  'options',
  'overclock',
  'pause',
  'phantom',
  'salvage',
  'scrap',
  'shield',
  'striker',
  'thrust',
  'upgrade',
  'vanguard',
  'wcell',
  'wing',
] as const

export function AllIcons() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(6, 90px)',
        gap: 14,
        alignItems: 'center',
      }}
    >
      {NAMES.map((name) => (
        <span key={name} style={{ display: 'grid', justifyItems: 'center', gap: 4 }}>
          <Icon name={name} width={24} height={24} />
          <Label style={{ fontSize: 10 }}>{name}</Label>
        </span>
      ))}
    </div>
  )
}

export function SmallSize() {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
      <Icon name="shield" width={16} height={16} />
      <Icon name="bomb" width={16} height={16} />
      <Icon name="scrap" width={16} height={16} />
      <Label>Survives at 16px</Label>
    </div>
  )
}
