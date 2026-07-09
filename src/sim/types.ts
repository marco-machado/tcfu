export type ShipId = 'vanguard' | 'striker' | 'aegis' | 'phantom'

export type ScreenId =
  | 'title'
  | 'hangar'
  | 'run'
  | 'results'
  | 'settings'
  | 'highScores'

export type Vec2 = { x: number; y: number }

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
}
