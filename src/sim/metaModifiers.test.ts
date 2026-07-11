import { describe, expect, it } from 'vitest'
import {
  DEFAULT_META_MODIFIERS,
  META_RANK_COSTS,
  metaModifiersFromRanks,
  nextMetaRankCost,
  scrapEarnMultFromRanks,
  tryBuyMetaRank,
  type MetaPurchaseState,
} from './metaModifiers'

function blankMeta(scrap = 0): MetaPurchaseState {
  return {
    scrap,
    ranks: { arsenal: 0, hull: 0, salvage: 0, thrust: 0 },
  }
}

describe('meta purchase', () => {
  it('buys rank 1 for 30 Scrap and leaves other branches at 0', () => {
    const result = tryBuyMetaRank(blankMeta(30), 'arsenal')
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.meta.scrap).toBe(0)
    expect(result.meta.ranks.arsenal).toBe(1)
    expect(result.meta.ranks.hull).toBe(0)
  })

  it('rejects insufficient Scrap without mutating ranks', () => {
    const result = tryBuyMetaRank(blankMeta(29), 'hull')
    expect(result).toEqual({ ok: false, reason: 'insufficient_scrap' })
  })

  it('buys rank 2 and 3 at catalog costs after prior ranks', () => {
    let meta = blankMeta(30 + 75 + 150)
    const r1 = tryBuyMetaRank(meta, 'salvage')
    expect(r1.ok).toBe(true)
    if (!r1.ok) return
    meta = r1.meta
    expect(meta.scrap).toBe(75 + 150)

    const r2 = tryBuyMetaRank(meta, 'salvage')
    expect(r2.ok).toBe(true)
    if (!r2.ok) return
    meta = r2.meta
    expect(meta.ranks.salvage).toBe(2)
    expect(meta.scrap).toBe(150)

    const r3 = tryBuyMetaRank(meta, 'salvage')
    expect(r3.ok).toBe(true)
    if (!r3.ok) return
    expect(r3.meta.ranks.salvage).toBe(3)
    expect(r3.meta.scrap).toBe(0)
  })

  it('rejects buy at max rank', () => {
    const meta = blankMeta(999)
    meta.ranks.thrust = 3
    expect(tryBuyMetaRank(meta, 'thrust')).toEqual({ ok: false, reason: 'max_rank' })
  })

  it('exposes costs 30/75/150 for next rank', () => {
    expect(nextMetaRankCost(0)).toBe(META_RANK_COSTS[0])
    expect(nextMetaRankCost(1)).toBe(META_RANK_COSTS[1])
    expect(nextMetaRankCost(2)).toBe(META_RANK_COSTS[2])
    expect(nextMetaRankCost(3)).toBeNull()
  })
})

describe('metaModifiersFromRanks', () => {
  it('returns neutral modifiers at rank 0', () => {
    expect(metaModifiersFromRanks({ arsenal: 0, hull: 0, salvage: 0, thrust: 0 })).toEqual(
      DEFAULT_META_MODIFIERS,
    )
  })

  it('maps Arsenal ranks to damage and W-cell mults', () => {
    expect(metaModifiersFromRanks({ arsenal: 1, hull: 0, salvage: 0, thrust: 0 }).weaponDamageMult).toBe(
      1.05,
    )
    expect(metaModifiersFromRanks({ arsenal: 2, hull: 0, salvage: 0, thrust: 0 }).weaponDamageMult).toBe(
      1.1,
    )
    const a3 = metaModifiersFromRanks({ arsenal: 3, hull: 0, salvage: 0, thrust: 0 })
    expect(a3.weaponDamageMult).toBe(1.15)
    expect(a3.wCellEarnMult).toBe(1.1)
  })

  it('maps Hull ranks to i-frames, start shield, and bomb bonuses', () => {
    const h1 = metaModifiersFromRanks({ arsenal: 0, hull: 1, salvage: 0, thrust: 0 })
    expect(h1.hitIFramesBonus).toBe(0.15)
    expect(h1.startRunShield).toBe(false)

    const h2 = metaModifiersFromRanks({ arsenal: 0, hull: 2, salvage: 0, thrust: 0 })
    expect(h2.startRunShield).toBe(true)
    expect(h2.bombMaxBonus).toBe(0)

    const h3 = metaModifiersFromRanks({ arsenal: 0, hull: 3, salvage: 0, thrust: 0 })
    expect(h3.bombMaxBonus).toBe(1)
    expect(h3.bombStartBonus).toBe(1)
  })

  it('maps Salvage ranks to drop, pity, and Scrap mults', () => {
    expect(metaModifiersFromRanks({ arsenal: 0, hull: 0, salvage: 1, thrust: 0 }).dropChanceMult).toBe(
      1.15,
    )
    const s2 = metaModifiersFromRanks({ arsenal: 0, hull: 0, salvage: 2, thrust: 0 })
    expect(s2.dropChanceMult).toBe(1.3)
    expect(s2.pitySeconds).toBe(35)
    expect(scrapEarnMultFromRanks({ arsenal: 0, hull: 0, salvage: 2, thrust: 0 })).toBe(1)

    expect(scrapEarnMultFromRanks({ arsenal: 0, hull: 0, salvage: 3, thrust: 0 })).toBe(1.15)
  })

  it('maps Thrusters ranks to move mult and band bonus', () => {
    expect(metaModifiersFromRanks({ arsenal: 0, hull: 0, salvage: 0, thrust: 1 }).moveSpeedMult).toBe(
      1.05,
    )
    const t2 = metaModifiersFromRanks({ arsenal: 0, hull: 0, salvage: 0, thrust: 2 })
    expect(t2.moveSpeedMult).toBe(1.1)
    expect(t2.bandMaxYBonus).toBe(0)
    const t3 = metaModifiersFromRanks({ arsenal: 0, hull: 0, salvage: 0, thrust: 3 })
    expect(t3.moveSpeedMult).toBe(1.15)
    expect(t3.bandMaxYBonus).toBe(0.5)
  })
})
