import {
  MAX_ENEMIES,
  MAX_ENEMY_BULLETS,
  MAX_PLAYER_BULLETS,
  MAX_POWERUPS,
  PLAYER_HITBOX_R,
  POWERUP_R,
  RESPAWN,
  streamSpeedForWave,
} from './constants'
import { DEFAULT_META_MODIFIERS, type MetaModifiers } from './metaModifiers'
import type { Enemy, EnemyBullet, PlayerBullet, Powerup, ShipId, World } from './types'

function emptyPlayerBullet(): PlayerBullet {
  return { active: false, x: 0, y: 0, vx: 0, vy: 0, r: 0.12, damage: 1, pierce: 0, hitEnemyIds: [] }
}

function emptyEnemyBullet(): EnemyBullet {
  return { active: false, x: 0, y: 0, vx: 0, vy: 0, r: 0.15, damage: 1 }
}

function emptyPowerup(_: unknown, id: number): Powerup {
  return { id, active: false, type: 'shield', x: 0, y: 0, r: POWERUP_R }
}

function emptyEnemy(_: unknown, id: number): Enemy {
  return {
    id,
    active: false,
    kind: 'drone',
    class: 'fodder',
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
    path: 'drift_down',
    pathPhase: 0,
    waveId: 0,
    shotStyle: 'none',
    age: 0,
  }
}

export function createWorld(
  shipId: ShipId = 'vanguard',
  meta: MetaModifiers = DEFAULT_META_MODIFIERS,
): World {
  const maxHp = shipId === 'striker' ? 2 : 3
  const kitStartBombs = shipId === 'aegis' ? 3 : 2
  const kitMaxBombs = 5
  const maxBombs = kitMaxBombs + meta.bombMaxBonus
  const startBombs = Math.min(kitStartBombs + meta.bombStartBonus, maxBombs)
  const kitStartShield = shipId === 'aegis'

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
      maxBombs,
      wCells: 0,
      shield: kitStartShield || meta.startRunShield,
      iFrames: 0,
      shipId,
      fireCooldown: 0,
      hitboxR: PLAYER_HITBOX_R,
      rateUp: 0,
      spreadUp: 0,
      scoreMult: 0,
    },
    session: {
      score: 0,
      wave: 1,
      kills: 0,
      elapsed: 0,
      paused: false,
      runOver: false,
      endHold: 0,
      deathFlash: 0,
    },
    streamSpeed: streamSpeedForWave(1),
    playerBullets: Array.from({ length: MAX_PLAYER_BULLETS }, emptyPlayerBullet),
    enemyBullets: Array.from({ length: MAX_ENEMY_BULLETS }, emptyEnemyBullet),
    enemies: Array.from({ length: MAX_ENEMIES }, emptyEnemy),
    powerups: Array.from({ length: MAX_POWERUPS }, emptyPowerup),
    waves: {
      suspended: false,
      phase: 'spawning',
      patternElapsed: 0,
      nextEventIndex: 0,
      clearElapsed: 0,
      gapElapsed: 0,
      clearAwarded: false,
      waveSpawned: 0,
      waveKilled: 0,
      nextPowerupEventIndex: 0,
    },
    powerupDryElapsed: 0,
    rng: Math.random,
    meta: { ...meta },
  }
}

let world: World = createWorld()

export function getWorld(): World {
  return world
}

export function setWorld(next: World): void {
  world = next
}

export function resetWorld(
  shipId: ShipId = 'vanguard',
  meta: MetaModifiers = DEFAULT_META_MODIFIERS,
): World {
  world = createWorld(shipId, meta)
  return world
}
