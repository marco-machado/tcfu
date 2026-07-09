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
export const DRONE_SPAWN_INTERVAL = 1.25

export const SPAWN_LANES = [-4, -2, 0, 2, 4] as const

export function waveMultiplier(waveIndex: number): number {
  return Math.min(3, 1 + 0.05 * (waveIndex - 1))
}

export function scrapForRun(score: number, wavesCompleted: number): number {
  return Math.floor(score / 100) + Math.floor(wavesCompleted * 5)
}
