export type ShipId = 'vanguard' | 'striker' | 'aegis' | 'phantom'

export type ScreenId =
  | 'title'
  | 'hangar'
  | 'run'
  | 'results'
  | 'settings'
  | 'highScores'

export type Vec2 = { x: number; y: number }

export type EnemyKind = 'drone'

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

export type Enemy = {
  active: boolean
  kind: EnemyKind
  x: number
  y: number
  vy: number
  r: number
  hp: number
  points: number
}

export type RunSession = {
  score: number
  wave: number
  kills: number
  elapsed: number
  paused: boolean
}

export type World = {
  player: PlayerState
  session: RunSession
  streamSpeed: number
  playerBullets: PlayerBullet[]
  enemies: Enemy[]
  spawnTimer: number
  spawnLane: number
}
