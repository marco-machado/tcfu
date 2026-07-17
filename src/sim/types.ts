import type { PathId } from './patterns'
import type { MetaModifiers } from './metaModifiers'
import type { PresentationBuffer } from './presentation'

export type ShipId = 'vanguard' | 'striker' | 'aegis' | 'phantom'

export type ScreenId =
  | 'title'
  | 'hangar'
  | 'upgradeBay'
  | 'run'
  | 'results'
  | 'settings'
  | 'highScores'

export type Vec2 = { x: number; y: number }

export const ENEMY_KINDS = [
  'drone',
  'dart',
  'gunner',
  'sidecar',
  'razor',
  'prism',
  'colossus',
] as const
export type EnemyKind = (typeof ENEMY_KINDS)[number]
export type EnemyClass = 'fodder' | 'grunt' | 'elite' | 'set_piece'
export const POWERUP_TYPES = [
  'shield',
  'bomb_stock',
  'repair',
  'rate_up',
  'spread_up',
  'score_mult',
] as const
export type PowerupType = (typeof POWERUP_TYPES)[number]
export type ShotStyle =
  | 'none'
  | 'down'
  | 'spread3'
  | 'side_pair'
  | 'aimed_burst'
  | 'ring8'
  | 'boss_spray'
export type EnemyPhase = 'none' | 'spray' | 'pause'

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
  /** Debug-only sustained invulnerability; never set during normal play. */
  godMode: boolean
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
  /** True once this bullet has awarded a graze; one graze per bullet. */
  grazed: boolean
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
  /** AABB half-width; 0 means circle hitbox using r. */
  halfW: number
  /** AABB half-height; 0 means circle hitbox using r. */
  halfH: number
  hp: number
  maxHp: number
  points: number
  contactDamage: number
  fireCooldown: number
  fireInterval: number
  /** Number of volleys fired; drives deterministic alternating patterns. */
  fireSequence: number
  bulletSpeed: number
  path: PathId
  pathPhase: number
  /** Target lane X for strafe-enter paths. */
  laneX: number
  waveId: number
  shotStyle: ShotStyle
  phase: EnemyPhase
  phaseElapsed: number
  /** Seconds alive; contact damage arms after CONTACT_ARM_TIME. */
  age: number
  /** Seconds remaining of damage flash (view-facing). */
  hitFlash: number
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
  /** True if player HP decreased during the current wave (shield absorb does not set this). */
  hpLostThisWave: boolean
  /** True after no-damage wave bonus was applied for the current wave. */
  noDamageAwarded: boolean
  waveSpawned: number
  waveKilled: number
  nextPowerupEventIndex: number
  /** Debug-triggered pattern id; overrides playlist selection until it completes. */
  debugPatternId: string | null
  /** Suspension state to restore once a debug-triggered pattern completes. */
  debugResuspend: boolean
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
  /** Current kill-chain length; decays when comboTimer expires or on hull damage. */
  combo: number
  /** Seconds left to extend the chain; refreshed on kill, topped up by graze. */
  comboTimer: number
  bestCombo: number
  /** Total near-miss grazes this Run. */
  grazes: number
}

/** Returns a value in [0, 1). Injectable for deterministic drop tests. */
export type Rng = () => number

export type World = {
  player: PlayerState
  session: RunSession
  streamSpeed: number
  /** Deterministic distance travelled by the visual world stream. */
  streamDistance: number
  playerBullets: PlayerBullet[]
  enemyBullets: EnemyBullet[]
  enemies: Enemy[]
  powerups: Powerup[]
  waves: WaveDirector
  /** Seconds since last powerup spawn or collection (pity dry spell). */
  powerupDryElapsed: number
  rng: Rng
  /** Meta combat/payout snapshot frozen at Run start. */
  meta: MetaModifiers
  /** Bounded combat presentation events for view/audio/rumble. */
  presentation: PresentationBuffer
}
