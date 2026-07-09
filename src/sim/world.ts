import { RESPAWN, STREAM_BASE_SPEED } from './constants'
import type { ShipId, World } from './types'

export function createWorld(shipId: ShipId = 'vanguard'): World {
  const maxHp = shipId === 'striker' ? 2 : 3
  const startBombs = shipId === 'aegis' ? 3 : 2

  return {
    player: {
      x: RESPAWN.x,
      y: RESPAWN.y,
      vx: 0,
      vy: 0,
      hp: maxHp,
      maxHp,
      lives: 3,
      bombs: startBombs,
      maxBombs: 5,
      weaponTier: 0,
      wCells: 0,
      shield: shipId === 'aegis',
      iFrames: 0,
      shipId,
    },
    session: {
      score: 0,
      wave: 1,
      kills: 0,
      elapsed: 0,
      paused: false,
    },
    streamSpeed: STREAM_BASE_SPEED,
  }
}

let world: World = createWorld()

export function getWorld(): World {
  return world
}

export function setWorld(next: World): void {
  world = next
}

export function resetWorld(shipId: ShipId = 'vanguard'): World {
  world = createWorld(shipId)
  return world
}
