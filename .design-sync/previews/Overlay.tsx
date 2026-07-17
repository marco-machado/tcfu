import { Overlay, Heading, Label } from 'tcfu'

const frame = { position: 'relative', width: 360, height: 200, overflow: 'hidden' } as const
const center = {
  position: 'absolute',
  inset: 0,
  display: 'grid',
  placeContent: 'center',
  gap: 6,
  textAlign: 'center',
} as const

export function Tones() {
  return (
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
      {(['default', 'pause', 'death'] as const).map((tone) => (
        <div key={tone} style={frame}>
          <Overlay tone={tone} style={{ position: 'absolute', inset: 0 }}>
            <div style={center}>
              <Label variant="kicker">Overlay // {tone}</Label>
              <Heading size="md">{tone === 'death' ? 'Hull lost' : 'Standby'}</Heading>
            </div>
          </Overlay>
        </div>
      ))}
    </div>
  )
}
