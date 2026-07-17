import { Segmented } from 'tcfu'

export function Options() {
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <Segmented
        label="Display mode"
        value="fullscreen"
        onChange={() => {}}
        options={[
          { value: 'windowed', label: 'Windowed' },
          { value: 'fullscreen', label: 'Fullscreen' },
        ]}
      />
      <Segmented
        label="Difficulty"
        value="veteran"
        onChange={() => {}}
        options={[
          { value: 'cadet', label: 'Cadet' },
          { value: 'veteran', label: 'Veteran' },
          { value: 'ace', label: 'Ace' },
        ]}
      />
    </div>
  )
}
