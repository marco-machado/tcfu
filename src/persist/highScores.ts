import { readJson, writeJson } from './storage'
import type { ShipId } from '../sim/types'

export type HighScoreEntry = {
  score: number
  shipId: ShipId
  wave: number
  timeSec: number
  timestamp: number
}

const KEY = 'tcfu.highScores'
const MAX = 10

export function loadHighScores(): HighScoreEntry[] {
  return readJson<HighScoreEntry[]>(KEY, [])
}

export function tryAddHighScore(entry: HighScoreEntry): HighScoreEntry[] {
  const list = [...loadHighScores(), entry]
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX)
  writeJson(KEY, list)
  return list
}

export function resetHighScores(): void {
  writeJson(KEY, [])
}
