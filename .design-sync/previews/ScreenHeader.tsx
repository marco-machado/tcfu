import { ScreenHeader } from 'tcfu'

export function Basic() {
  return <ScreenHeader title="Hangar deck" kicker="Select a ship and launch" />
}

export function TitleOnly() {
  return <ScreenHeader title="Flight records" />
}
