import { scrapForRun, scrapFromScore, scrapFromWaves } from './constants'
import type { World } from './types'

export type RunSummary = {
  score: number
  wave: number
  kills: number
  timeSec: number
  shipId: World['player']['shipId']
  scrapEarned: number
  scrapFromScore: number
  scrapFromWaves: number
  wavesCompleted: number
  scrapEarnMult: number
}

export function buildRunSummary(world: World, scrapEarnMult = 1): RunSummary {
  const wavesCompleted = Math.max(0, world.session.wave - 1)
  const fromScore = scrapFromScore(world.session.score)
  const fromWaves = scrapFromWaves(wavesCompleted)
  return {
    score: Math.floor(world.session.score),
    wave: world.session.wave,
    kills: world.session.kills,
    timeSec: world.session.elapsed,
    shipId: world.player.shipId,
    scrapEarned: scrapForRun(world.session.score, wavesCompleted, scrapEarnMult),
    scrapFromScore: fromScore,
    scrapFromWaves: fromWaves,
    wavesCompleted,
    scrapEarnMult,
  }
}
