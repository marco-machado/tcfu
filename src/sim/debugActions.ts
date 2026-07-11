import { emptyCommands } from '../input/commands'
import { FIXED_DT, SPAWN_Y } from './constants'
import { patternById } from './patterns'
import {
  acquireEnemySlot,
  applyPlayerDamage,
  beginWave,
  configureEnemy,
  spawnPowerup,
  stepWorld,
} from './step'
import type { Enemy, EnemyKind, PowerupType, World } from './types'
import { WEAPON_TIER_MAX, weaponTierForWCells, type WeaponTier } from './weapons'

const DEBUG_LIVES_MAX = 9
const DEBUG_SCORE_STEP = 10_000
const TIER_W_CELLS: Record<WeaponTier, number> = { 0: 0, 1: 20, 2: 50, 3: 100 }

export function debugSpawnEnemy(world: World, kind: EnemyKind): Enemy | null {
  const slot = acquireEnemySlot(world)
  if (!slot) return null
  configureEnemy(
    slot,
    { t: 0, kind, x: 0, y: SPAWN_Y, path: kind === 'colossus' ? 'hold_and_shot' : 'drift_down' },
    world.session.wave,
    world.streamSpeed,
  )
  return slot
}

export function debugTriggerPattern(world: World, patternId: string): boolean {
  if (!patternById(patternId)) return false
  beginWave(world, world.session.wave)
  world.waves.debugPatternId = patternId
  world.waves.suspended = false
  return true
}

export function debugSuspendWaves(world: World, suspended: boolean): void {
  world.waves.suspended = suspended
}

export function debugJumpToWave(world: World, waveIndex: number): void {
  const suspended = world.waves.suspended
  beginWave(world, Math.max(1, Math.floor(waveIndex)))
  world.waves.suspended = suspended
}

export function debugSpawnPowerup(world: World, type: PowerupType): boolean {
  return spawnPowerup(world, type, world.player.x, world.player.y + 9)
}

export function debugAdjustHp(world: World, delta: number): void {
  const p = world.player
  p.hp = Math.max(1, Math.min(p.maxHp, p.hp + delta))
}

export function debugAdjustLives(world: World, delta: number): void {
  const p = world.player
  p.lives = Math.max(1, Math.min(DEBUG_LIVES_MAX, p.lives + delta))
}

export function debugAdjustBombs(world: World, delta: number): void {
  const p = world.player
  p.bombs = Math.max(0, Math.min(p.maxBombs, p.bombs + delta))
}

export function debugAdjustWeaponTier(world: World, delta: number): void {
  const current = weaponTierForWCells(world.player.wCells)
  const next = Math.max(0, Math.min(WEAPON_TIER_MAX, current + delta)) as WeaponTier
  world.player.wCells = TIER_W_CELLS[next]
}

export function debugSetShield(world: World, on: boolean): void {
  world.player.shield = on
}

export function debugSetGodMode(world: World, on: boolean): void {
  world.player.iFrames = on ? Number.POSITIVE_INFINITY : 0
}

export function debugIsGodMode(world: World): boolean {
  return world.player.iFrames === Number.POSITIVE_INFINITY
}

export function debugAddScore(world: World, amount: number = DEBUG_SCORE_STEP): void {
  world.session.score += amount
}

export function debugKillPlayer(world: World): void {
  const p = world.player
  p.shield = false
  p.iFrames = 0
  p.hp = 1
  p.lives = 1
  applyPlayerDamage(world, 1)
}

export function debugClearAll(world: World): void {
  for (const e of world.enemies) e.active = false
  for (const b of world.enemyBullets) b.active = false
}

export function debugStepOneFrame(world: World): void {
  if (!world.session.paused) return
  world.session.paused = false
  stepWorld(world, FIXED_DT, emptyCommands())
  world.session.paused = true
}
