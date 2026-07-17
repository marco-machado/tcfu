import { BrandMark, Label } from 'tcfu'

export function Mark() {
  return (
    <div style={{ display: 'grid', justifyItems: 'center', gap: 8 }}>
      <BrandMark decorative className="brand-mark" />
      <Label variant="kicker">Corridor insignia</Label>
    </div>
  )
}
