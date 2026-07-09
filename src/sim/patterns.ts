import type { EnemyKind, PowerupType } from './types'

export type PathId = 'drift_down' | 'sine_x' | 'dive' | 'hold_and_shot'

export type SpawnEvent = {
  t: number
  kind: EnemyKind
  x: number
  y: number
  path: PathId
}

/** Authored forced pickup at pattern time; type is chosen among `types`. */
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

export const EASY_GUNNER_PAIR: WavePattern = {
  id: 'easy_gunner_pair',
  events: [
    { t: 0.0, kind: 'gunner', x: -3, y: 18, path: 'hold_and_shot' },
    { t: 0.0, kind: 'gunner', x: 3, y: 18, path: 'hold_and_shot' },
    ...lineH(1.2, 5, -4, 4, 'drone', 'drift_down'),
  ],
}

const INTRO = [INTRO_01, INTRO_02, INTRO_03]
const EASY_POOL = [EASY_LINE_DRONES, EASY_DART_DIVE, EASY_VEE, EASY_GUNNER_PAIR]

/** Wave index is 1-based. */
export function patternForWave(waveIndex: number): WavePattern {
  if (waveIndex <= 3) return INTRO[waveIndex - 1]!
  const easyIndex = (waveIndex - 4) % EASY_POOL.length
  return EASY_POOL[easyIndex]!
}
