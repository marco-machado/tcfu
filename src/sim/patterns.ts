import type { EnemyKind, PowerupType } from './types'

export type PathId =
  | 'drift_down'
  | 'sine_x'
  | 'dive'
  | 'hold_and_shot'
  | 'strafe_enter_left'
  | 'strafe_enter_right'

export type SpawnEvent = {
  t: number
  kind: EnemyKind
  x: number
  y: number
  path: PathId
}

export type PowerupSpawnEvent = {
  t: number
  x: number
  y: number
  types: PowerupType[]
}

export type WavePattern = {
  id: string
  events: SpawnEvent[]
  powerupEvents?: PowerupSpawnEvent[]
}

function lineH(
  t: number,
  count: number,
  x0: number,
  x1: number,
  kind: EnemyKind,
  path: PathId,
  y = 18,
): SpawnEvent[] {
  const events: SpawnEvent[] = []
  for (let i = 0; i < count; i++) {
    const u = count === 1 ? 0.5 : i / (count - 1)
    events.push({ t, kind, x: x0 + (x1 - x0) * u, y, path })
  }
  return events
}

function column(t: number, count: number, x: number, kind: EnemyKind, path: PathId, y0 = 18): SpawnEvent[] {
  const events: SpawnEvent[] = []
  for (let i = 0; i < count; i++) {
    events.push({ t: t + i * 0.15, kind, x, y: y0, path })
  }
  return events
}

function vee(t: number, kind: EnemyKind, path: PathId): SpawnEvent[] {
  const xs = [-4, -2, 0, 2, 4]
  return xs.map((x, i) => ({
    t: t + i * 0.08,
    kind,
    x,
    y: 18 + Math.abs(x) * 0.15,
    path,
  }))
}

function sweepLr(t: number, count: number, kind: EnemyKind, path: PathId): SpawnEvent[] {
  const events: SpawnEvent[] = []
  for (let i = 0; i < count; i++) {
    events.push({ t: t + i * 0.22, kind, x: -4.5 + i * (9 / Math.max(1, count - 1)), y: 18, path })
  }
  return events
}

function sweepRl(t: number, count: number, kind: EnemyKind, path: PathId): SpawnEvent[] {
  const events: SpawnEvent[] = []
  for (let i = 0; i < count; i++) {
    events.push({ t: t + i * 0.22, kind, x: 4.5 - i * (9 / Math.max(1, count - 1)), y: 18, path })
  }
  return events
}

export const INTRO_01: WavePattern = {
  id: 'intro_01',
  events: [
    ...lineH(0.0, 4, -4, 4, 'drone', 'drift_down'),
    ...lineH(2.5, 4, -4, 4, 'drone', 'drift_down'),
  ],
}

export const INTRO_02: WavePattern = {
  id: 'intro_02',
  events: [
    ...lineH(0.0, 5, -4, 4, 'dart', 'dive'),
    ...lineH(2.0, 4, -3.5, 3.5, 'drone', 'sine_x'),
    ...column(4.0, 3, 0, 'dart', 'dive'),
  ],
}

export const INTRO_03: WavePattern = {
  id: 'intro_03',
  events: [
    { t: 0.0, kind: 'gunner', x: -2, y: 18, path: 'hold_and_shot' },
    { t: 0.0, kind: 'gunner', x: 2, y: 18, path: 'hold_and_shot' },
    ...lineH(1.5, 6, -5, 5, 'drone', 'drift_down'),
  ],
  powerupEvents: [{ t: 3.0, x: 0, y: 14, types: ['rate_up', 'shield'] }],
}

export const EASY_LINE_DRONES: WavePattern = {
  id: 'easy_line_drones',
  events: [
    ...lineH(0.0, 5, -4.5, 4.5, 'drone', 'drift_down'),
    ...lineH(2.0, 5, -4.5, 4.5, 'drone', 'drift_down'),
    ...lineH(4.0, 4, -3.5, 3.5, 'drone', 'drift_down'),
  ],
}

export const EASY_DART_DIVE: WavePattern = {
  id: 'easy_dart_dive',
  events: [
    ...column(0.0, 4, -2, 'dart', 'dive'),
    ...column(0.5, 4, 2, 'dart', 'dive'),
    ...lineH(2.5, 3, -3, 3, 'drone', 'drift_down'),
  ],
}

export const EASY_VEE: WavePattern = {
  id: 'easy_vee',
  events: [...vee(0.0, 'drone', 'drift_down'), ...vee(2.2, 'drone', 'sine_x')],
}

export const EASY_SWEEP_LR: WavePattern = {
  id: 'easy_sweep_lr',
  events: [
    ...sweepLr(0.0, 6, 'drone', 'drift_down'),
    { t: 1.8, kind: 'gunner', x: 0, y: 18, path: 'hold_and_shot' },
    ...sweepLr(3.0, 5, 'drone', 'sine_x'),
  ],
}

export const EASY_SIDES: WavePattern = {
  id: 'easy_sides',
  events: [
    { t: 0.0, kind: 'drone', x: -3, y: 18, path: 'strafe_enter_left' },
    { t: 0.15, kind: 'drone', x: -1, y: 18, path: 'strafe_enter_left' },
    { t: 0.3, kind: 'drone', x: 1, y: 18, path: 'strafe_enter_right' },
    { t: 0.45, kind: 'drone', x: 3, y: 18, path: 'strafe_enter_right' },
    ...lineH(2.0, 4, -3, 3, 'drone', 'drift_down'),
  ],
}

export const EASY_GUNNER_PAIR: WavePattern = {
  id: 'easy_gunner_pair',
  events: [
    { t: 0.0, kind: 'gunner', x: -3, y: 18, path: 'hold_and_shot' },
    { t: 0.0, kind: 'gunner', x: 3, y: 18, path: 'hold_and_shot' },
    ...lineH(1.2, 5, -4, 4, 'drone', 'drift_down'),
  ],
}

export const EASY_SINE_WALL: WavePattern = {
  id: 'easy_sine_wall',
  events: [
    ...lineH(0.0, 7, -5, 5, 'drone', 'sine_x'),
    ...lineH(1.8, 7, -5, 5, 'drone', 'sine_x'),
  ],
}

export const EASY_MIXED_LITE: WavePattern = {
  id: 'easy_mixed_lite',
  events: [
    ...lineH(0.0, 4, -4, 4, 'drone', 'drift_down'),
    ...column(1.2, 3, -2, 'dart', 'dive'),
    ...column(1.4, 3, 2, 'dart', 'dive'),
    { t: 2.5, kind: 'sidecar', x: 0, y: 18, path: 'drift_down' },
  ],
}

export const MID_GUN_WALL: WavePattern = {
  id: 'mid_gun_wall',
  events: [
    { t: 0.0, kind: 'gunner', x: -4, y: 18, path: 'hold_and_shot' },
    { t: 0.0, kind: 'gunner', x: 0, y: 18, path: 'hold_and_shot' },
    { t: 0.0, kind: 'gunner', x: 4, y: 18, path: 'hold_and_shot' },
    ...lineH(1.5, 6, -5, 5, 'drone', 'drift_down'),
  ],
}

export const MID_SIDECAR_LANE: WavePattern = {
  id: 'mid_sidecar_lane',
  events: [
    { t: 0.0, kind: 'sidecar', x: -3.5, y: 18, path: 'drift_down' },
    { t: 0.4, kind: 'sidecar', x: 0, y: 18, path: 'drift_down' },
    { t: 0.8, kind: 'sidecar', x: 3.5, y: 18, path: 'drift_down' },
    ...lineH(2.0, 5, -4, 4, 'drone', 'sine_x'),
  ],
}

export const MID_DOUBLE_SWEEP: WavePattern = {
  id: 'mid_double_sweep',
  events: [
    ...sweepLr(0.0, 6, 'drone', 'drift_down'),
    ...sweepRl(1.2, 6, 'drone', 'drift_down'),
    ...lineH(3.0, 4, -3, 3, 'dart', 'dive'),
  ],
}

export const MID_HOLD_SQUAD: WavePattern = {
  id: 'mid_hold_squad',
  events: [
    { t: 0.0, kind: 'gunner', x: -3, y: 18, path: 'hold_and_shot' },
    { t: 0.2, kind: 'gunner', x: 0, y: 18, path: 'hold_and_shot' },
    { t: 0.4, kind: 'gunner', x: 3, y: 18, path: 'hold_and_shot' },
    ...column(2.0, 4, -1, 'dart', 'dive'),
    ...column(2.2, 4, 1, 'dart', 'dive'),
  ],
}

export const MID_ELITE_RAZOR: WavePattern = {
  id: 'mid_elite_razor',
  events: [
    { t: 0.0, kind: 'razor', x: 0, y: 18, path: 'hold_and_shot' },
    ...lineH(0.5, 6, -5, 5, 'drone', 'drift_down'),
    ...lineH(2.5, 5, -4, 4, 'drone', 'sine_x'),
  ],
}

export const MID_PRISM_BURST: WavePattern = {
  id: 'mid_prism_burst',
  events: [
    { t: 0.0, kind: 'prism', x: 0, y: 18, path: 'hold_and_shot' },
    ...column(0.8, 4, -3, 'dart', 'dive'),
    ...column(1.0, 4, 3, 'dart', 'dive'),
  ],
}

export const MID_CHAOS_MIX: WavePattern = {
  id: 'mid_chaos_mix',
  events: [
    ...lineH(0.0, 4, -4, 4, 'drone', 'drift_down'),
    { t: 0.8, kind: 'gunner', x: -2, y: 18, path: 'hold_and_shot' },
    { t: 0.8, kind: 'gunner', x: 2, y: 18, path: 'hold_and_shot' },
    { t: 1.6, kind: 'sidecar', x: 0, y: 18, path: 'drift_down' },
    ...column(2.4, 3, 0, 'dart', 'dive'),
  ],
}

export const LATE_RAZOR_PAIR: WavePattern = {
  id: 'late_razor_pair',
  events: [
    { t: 0.0, kind: 'razor', x: -2.5, y: 18, path: 'hold_and_shot' },
    { t: 1.5, kind: 'razor', x: 2.5, y: 18, path: 'hold_and_shot' },
    ...lineH(0.8, 5, -4, 4, 'drone', 'drift_down'),
  ],
}

export const LATE_PRISM_GRID: WavePattern = {
  id: 'late_prism_grid',
  events: [
    { t: 0.0, kind: 'prism', x: 0, y: 18, path: 'hold_and_shot' },
    ...lineH(0.5, 8, -5.5, 5.5, 'drone', 'drift_down'),
    ...lineH(2.0, 6, -4, 4, 'drone', 'sine_x'),
  ],
}

export const LATE_GAUNTLET: WavePattern = {
  id: 'late_gauntlet',
  events: [
    ...sweepLr(0.0, 5, 'drone', 'drift_down'),
    { t: 0.8, kind: 'gunner', x: -3, y: 18, path: 'hold_and_shot' },
    { t: 0.8, kind: 'gunner', x: 3, y: 18, path: 'hold_and_shot' },
    ...sweepRl(2.0, 5, 'drone', 'sine_x'),
    { t: 3.0, kind: 'sidecar', x: -2, y: 18, path: 'drift_down' },
    { t: 3.2, kind: 'sidecar', x: 2, y: 18, path: 'drift_down' },
  ],
}

export const LATE_MIXED_ELITES: WavePattern = {
  id: 'late_mixed_elites',
  events: [
    { t: 0.0, kind: 'razor', x: -2, y: 18, path: 'hold_and_shot' },
    { t: 0.5, kind: 'prism', x: 2, y: 18, path: 'hold_and_shot' },
    { t: 1.5, kind: 'sidecar', x: -3.5, y: 18, path: 'drift_down' },
    { t: 1.7, kind: 'sidecar', x: 3.5, y: 18, path: 'drift_down' },
    ...lineH(2.5, 5, -4, 4, 'drone', 'drift_down'),
  ],
}

export const SET_COLOSSUS: WavePattern = {
  id: 'set_colossus',
  events: [
    { t: 0.0, kind: 'colossus', x: 0, y: 18, path: 'hold_and_shot' },
    ...column(1.2, 3, -3, 'dart', 'dive'),
    ...column(1.5, 3, 3, 'dart', 'dive'),
    ...column(3.5, 3, 0, 'dart', 'dive'),
  ],
}

export const SET_COLOSSUS_PRISM: WavePattern = {
  id: 'set_colossus_prism',
  events: [
    { t: 0.0, kind: 'colossus', x: 0, y: 18, path: 'hold_and_shot' },
    { t: 1.0, kind: 'prism', x: -3.5, y: 18, path: 'hold_and_shot' },
    ...column(2.0, 3, 3, 'dart', 'dive'),
    ...lineH(3.0, 4, -3, 3, 'drone', 'drift_down'),
  ],
}

const INTRO = [INTRO_01, INTRO_02, INTRO_03]

const EASY_POOL: WavePattern[] = [
  EASY_LINE_DRONES,
  EASY_DART_DIVE,
  EASY_VEE,
  EASY_SWEEP_LR,
  EASY_SIDES,
  EASY_GUNNER_PAIR,
  EASY_SINE_WALL,
  EASY_MIXED_LITE,
]

const MID_POOL: WavePattern[] = [
  MID_GUN_WALL,
  MID_SIDECAR_LANE,
  MID_DOUBLE_SWEEP,
  MID_HOLD_SQUAD,
  MID_ELITE_RAZOR,
  MID_PRISM_BURST,
  MID_CHAOS_MIX,
]

const MID_ELITE_POOL: WavePattern[] = [MID_ELITE_RAZOR, MID_PRISM_BURST]

const LATE_POOL: WavePattern[] = [LATE_RAZOR_PAIR, LATE_PRISM_GRID, LATE_GAUNTLET, LATE_MIXED_ELITES]

const LATE_ELITE_POOL: WavePattern[] = [LATE_RAZOR_PAIR, LATE_MIXED_ELITES, LATE_PRISM_GRID]

const ALL_PATTERNS = [
  ...INTRO,
  ...EASY_POOL,
  ...MID_POOL,
  ...LATE_POOL,
  SET_COLOSSUS,
  SET_COLOSSUS_PRISM,
]

export const ALL_PATTERN_IDS = ALL_PATTERNS.map((p) => p.id)

export function patternById(id: string): WavePattern | null {
  return ALL_PATTERNS.find((p) => p.id === id) ?? null
}

export function isSetPieceWave(waveIndex: number): boolean {
  return waveIndex >= 10 && waveIndex % 10 === 0
}

function pickCycled(pool: WavePattern[], seed: number): WavePattern {
  const idx = ((seed % pool.length) + pool.length) % pool.length
  return pool[idx]!
}

/** Wave index is 1-based. Deterministic playlist (ADR 0002). */
export function patternForWave(waveIndex: number): WavePattern {
  if (isSetPieceWave(waveIndex)) {
    return (waveIndex / 10) % 2 === 1 ? SET_COLOSSUS : SET_COLOSSUS_PRISM
  }
  if (waveIndex <= 3) return INTRO[waveIndex - 1]!
  if (waveIndex <= 10) return pickCycled(EASY_POOL, waveIndex - 4)
  if (waveIndex <= 20) {
    if (waveIndex % 5 === 0) return pickCycled(MID_ELITE_POOL, waveIndex / 5)
    return pickCycled(MID_POOL, waveIndex - 11)
  }
  if (waveIndex % 5 === 0) return pickCycled(LATE_ELITE_POOL, waveIndex / 5)
  return pickCycled(LATE_POOL, waveIndex - 21)
}
