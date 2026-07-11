import { shipKit } from './shipKits'
import type { ShipId } from './types'

export type MetaBranch = 'arsenal' | 'hull' | 'salvage' | 'thrust'

export type MetaRanks = {
  arsenal: number
  hull: number
  salvage: number
  thrust: number
}

/** Immutable combat snapshot applied at Run start (not Scrap earn mult). */
export type MetaModifiers = {
  weaponDamageMult: number
  wCellEarnMult: number
  hitIFramesBonus: number
  startRunShield: boolean
  bombMaxBonus: number
  bombStartBonus: number
  dropChanceMult: number
  pitySeconds: number
  moveSpeedMult: number
  bandMaxYBonus: number
}

export const DEFAULT_META_MODIFIERS: MetaModifiers = {
  weaponDamageMult: 1,
  wCellEarnMult: 1,
  hitIFramesBonus: 0,
  startRunShield: false,
  bombMaxBonus: 0,
  bombStartBonus: 0,
  dropChanceMult: 1,
  pitySeconds: 45,
  moveSpeedMult: 1,
  bandMaxYBonus: 0,
}

export const META_RANK_COSTS = [30, 75, 150] as const

export const META_BRANCHES: MetaBranch[] = ['arsenal', 'hull', 'salvage', 'thrust']

export function clampMetaRank(rank: number): number {
  if (!Number.isFinite(rank)) return 0
  return Math.max(0, Math.min(3, Math.floor(rank)))
}

export function nextMetaRankCost(currentRank: number): number | null {
  const rank = clampMetaRank(currentRank)
  if (rank >= 3) return null
  return META_RANK_COSTS[rank]!
}

export function metaModifiersFromRanks(ranks: MetaRanks): MetaModifiers {
  const arsenal = clampMetaRank(ranks.arsenal)
  const hull = clampMetaRank(ranks.hull)
  const salvage = clampMetaRank(ranks.salvage)
  const thrust = clampMetaRank(ranks.thrust)

  const weaponDamageMult = arsenal === 0 ? 1 : arsenal === 1 ? 1.05 : arsenal === 2 ? 1.1 : 1.15
  const moveSpeedMult = thrust === 0 ? 1 : thrust === 1 ? 1.05 : thrust === 2 ? 1.1 : 1.15
  const dropChanceMult = salvage === 0 ? 1 : salvage === 1 ? 1.15 : 1.3

  return {
    weaponDamageMult,
    wCellEarnMult: arsenal >= 3 ? 1.1 : 1,
    hitIFramesBonus: hull >= 1 ? 0.15 : 0,
    startRunShield: hull >= 2,
    bombMaxBonus: hull >= 3 ? 1 : 0,
    bombStartBonus: hull >= 3 ? 1 : 0,
    dropChanceMult,
    pitySeconds: salvage >= 2 ? 35 : 45,
    moveSpeedMult,
    bandMaxYBonus: thrust >= 3 ? 0.5 : 0,
  }
}

/** Results / HUD Scrap mult from current ranks (not frozen on the Run world). */
export function scrapEarnMultFromRanks(ranks: MetaRanks): number {
  return clampMetaRank(ranks.salvage) >= 3 ? 1.15 : 1
}

export type MetaPurchaseState = {
  scrap: number
  ranks: MetaRanks
}

export type MetaPurchaseResult =
  | { ok: true; meta: MetaPurchaseState }
  | { ok: false; reason: 'max_rank' | 'insufficient_scrap' }

export function tryBuyMetaRank(meta: MetaPurchaseState, branch: MetaBranch): MetaPurchaseResult {
  const current = clampMetaRank(meta.ranks[branch])
  if (current >= 3) return { ok: false, reason: 'max_rank' }
  const cost = META_RANK_COSTS[current]!
  if (meta.scrap < cost) return { ok: false, reason: 'insufficient_scrap' }

  return {
    ok: true,
    meta: {
      scrap: meta.scrap - cost,
      ranks: {
        ...meta.ranks,
        [branch]: current + 1,
      },
    },
  }
}

export const META_BRANCH_LABELS: Record<MetaBranch, string> = {
  arsenal: 'Arsenal',
  hull: 'Hull',
  salvage: 'Salvage',
  thrust: 'Thrusters',
}

export const META_RANK_EFFECTS: Record<MetaBranch, [string, string, string]> = {
  arsenal: [
    'Weapon damage +5%',
    'Weapon damage +10% total',
    'Weapon damage +15% total; W-cell earn +10%',
  ],
  hull: [
    'Hit i-frames +0.15 s',
    'Start of Run: shield on life 1',
    'Max bombs +1; starting bombs +1',
  ],
  salvage: [
    'Powerup drop chance ×1.15',
    'Drop chance ×1.30; pity 35 s',
    'Scrap earn +15%',
  ],
  thrust: [
    'Move speed +5%',
    'Move speed +10% total',
    'Move speed +15%; forward band +0.5',
  ],
}

export function shipMoveMult(shipId: ShipId): number {
  return shipKit(shipId).moveMult
}

export function baseHitIFrames(shipId: ShipId): number {
  return shipKit(shipId).hitIFrames
}
