import { BAND } from '../../sim/constants'
import { advanceWrappedY } from './deepSpaceField'

export type SignalSide = -1 | 1

export type SignalRailMark = {
  side: SignalSide
  y0: number
  phase: number
  lengthScale: number
  bracket: boolean
}

export type SignalChevronMark = {
  side: SignalSide
  y0: number
  phase: number
}

export const SIGNAL_STREAM_RATIO = 0.34

const bandHeight = BAND.maxY - BAND.minY

/** Symmetric, sparse edge marks. Perspective supplies the apparent size falloff. */
export function makeSignalRailMarks(count: number): SignalRailMark[] {
  const normalizedCount = Math.max(2, Math.floor(count))
  const perSide = Math.ceil(normalizedCount / 2)

  return Array.from({ length: normalizedCount }, (_, index) => {
    const side: SignalSide = index % 2 === 0 ? -1 : 1
    const row = Math.floor(index / 2)
    const phase = ((index * 7) % 11) / 11
    return {
      side,
      y0: BAND.minY + ((row + 0.5) / perSide) * bandHeight,
      phase,
      lengthScale: 0.62 + phase * 0.34,
      bracket: row % 3 === 0,
    }
  })
}

/** Convert the old density budget into a deliberately restrained number per side. */
export function signalChevronGroupsPerSide(budget: number): number {
  return Math.max(1, Math.round(budget / 5))
}

export function makeSignalChevronMarks(budget: number): SignalChevronMark[] {
  const perSide = signalChevronGroupsPerSide(budget)
  return Array.from({ length: perSide * 2 }, (_, index) => {
    const side: SignalSide = index % 2 === 0 ? -1 : 1
    const row = Math.floor(index / 2)
    return {
      side,
      y0: BAND.minY + ((row + 1) / (perSide + 1)) * bandHeight,
      phase: ((index * 5) % 9) / 9,
    }
  })
}

export function streamedSignalY(
  y0: number,
  streamDistance: number,
  reducedMotion: boolean,
): number {
  const distance = reducedMotion ? 0 : streamDistance * SIGNAL_STREAM_RATIO
  return advanceWrappedY(y0, distance, BAND.minY, bandHeight)
}
