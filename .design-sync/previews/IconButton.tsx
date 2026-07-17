import { IconButton } from 'tcfu'

export function Controls() {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <IconButton icon="pause" label="Pause" />
      <IconButton icon="audio" label="Audio settings" />
      <IconButton icon="options" label="Options" />
      <IconButton icon="back" label="Back" />
    </div>
  )
}

export function Disabled() {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <IconButton icon="launch" label="Launch" disabled />
      <IconButton icon="lock" label="Locked bay" disabled />
    </div>
  )
}
