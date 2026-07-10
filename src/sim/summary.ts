import { scrapForRun, scrapFromScore, scrapFromWaves } from './constants'
import { shipKit } from './shipKits'
import type { World } from './types'

export type RunSummary = {
  score: number
  wave: number
  kills: number
  timeSec: number
  shipId: World['player']['shipId']
  shipName: string
  scrapEarned: number
  scrapFromScore: number
  scrapFromWaves: number
  wavesCompleted: number
  scrapEarnMult: number
  careerBest: number
  unlockedKitNames: string[]
}

export function buildRunSummary(
  world: World,
  scrapEarnMult = 1,
  career: { careerBest: number; unlockedKitNames?: string[] } = { careerBest: 0 },
): RunSummary {
  const wavesCompleted = Math.max(0, world.session.wave - 1)
  const fromScore = scrapFromScore(world.session.score)
  const fromWaves = scrapFromWaves(wavesCompleted)
  const shipId = world.player.shipId
  return {
    score: Math.floor(world.session.score),
    wave: world.session.wave,
    kills: world.session.kills,
    timeSec: world.session.elapsed,
    shipId,
    shipName: shipKit(shipId).name,
    scrapEarned: scrapForRun(world.session.score, wavesCompleted, scrapEarnMult),
    scrapFromScore: fromScore,
    scrapFromWaves: fromWaves,
    wavesCompleted,
    scrapEarnMult,
    careerBest: career.careerBest,
    unlockedKitNames: career.unlockedKitNames ?? [],
  }
}
