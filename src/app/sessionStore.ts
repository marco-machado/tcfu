import { create } from 'zustand'
import type { ScreenId, ShipId } from '../sim/types'
import { loadCareerBest, recordCareerBest } from '../persist/careerBest'
import { loadLastShip, saveLastShip } from '../persist/lastShip'
import { buyMetaRank, loadMeta, saveMeta, type MetaBranch, type MetaState } from '../persist/meta'
import { loadSettings, type Settings } from '../persist/settings'
import { loadHighScores, tryAddHighScore, type HighScoreEntry } from '../persist/highScores'
import { metaModifiersFromRanks, scrapEarnMultFromRanks } from '../sim/metaModifiers'
import { kitsNewlyUnlocked, resolveSelectedShip } from '../sim/shipKits'
import { buildRunSummary, type RunSummary } from '../sim/summary'
import { getWorld, resetWorld } from '../sim/world'

export type LastRunSummary = RunSummary

function initialSelectedShip(): ShipId {
  const best = loadCareerBest()
  const last = loadLastShip()
  const resolved = resolveSelectedShip(last, best)
  if (resolved !== last) saveLastShip(resolved)
  return resolved
}

type SessionState = {
  screen: ScreenId
  selectedShip: ShipId
  careerBest: number
  settings: Settings
  meta: MetaState
  highScores: HighScoreEntry[]
  lastRun: LastRunSummary | null
  setScreen: (screen: ScreenId) => void
  selectShip: (shipId: ShipId) => void
  startRun: () => void
  endRun: (summary: LastRunSummary) => void
  finishRunFromWorld: () => void
  purchaseMetaRank: (branch: MetaBranch) => boolean
  setSettings: (settings: Settings) => void
  refreshMeta: () => void
  refreshHighScores: () => void
  refreshCareerBest: () => void
}

export const useSessionStore = create<SessionState>((set, get) => ({
  screen: 'title',
  selectedShip: initialSelectedShip(),
  careerBest: loadCareerBest(),
  settings: loadSettings(),
  meta: loadMeta(),
  highScores: loadHighScores(),
  lastRun: null,
  setScreen: (screen) => set({ screen }),
  selectShip: (shipId) => {
    const resolved = resolveSelectedShip(shipId, get().careerBest)
    saveLastShip(resolved)
    set({ selectedShip: resolved })
  },
  startRun: () => {
    const shipId = resolveSelectedShip(get().selectedShip, get().careerBest)
    if (shipId !== get().selectedShip) {
      saveLastShip(shipId)
      set({ selectedShip: shipId })
    }
    const mods = metaModifiersFromRanks(get().meta.ranks)
    resetWorld(shipId, mods)
    set({ screen: 'run', lastRun: null })
  },
  endRun: (summary) => set({ screen: 'results', lastRun: summary }),
  finishRunFromWorld: () => {
    if (get().screen !== 'run') return
    const world = getWorld()
    if (!world.session.runOver || world.session.endHold > 0) return

    const meta = loadMeta()
    const runScore = Math.floor(world.session.score)
    const { previous, next } = recordCareerBest(runScore)
    const unlocked = kitsNewlyUnlocked(previous, next).map((k) => k.name)
    const summary = buildRunSummary(world, scrapEarnMultFromRanks(meta.ranks), {
      careerBest: next,
      unlockedKitNames: unlocked,
    })
    meta.scrap += summary.scrapEarned
    saveMeta(meta)

    const highScores = tryAddHighScore({
      score: summary.score,
      shipId: summary.shipId,
      wave: summary.wave,
      timeSec: summary.timeSec,
      timestamp: Date.now(),
    })

    set({
      screen: 'results',
      lastRun: summary,
      meta,
      highScores,
      careerBest: next,
    })
  },
  purchaseMetaRank: (branch) => {
    const next = buyMetaRank(get().meta, branch)
    if (!next) return false
    saveMeta(next)
    set({ meta: next })
    return true
  },
  setSettings: (settings) => set({ settings }),
  refreshMeta: () => set({ meta: loadMeta() }),
  refreshHighScores: () => set({ highScores: loadHighScores() }),
  refreshCareerBest: () => set({ careerBest: loadCareerBest() }),
}))
