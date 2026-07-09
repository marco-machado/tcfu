import { scrapForRun } from './constants'
import type { World } from './types'

export type RunSummary = {
  score: number
  wave: number
  kills: number
  timeSec: number
  shipId: World['player']['shipId']
  scrapEarned: number
}

export function buildRunSummary(world: World): RunSummary {
  const wavesCompleted = Math.max(0, world.session.wave - 1)
  return {
    score: Math.floor(world.session.score),
    wave: world.session.wave,
    kills: world.session.kills,
    timeSec: world.session.elapsed,
    shipId: world.player.shipId,
    scrapEarned: scrapForRun(world.session.score, wavesCompleted),
  }
}
