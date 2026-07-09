import { readJson, writeJson } from './storage'
import {
  clampMetaRank,
  tryBuyMetaRank,
  type MetaBranch,
  type MetaPurchaseState,
} from '../sim/metaModifiers'

export type MetaState = MetaPurchaseState

export type { MetaBranch }

const KEY = 'tcfu.meta'

const defaults: MetaState = {
  scrap: 0,
  ranks: { arsenal: 0, hull: 0, salvage: 0, thrust: 0 },
}

function sanitize(meta: MetaState): MetaState {
  return {
    scrap: Math.max(0, Math.floor(Number(meta.scrap) || 0)),
    ranks: {
      arsenal: clampMetaRank(meta.ranks?.arsenal ?? 0),
      hull: clampMetaRank(meta.ranks?.hull ?? 0),
      salvage: clampMetaRank(meta.ranks?.salvage ?? 0),
      thrust: clampMetaRank(meta.ranks?.thrust ?? 0),
    },
  }
}

export function loadMeta(): MetaState {
  const data = readJson(KEY, defaults)
  return sanitize({
    scrap: data.scrap ?? 0,
    ranks: { ...defaults.ranks, ...data.ranks },
  })
}

export function saveMeta(meta: MetaState): void {
  writeJson(KEY, sanitize(meta))
}

export function resetMeta(): void {
  saveMeta(defaults)
}

export function buyMetaRank(meta: MetaState, branch: MetaBranch): MetaState | null {
  const result = tryBuyMetaRank(meta, branch)
  if (!result.ok) return null
  return result.meta
}
