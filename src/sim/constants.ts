export const FIXED_DT = 1 / 60
export const MAX_SIM_STEPS = 5

export const STAGE_WIDTH = 1024
export const STAGE_HEIGHT = 768
export const STAGE_ASPECT = STAGE_WIDTH / STAGE_HEIGHT

export const BAND = {
  minX: -6,
  maxX: 6,
  minY: 1.5,
  maxY: 7,
} as const

/** Visual hull half-extents used to keep the ship mesh inside the band. */
export const PLAYER_HULL = {
  halfW: 0.55,
  halfH: 0.55,
} as const

/**
 * Extra inset from the band's top edge so the player cannot camp the entry line
 * where streaming threats first become collidable.
 */
export const BAND_TOP_SAFE = 0.85

export const RESPAWN = { x: 0, y: 3.5, z: 0 } as const

/** Newly spawned enemies deal no contact damage until this age (seconds). */
export const CONTACT_ARM_TIME = 0.5

/** Hold the playfield after final death before shell opens Results. */
export const DEATH_HOLD = 1.75

export const STREAM_BASE_SPEED = 4
export const STREAM_RAMP = 0.02
export const STREAM_CAP = 1.5

export const PLAYER_MAX_SPEED = 8
export const PLAYER_ACCEL = 40
export const PLAYER_DECEL = 50

/**
 * Run camera framing (view-only). Elevated behind the ship along the stream
 * axis (lower Y), pitched up the band for thruster/depth read. Not a trench
 * vanishing-point rewrite of the XY playfield.
 */
export const CAMERA_POS = { x: 0, y: 0.55, z: 11.6 } as const
export const CAMERA_LOOK_AT = { x: 0, y: 8.2, z: -1.1 } as const
export const CAMERA_FOV = 54

export const MAX_PLAYER_BULLETS = 64
export const MAX_ENEMY_BULLETS = 160
export const MAX_ENEMIES = 64
export const MAX_POWERUPS = 3
export const POWERUP_R = 0.35
/** Flat score awarded for collecting a powerup; gameplay effect remains primary. */
export const POWERUP_SCORE = 50

export const RATE_UP_COOLDOWN_MULT = 0.75
export const RATE_UP_DURATION = 8
export const SPREAD_UP_DURATION = 8
export const SPREAD_UP_OFFSET = 0.5
export const SCORE_MULT_DURATION = 10
export const SCORE_MULT_KILL = 2

export const POWERUP_PITY_SECONDS = 45
export const DROP_CHANCE: Record<'fodder' | 'grunt' | 'elite' | 'set_piece', number> = {
  fodder: 0.04,
  grunt: 0.08,
  elite: 0.25,
  set_piece: 1,
}

/** Catalog weights (sum 100). Order is selection order for cumulative rolls. */
export const DROP_WEIGHTS = [
  { type: 'shield' as const, weight: 20 },
  { type: 'bomb_stock' as const, weight: 15 },
  { type: 'repair' as const, weight: 15 },
  { type: 'rate_up' as const, weight: 20 },
  { type: 'spread_up' as const, weight: 15 },
  { type: 'score_mult' as const, weight: 15 },
]

export const PULSE_T0 = {
  cooldown: 0.18,
  bulletSpeed: 18,
  bulletR: 0.12,
  damage: 1,
} as const

export const PLAYER_HITBOX_R = 0.35

export const DRONE = {
  hp: 1,
  points: 100,
  r: 0.4,
  contactDamage: 1,
} as const

export const DART = {
  hp: 1,
  points: 120,
  r: 0.35,
  contactDamage: 1,
  fireInterval: 1.0,
  bulletSpeed: 8,
} as const

export const GUNNER = {
  hp: 4,
  points: 300,
  r: 0.55,
  contactDamage: 1,
  fireInterval: 1.4,
  bulletSpeed: 6,
} as const

export const SIDECAR = {
  hp: 5,
  points: 350,
  r: 0.55,
  contactDamage: 1,
  fireInterval: 1.2,
  bulletSpeed: 7,
} as const

export const RAZOR = {
  hp: 20,
  points: 1200,
  r: 0.7,
  contactDamage: 1,
  fireInterval: 1.6,
  bulletSpeed: 9,
  burstCount: 5,
} as const

export const PRISM = {
  hp: 28,
  points: 1500,
  r: 0.7,
  contactDamage: 1,
  fireInterval: 2.2,
  bulletSpeed: 7,
  ringCount: 8,
} as const

export const COLOSSUS = {
  hp: 100,
  points: 5000,
  halfW: 1.0,
  halfH: 0.6,
  r: 1.2,
  contactDamage: 2,
  fireInterval: 0.55,
  bulletSpeed: 7,
  sprayDuration: 3,
  pauseDuration: 2,
} as const

export const SET_PIECE_STREAM_MULT = 0.85

export const ENEMY_BULLET_R = 0.15
export const ENEMY_BULLET_DAMAGE = 1

export const IFRAMES_HIT = 1.0
export const IFRAMES_RESPAWN = 2.0
export const IFRAMES_SHIELD = 0.5
export const IFRAMES_BOMB = 0.75
export const MERCY_CLEAR_R = 3
export const BOMB_DAMAGE = 5

export const SPAWN_Y = 18
export const CULL_Y_MIN = -2
export const CULL_X_MAX = 10

export const WAVE_GAP = 0.75
export const WAVE_CLEAR_WINDOW = 8
export const HOLD_Y = 12

export const HP_RAMP = 0.04
export const HP_CAP = 2.5
export const SHOT_SPEED_RAMP = 0.03
export const SHOT_SPEED_CAP = 2.0
export const FIRE_CD_RAMP = 0.025
export const FIRE_CD_MIN_MULT = 0.5
export const EVENT_TIME_RAMP = 0.015
export const EVENT_TIME_MIN = 0.7

export function waveMultiplier(waveIndex: number): number {
  return Math.min(3, 1 + 0.05 * (waveIndex - 1))
}

export function streamSpeedForWave(waveIndex: number): number {
  return STREAM_BASE_SPEED * Math.min(STREAM_CAP, 1 + STREAM_RAMP * (waveIndex - 1))
}

export function enemyHpScale(waveIndex: number): number {
  return Math.min(HP_CAP, 1 + HP_RAMP * (waveIndex - 1))
}

export function enemyShotSpeedScale(waveIndex: number): number {
  return Math.min(SHOT_SPEED_CAP, 1 + SHOT_SPEED_RAMP * (waveIndex - 1))
}

export function enemyFireCooldownScale(waveIndex: number): number {
  return Math.max(FIRE_CD_MIN_MULT, 1 / (1 + FIRE_CD_RAMP * (waveIndex - 1)))
}

export function eventTimeScale(waveIndex: number): number {
  return Math.max(EVENT_TIME_MIN, 1 / (1 + EVENT_TIME_RAMP * (waveIndex - 1)))
}

export function waveClearBonus(waveIndex: number): number {
  return Math.floor(250 * (1 + 0.1 * (waveIndex - 1)))
}

/** Score when the player loses no HP during a wave (shield absorb still qualifies). */
export function noDamageWaveBonus(waveIndex: number): number {
  return Math.floor(150 * (1 + 0.1 * (waveIndex - 1)))
}

export function scrapFromScore(score: number): number {
  return Math.floor(score / 100)
}

export function scrapFromWaves(wavesCompleted: number): number {
  return Math.floor(wavesCompleted * 5)
}

export function scrapBase(score: number, wavesCompleted: number): number {
  return scrapFromScore(score) + scrapFromWaves(wavesCompleted)
}

/** Scrap at Results: floor(base × Salvage scrap earn mult). */
export function scrapForRun(score: number, wavesCompleted: number, scrapEarnMult = 1): number {
  return Math.floor(scrapBase(score, wavesCompleted) * scrapEarnMult)
}

/** Movement clamp so the full player hull stays inside the band, with top safe margin. */
export function playerMoveBounds(bandMaxYBonus = 0) {
  return {
    minX: BAND.minX + PLAYER_HULL.halfW,
    maxX: BAND.maxX - PLAYER_HULL.halfW,
    minY: BAND.minY + PLAYER_HULL.halfH,
    maxY: BAND.maxY + bandMaxYBonus - PLAYER_HULL.halfH - BAND_TOP_SAFE,
  }
}
