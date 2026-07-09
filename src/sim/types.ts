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
export type EnemyClass = 'fodder' | 'grunt' | 'elite' | 'set_piece'
export type PowerupType = 'shield' | 'bomb_stock' | 'repair' | 'rate_up' | 'spread_up' | 'score_mult'

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
  wCells: number
  shield: boolean
  iFrames: number
  shipId: ShipId
  fireCooldown: number
  hitboxR: number
  rateUp: number
  spreadUp: number
  scoreMult: number
}

export type PlayerBullet = {
  active: boolean
  x: number
  y: number
  vx: number
  vy: number
  r: number
  damage: number
  pierce: number
  hitEnemyIds: number[]
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
  id: number
  active: boolean
  kind: EnemyKind
  class: EnemyClass
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

export type Powerup = {
  id: number
  active: boolean
  type: PowerupType
  x: number
  y: number
  r: number
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
  powerups: Powerup[]
  waves: WaveDirector
}
