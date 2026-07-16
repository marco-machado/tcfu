// Pure decision core for the hangar deck carousel. Centering a kit is the
// selection gesture, so paging, launchability, the persisted-selection commit
// rule, and the pager readout all live here, testable without React or three.js.

import { isShipUnlocked, shipKit } from '../../sim/shipKits'
import type { ShipId } from '../../sim/types'

export type PagerDot = {
  id: ShipId
  current: boolean
  locked: boolean
}

export type CarouselModel = {
  index: number
  centeredId: ShipId
  locked: boolean
  launchable: boolean
  /** Selection to persist; null while a locked kit is centered so browsing never corrupts it. */
  commit: ShipId | null
  unlockScore: number
  canPageLeft: boolean
  canPageRight: boolean
  positionLabel: string
  dots: PagerDot[]
}

export function initialIndex(kitIds: readonly ShipId[], selected: ShipId): number {
  return Math.max(0, kitIds.indexOf(selected))
}

/** Clamped ends: with four kits a hard edge reads better than wrapping. */
export function pageIndex(current: number, delta: -1 | 1, count: number): number {
  return Math.max(0, Math.min(count - 1, current + delta))
}

function pad2(value: number): string {
  return String(value).padStart(2, '0')
}

export function carouselModel(
  kitIds: readonly ShipId[],
  index: number,
  careerBest: number,
): CarouselModel {
  const clamped = Math.max(0, Math.min(kitIds.length - 1, index))
  const centeredId = kitIds[clamped]!
  const locked = !isShipUnlocked(centeredId, careerBest)
  return {
    index: clamped,
    centeredId,
    locked,
    launchable: !locked,
    commit: locked ? null : centeredId,
    unlockScore: shipKit(centeredId).unlockScore,
    canPageLeft: clamped > 0,
    canPageRight: clamped < kitIds.length - 1,
    positionLabel: `${pad2(clamped + 1)} / ${pad2(kitIds.length)}`,
    dots: kitIds.map((id, i) => ({
      id,
      current: i === clamped,
      locked: !isShipUnlocked(id, careerBest),
    })),
  }
}
