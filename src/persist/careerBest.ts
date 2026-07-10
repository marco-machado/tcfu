import { readJson, writeJson } from './storage'

const KEY = 'tcfu.careerBest'

export type CareerBestState = {
  score: number
}

const defaults: CareerBestState = { score: 0 }

export function loadCareerBest(): number {
  const data = readJson(KEY, defaults)
  const score = Number(data.score)
  if (!Number.isFinite(score) || score < 0) return 0
  return Math.floor(score)
}

export function saveCareerBest(score: number): void {
  writeJson(KEY, { score: Math.max(0, Math.floor(score)) })
}

/** Returns the new career best (may be unchanged). */
export function recordCareerBest(runScore: number): { previous: number; next: number } {
  const previous = loadCareerBest()
  const next = Math.max(previous, Math.floor(runScore))
  if (next > previous) saveCareerBest(next)
  return { previous, next }
}
