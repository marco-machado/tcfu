import {
  MAX_ENEMIES,
  MAX_ENEMY_BULLETS,
  MAX_PLAYER_BULLETS,
  PLAYER_HITBOX_R,
  RESPAWN,
  STREAM_BASE_SPEED,
} from './constants'
import type { Enemy, EnemyBullet, PlayerBullet, ShipId, World } from './types'

function emptyPlayerBullet(): PlayerBullet {
  return { active: false, x: 0, y: 0, vy: 0, r: 0.12, damage: 1 }
}

function emptyEnemyBullet(): EnemyBullet {
  return { active: false, x: 0, y: 0, vy: 0, r: 0.15, damage: 1 }
}

function emptyEnemy(): Enemy {
  return {
    active: false,
    kind: 'drone',
    x: 0,
    y: 0,
    vy: 0,
    r: 0,
    hp: 0,
    points: 0,
    contactDamage: 1,
    fireCooldown: 0,
    fireInterval: 0,
    bulletSpeed: 0,
  }
}

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
      fireCooldown: 0,
      hitboxR: PLAYER_HITBOX_R,
    },
    session: {
      score: 0,
      wave: 1,
      kills: 0,
      elapsed: 0,
      paused: false,
      runOver: false,
    },
    streamSpeed: STREAM_BASE_SPEED,
    playerBullets: Array.from({ length: MAX_PLAYER_BULLETS }, emptyPlayerBullet),
    enemyBullets: Array.from({ length: MAX_ENEMY_BULLETS }, emptyEnemyBullet),
    enemies: Array.from({ length: MAX_ENEMIES }, emptyEnemy),
    spawnTimer: 0,
    spawnLane: 0,
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
