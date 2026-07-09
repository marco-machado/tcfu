import { create } from 'zustand'
import type { ScreenId, ShipId } from '../sim/types'
import { loadLastShip, saveLastShip } from '../persist/lastShip'
import { loadMeta, saveMeta, type MetaState } from '../persist/meta'
import { loadSettings, type Settings } from '../persist/settings'
import { loadHighScores, tryAddHighScore, type HighScoreEntry } from '../persist/highScores'
import { buildRunSummary, type RunSummary } from '../sim/summary'
import { getWorld, resetWorld } from '../sim/world'

export type LastRunSummary = RunSummary

type SessionState = {
  screen: ScreenId
  selectedShip: ShipId
  settings: Settings
  meta: MetaState
  highScores: HighScoreEntry[]
  lastRun: LastRunSummary | null
  setScreen: (screen: ScreenId) => void
  selectShip: (shipId: ShipId) => void
  startRun: () => void
  endRun: (summary: LastRunSummary) => void
  finishRunFromWorld: () => void
  setSettings: (settings: Settings) => void
  refreshMeta: () => void
  refreshHighScores: () => void
}

export const useSessionStore = create<SessionState>((set, get) => ({
  screen: 'title',
  selectedShip: loadLastShip(),
  settings: loadSettings(),
  meta: loadMeta(),
  highScores: loadHighScores(),
  lastRun: null,
  setScreen: (screen) => set({ screen }),
  selectShip: (shipId) => {
    saveLastShip(shipId)
    set({ selectedShip: shipId })
  },
  startRun: () => {
    const shipId = get().selectedShip
    resetWorld(shipId)
    set({ screen: 'run', lastRun: null })
  },
  endRun: (summary) => set({ screen: 'results', lastRun: summary }),
  finishRunFromWorld: () => {
    if (get().screen !== 'run') return
    const world = getWorld()
    if (!world.session.runOver || world.session.endHold > 0) return

    const summary = buildRunSummary(world)
    const meta = loadMeta()
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
    })
  },
  setSettings: (settings) => set({ settings }),
  refreshMeta: () => set({ meta: loadMeta() }),
  refreshHighScores: () => set({ highScores: loadHighScores() }),
}))
