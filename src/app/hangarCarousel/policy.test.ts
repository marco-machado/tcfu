import { describe, expect, it } from 'vitest'
import { SHIP_KIT_IDS } from '../../sim/shipKits'
import { carouselModel, initialIndex, pageIndex } from './policy'

// Career bests pinned to catalog thresholds: 0 unlocks vanguard only,
// 25_000 adds striker, 150_000 unlocks everything.
const NOTHING_ELSE = 0
const STRIKER_OPEN = 25_000
const ALL_OPEN = 150_000

describe('hangar carousel policy', () => {
  it('derives the initial index from the persisted selected ship', () => {
    expect(initialIndex(SHIP_KIT_IDS, 'vanguard')).toBe(0)
    expect(initialIndex(SHIP_KIT_IDS, 'aegis')).toBe(2)
  })

  it('falls back to the first slot for an unknown selection', () => {
    expect(initialIndex([], 'vanguard')).toBe(0)
  })

  it('pages one slot at a time and clamps at both ends', () => {
    expect(pageIndex(0, 1, 4)).toBe(1)
    expect(pageIndex(2, -1, 4)).toBe(1)
    expect(pageIndex(0, -1, 4)).toBe(0)
    expect(pageIndex(3, 1, 4)).toBe(3)
  })

  it('centers the kit at the index and reports paging room', () => {
    const model = carouselModel(SHIP_KIT_IDS, 1, ALL_OPEN)
    expect(model.centeredId).toBe('striker')
    expect(model.canPageLeft).toBe(true)
    expect(model.canPageRight).toBe(true)
    expect(carouselModel(SHIP_KIT_IDS, 0, ALL_OPEN).canPageLeft).toBe(false)
    expect(carouselModel(SHIP_KIT_IDS, 3, ALL_OPEN).canPageRight).toBe(false)
  })

  it('marks an unlocked centered kit launchable and commits it as the selection', () => {
    const model = carouselModel(SHIP_KIT_IDS, 1, STRIKER_OPEN)
    expect(model.locked).toBe(false)
    expect(model.launchable).toBe(true)
    expect(model.commit).toBe('striker')
  })

  it('marks a locked centered kit unlaunchable and never commits it', () => {
    const model = carouselModel(SHIP_KIT_IDS, 2, STRIKER_OPEN)
    expect(model.locked).toBe(true)
    expect(model.launchable).toBe(false)
    expect(model.commit).toBeNull()
  })

  it('formats the pager position as zero-padded position over total', () => {
    expect(carouselModel(SHIP_KIT_IDS, 0, NOTHING_ELSE).positionLabel).toBe('01 / 04')
    expect(carouselModel(SHIP_KIT_IDS, 3, ALL_OPEN).positionLabel).toBe('04 / 04')
  })

  it('builds one pager dot per kit with current and locked states', () => {
    const dots = carouselModel(SHIP_KIT_IDS, 1, STRIKER_OPEN).dots
    expect(dots).toHaveLength(4)
    expect(dots.map((d) => d.current)).toEqual([false, true, false, false])
    expect(dots.map((d) => d.locked)).toEqual([false, false, true, true])
  })

  it('keeps every kit pageable regardless of lock state', () => {
    const locked = carouselModel(SHIP_KIT_IDS, 3, NOTHING_ELSE)
    expect(locked.centeredId).toBe('phantom')
    expect(locked.unlockScore).toBe(150_000)
  })
})
