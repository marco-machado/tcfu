import { readJson, writeJson } from './storage'

export type MetaState = {
  scrap: number
  ranks: {
    arsenal: number
    hull: number
    salvage: number
    thrust: number
  }
}

const KEY = 'tcfu.meta'

const defaults: MetaState = {
  scrap: 0,
  ranks: { arsenal: 0, hull: 0, salvage: 0, thrust: 0 },
}

export function loadMeta(): MetaState {
  const data = readJson(KEY, defaults)
  return {
    scrap: data.scrap ?? 0,
    ranks: { ...defaults.ranks, ...data.ranks },
  }
}

export function saveMeta(meta: MetaState): void {
  writeJson(KEY, meta)
}

export function resetMeta(): void {
  saveMeta(defaults)
}
