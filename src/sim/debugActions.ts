import { emptyCommands } from '../input/commands'
import { FIXED_DT, SPAWN_Y } from './constants'
import { patternById, type PathId } from './patterns'
import { acquireEnemy, applyPlayerDamage, beginWave, configureEnemy, spawnPowerup, stepWorld } from './step'
import type { Enemy, EnemyKind, PowerupType, World } from './types'
import {
  WEAPON_TIER_MAX,
  WEAPON_TIER_THRESHOLDS,
  weaponTierForWCells,
  type WeaponTier,
} from './weapons'

const DEBUG_SCORE_STEP = 10_000
/** Distance above the ship a debug powerup enters, matching organic drop feel. */
const POWERUP_SPAWN_AHEAD = 9

function wCellsForTier(tier: WeaponTier): number {
  return tier === 0 ? 0 : WEAPON_TIER_THRESHOLDS[tier - 1]!
}

/** The path each kind most commonly uses in the authored wave catalog. */
const CANONICAL_PATH: Record<EnemyKind, PathId> = {
  drone: 'drift_down',
  dart: 'dive',
  gunner: 'hold_and_shot',
  sidecar: 'drift_down',
  razor: 'hold_and_shot',
  prism: 'hold_and_shot',
  colossus: 'hold_and_shot',
}

export function debugSpawnEnemy(world: World, kind: EnemyKind): Enemy | null {
  const slot = acquireEnemy(world)
  if (!slot) return null
  configureEnemy(
    slot,
    { t: 0, kind, x: 0, y: SPAWN_Y, path: CANONICAL_PATH[kind] },
    world.session.wave,
    world.streamSpeed,
  )
  return slot
}

export function debugTriggerPattern(world: World, patternId: string): boolean {
  if (!patternById(patternId)) return false
  const wasSuspended = world.waves.suspended
  beginWave(world, world.session.wave)
  world.waves.debugPatternId = patternId
  world.waves.debugResuspend = wasSuspended
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
  return spawnPowerup(world, type, world.player.x, world.player.y + POWERUP_SPAWN_AHEAD)
}

export function debugAdjustHp(world: World, delta: number): void {
  const p = world.player
  p.hp = Math.max(1, Math.min(p.maxHp, p.hp + delta))
}

export function debugAdjustLives(world: World, delta: number): void {
  const p = world.player
  p.lives = Math.max(1, p.lives + delta)
}

export function debugAdjustBombs(world: World, delta: number): void {
  const p = world.player
  p.bombs = Math.max(0, Math.min(p.maxBombs, p.bombs + delta))
}

export function debugAdjustWeaponTier(world: World, delta: number): void {
  const current = weaponTierForWCells(world.player.wCells)
  const next = Math.max(0, Math.min(WEAPON_TIER_MAX, current + delta)) as WeaponTier
  world.player.wCells = wCellsForTier(next)
}

export function debugSetShield(world: World, on: boolean): void {
  world.player.shield = on
}

export function debugSetGodMode(world: World, on: boolean): void {
  world.player.godMode = on
}

export function debugIsGodMode(world: World): boolean {
  return world.player.godMode
}

export function debugAddScore(world: World, amount: number = DEBUG_SCORE_STEP): void {
  world.session.score += amount
}

export function debugKillPlayer(world: World): void {
  const p = world.player
  p.godMode = false
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

export function debugSetPaused(world: World, paused: boolean): void {
  world.session.paused = paused
}

export function debugStepOneFrame(world: World): void {
  if (!world.session.paused) return
  world.session.paused = false
  stepWorld(world, FIXED_DT, emptyCommands())
  world.session.paused = true
}
