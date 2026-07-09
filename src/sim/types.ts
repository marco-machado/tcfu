import type { PathId } from './patterns'

export type ShipId = 'vanguard' | 'striker' | 'aegis' | 'phantom'

export type ScreenId =
  | 'title'
  | 'hangar'
  | 'run'
  | 'results'
  | 'settings'
  | 'highScores'

export type Vec2 = { x: number; y: number }

export type EnemyKind = 'drone' | 'dart' | 'gunner'

export type PlayerState = {
  x: number
  y: number
  vx: number
  vy: number
  hp: number
  maxHp: number
  lives: number
  bombs: number
  maxBombs: number
  weaponTier: number
  wCells: number
  shield: boolean
  iFrames: number
  shipId: ShipId
  fireCooldown: number
  hitboxR: number
}

export type PlayerBullet = {
  active: boolean
  x: number
  y: number
  vy: number
  r: number
  damage: number
}

export type EnemyBullet = {
  active: boolean
  x: number
  y: number
  vx: number
  vy: number
  r: number
  damage: number
}

export type Enemy = {
  active: boolean
  kind: EnemyKind
  x: number
  y: number
  vy: number
  r: number
  hp: number
  points: number
  contactDamage: number
  fireCooldown: number
  fireInterval: number
  bulletSpeed: number
  path: PathId
  pathPhase: number
  waveId: number
  shotStyle: 'none' | 'down' | 'spread3'
  /** Seconds alive; contact damage arms after CONTACT_ARM_TIME. */
  age: number
}

export type WavePhase = 'spawning' | 'await_clear' | 'gap'

export type WaveDirector = {
  /** When true, director does not spawn (for unit tests). */
  suspended: boolean
  phase: WavePhase
  patternElapsed: number
  nextEventIndex: number
  clearElapsed: number
  gapElapsed: number
  clearAwarded: boolean
  waveSpawned: number
  waveKilled: number
}

export type RunSession = {
  score: number
  wave: number
  kills: number
  elapsed: number
  paused: boolean
  runOver: boolean
  /** Seconds remaining after runOver before Results may open. */
  endHold: number
  /** Visual death flash timer (seconds remaining). */
  deathFlash: number
}

export type World = {
  player: PlayerState
  session: RunSession
  streamSpeed: number
  playerBullets: PlayerBullet[]
  enemyBullets: EnemyBullet[]
  enemies: Enemy[]
  waves: WaveDirector
}
