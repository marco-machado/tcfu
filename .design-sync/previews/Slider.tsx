import { Slider } from 'tcfu'

export function Volumes() {
  return (
    <div style={{ display: 'grid', gap: 4, minWidth: 360 }}>
      <Slider label="Master volume" value={80} onChange={() => {}} />
      <Slider label="Music" value={45} onChange={() => {}} />
      <Slider label="Effects" value={100} onChange={() => {}} />
    </div>
  )
}
