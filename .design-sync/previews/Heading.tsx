import { Heading } from 'tcfu'

export function Sizes() {
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <Heading size="xl">They came from Uranus</Heading>
      <Heading size="lg">Hangar deck</Heading>
      <Heading size="md">Flight records</Heading>
      <Heading size="sm">Bay 03 telemetry</Heading>
    </div>
  )
}
