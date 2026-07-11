import { create } from 'zustand'
import { saveCareerBest } from '../persist/careerBest'
import { saveMeta } from '../persist/meta'
import { enableStorageSandbox } from '../persist/storage'

const DEBUG_SCRAP = 9_999
const DEBUG_CAREER_BEST = 999_999

const active =
  import.meta.env.DEV &&
  typeof window !== 'undefined' &&
  new URLSearchParams(window.location.search).has('debug')

// Sandbox must engage at module evaluation, before the session store reads
// persistence during its own module init.
if (active) {
  enableStorageSandbox()
  saveMeta({ scrap: DEBUG_SCRAP, ranks: { arsenal: 0, hull: 0, salvage: 0, thrust: 0 } })
  saveCareerBest(DEBUG_CAREER_BEST)
}

export function isDebugMode(): boolean {
  return active
}

type DebugUiState = {
  panelOpen: boolean
  timeScale: number
  overlay: boolean
  hidden: boolean
  setPanelOpen: (open: boolean) => void
  setTimeScale: (scale: number) => void
  setOverlay: (on: boolean) => void
  setHidden: (hidden: boolean) => void
}

export const useDebugStore = create<DebugUiState>((set) => ({
  panelOpen: true,
  timeScale: 1,
  overlay: false,
  hidden: false,
  setPanelOpen: (panelOpen) => set({ panelOpen }),
  setTimeScale: (timeScale) => set({ timeScale }),
  setOverlay: (overlay) => set({ overlay }),
  setHidden: (hidden) => set({ hidden }),
}))

export function debugTimeScale(): number {
  return active ? useDebugStore.getState().timeScale : 1
}
