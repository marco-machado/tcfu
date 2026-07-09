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
