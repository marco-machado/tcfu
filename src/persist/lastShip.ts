import { readJson, writeJson } from './storage'
import type { ShipId } from '../sim/types'
import { SHIP_KIT_IDS } from '../sim/shipKits'

const KEY = 'tcfu.lastShip'

function isShipId(value: unknown): value is ShipId {
  return typeof value === 'string' && (SHIP_KIT_IDS as string[]).includes(value)
}

export function loadLastShip(): ShipId {
  const data = readJson<unknown>(KEY, 'vanguard')
  return isShipId(data) ? data : 'vanguard'
}

export function saveLastShip(shipId: ShipId): void {
  writeJson(KEY, shipId)
}
