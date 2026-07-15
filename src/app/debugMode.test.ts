import { afterEach, describe, expect, it } from 'vitest'
import { debugTimeScale, seedSandboxedSave, useDebugStore } from './debugMode'
import { loadCareerBest } from '../persist/careerBest'
import { loadMeta } from '../persist/meta'
import { disableStorageSandbox } from '../persist/storage'
import { META_RANK_COSTS, tryBuyMetaRank, type MetaBranch } from '../sim/metaModifiers'
import { SHIP_KIT_IDS, isShipUnlocked } from '../sim/shipKits'

afterEach(() => {
  disableStorageSandbox()
  useDebugStore.getState().setTimeScale(1)
})

describe('sandboxed save seeding', () => {
  it('unlocks every ship kit', () => {
    seedSandboxedSave()
    const best = loadCareerBest()
    for (const shipId of SHIP_KIT_IDS) {
      expect(isShipUnlocked(shipId, best)).toBe(true)
    }
  })

  it('funds the entire meta-upgrade tree', () => {
    seedSandboxedSave()
    let meta = loadMeta()
    const branches: MetaBranch[] = ['arsenal', 'hull', 'salvage', 'thrust']
    for (const branch of branches) {
      for (let rank = 0; rank < META_RANK_COSTS.length; rank++) {
        const result = tryBuyMetaRank(meta, branch)
        expect(result.ok).toBe(true)
        if (result.ok) meta = result.meta
      }
    }
    expect(meta.scrap).toBeGreaterThanOrEqual(0)
  })
})

describe('visual harness timing', () => {
  it('allows DEV test hooks to freeze simulation without the debug panel query', () => {
    useDebugStore.getState().setTimeScale(0)
    expect(debugTimeScale()).toBe(0)
  })
})
