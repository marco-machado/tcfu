import { afterEach, describe, expect, it } from 'vitest'
import { disableStorageSandbox, enableStorageSandbox, readJson, writeJson } from './storage'
import { loadMeta, saveMeta } from './meta'
import { loadCareerBest, saveCareerBest } from './careerBest'

afterEach(() => {
  disableStorageSandbox()
})

describe('storage sandbox', () => {
  it('reads back sandboxed writes without touching localStorage', () => {
    enableStorageSandbox()
    writeJson('tcfu.test', { value: 42 })
    expect(readJson('tcfu.test', { value: 0 })).toEqual({ value: 42 })
  })

  it('returns the fallback for keys never written in the sandbox', () => {
    enableStorageSandbox()
    expect(readJson('tcfu.missing', 'fallback')).toBe('fallback')
  })

  it('drops sandboxed data when the sandbox is disabled', () => {
    enableStorageSandbox()
    writeJson('tcfu.test', { value: 42 })
    disableStorageSandbox()
    expect(readJson('tcfu.test', { value: 0 })).toEqual({ value: 0 })
  })

  it('persists meta and career best through the sandbox', () => {
    enableStorageSandbox()
    saveMeta({ scrap: 9999, ranks: { arsenal: 0, hull: 0, salvage: 0, thrust: 0 } })
    saveCareerBest(999999)
    expect(loadMeta().scrap).toBe(9999)
    expect(loadCareerBest()).toBe(999999)
  })
})
