import { readJson, writeJson } from './storage'
import type { ShipId } from '../sim/types'

const KEY = 'tcfu.lastShip'

export function loadLastShip(): ShipId {
  return readJson<ShipId>(KEY, 'vanguard')
}

export function saveLastShip(shipId: ShipId): void {
  writeJson(KEY, shipId)
}
