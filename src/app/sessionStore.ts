import { create } from 'zustand'
import type { ScreenId, ShipId } from '../sim/types'
import { loadLastShip, saveLastShip } from '../persist/lastShip'
import { loadMeta, type MetaState } from '../persist/meta'
import { loadSettings, type Settings } from '../persist/settings'
import { loadHighScores, type HighScoreEntry } from '../persist/highScores'
import { resetWorld } from '../sim/world'

export type LastRunSummary = {
  score: number
  wave: number
  kills: number
  timeSec: number
  shipId: ShipId
  scrapEarned: number
}

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
  setSettings: (settings: Settings) => void
  refreshMeta: () => void
  refreshHighScores: () => void
}

export const useSessionStore = create<SessionState>((set) => ({
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
    const shipId = useSessionStore.getState().selectedShip
    resetWorld(shipId)
    set({ screen: 'run', lastRun: null })
  },
  endRun: (summary) => set({ screen: 'results', lastRun: summary }),
  setSettings: (settings) => set({ settings }),
  refreshMeta: () => set({ meta: loadMeta() }),
  refreshHighScores: () => set({ highScores: loadHighScores() }),
}))
