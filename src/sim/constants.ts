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

export const RESPAWN = { x: 0, y: 3.5, z: 0 } as const

export const STREAM_BASE_SPEED = 4
export const STREAM_RAMP = 0.02
export const STREAM_CAP = 1.5

export const PLAYER_MAX_SPEED = 8
export const PLAYER_ACCEL = 40
export const PLAYER_DECEL = 50

export const CAMERA_FOV = 40

export const MAX_PLAYER_BULLETS = 64
export const MAX_ENEMY_BULLETS = 96
export const MAX_ENEMIES = 48

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

export function scrapForRun(score: number, wavesCompleted: number): number {
  return Math.floor(score / 100) + Math.floor(wavesCompleted * 5)
}
