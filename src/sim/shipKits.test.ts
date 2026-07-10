import { describe, expect, it } from 'vitest'
import {
  isShipUnlocked,
  kitsNewlyUnlocked,
  resolveSelectedShip,
  shipKit,
  SHIP_KIT_IDS,
} from './shipKits'

describe('ship kits', () => {
  it('exposes catalog stats for each kit', () => {
    expect(shipKit('vanguard')).toMatchObject({
      unlockScore: 0,
      hitboxR: 0.35,
      maxHp: 3,
      startBombs: 2,
      moveMult: 1,
    })
    expect(shipKit('striker')).toMatchObject({
      unlockScore: 25_000,
      hitboxR: 0.32,
      maxHp: 2,
      damageMult: 1.1,
    })
    expect(shipKit('aegis')).toMatchObject({
      unlockScore: 75_000,
      hitboxR: 0.38,
      startBombs: 3,
      startShieldEachLife: true,
    })
    expect(shipKit('phantom')).toMatchObject({
      unlockScore: 150_000,
      hitboxR: 0.28,
      hitIFrames: 1.25,
      moveMult: 1.25,
    })
  })

  it('unlocks by career best thresholds', () => {
    expect(isShipUnlocked('vanguard', 0)).toBe(true)
    expect(isShipUnlocked('striker', 24_999)).toBe(false)
    expect(isShipUnlocked('striker', 25_000)).toBe(true)
    expect(isShipUnlocked('aegis', 74_999)).toBe(false)
    expect(isShipUnlocked('aegis', 75_000)).toBe(true)
    expect(isShipUnlocked('phantom', 149_999)).toBe(false)
    expect(isShipUnlocked('phantom', 150_000)).toBe(true)
  })

  it('lists kits newly unlocked when career best rises', () => {
    expect(kitsNewlyUnlocked(0, 24_999).map((k) => k.id)).toEqual([])
    expect(kitsNewlyUnlocked(0, 25_000).map((k) => k.id)).toEqual(['striker'])
    expect(kitsNewlyUnlocked(25_000, 150_000).map((k) => k.id)).toEqual(['aegis', 'phantom'])
    expect(kitsNewlyUnlocked(80_000, 80_000).map((k) => k.id)).toEqual([])
  })

  it('falls back to Vanguard when selected kit is locked', () => {
    expect(resolveSelectedShip('phantom', 0)).toBe('vanguard')
    expect(resolveSelectedShip('striker', 30_000)).toBe('striker')
  })

  it('covers all four kit ids', () => {
    expect(SHIP_KIT_IDS).toHaveLength(4)
  })
})
