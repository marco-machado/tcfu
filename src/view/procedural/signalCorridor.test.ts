import { describe, expect, it } from 'vitest'
import { BAND } from '../../sim/constants'
import {
  makeSignalChevronMarks,
  makeSignalRailMarks,
  signalChevronGroupsPerSide,
  streamedSignalY,
} from './signalCorridorLayout'

describe('signal corridor layout', () => {
  it('distributes the rail budget symmetrically inside the movement band', () => {
    const marks = makeSignalRailMarks(18)
    expect(marks).toHaveLength(18)
    expect(marks.filter((mark) => mark.side === -1)).toHaveLength(9)
    expect(marks.filter((mark) => mark.side === 1)).toHaveLength(9)
    for (const mark of marks) {
      expect(mark.y0).toBeGreaterThan(BAND.minY)
      expect(mark.y0).toBeLessThan(BAND.maxY)
      expect(mark.lengthScale).toBeGreaterThanOrEqual(0.62)
      expect(mark.lengthScale).toBeLessThanOrEqual(0.96)
    }
  })

  it('keeps chevrons sparse while allowing quality budgets to increase detail', () => {
    expect(signalChevronGroupsPerSide(10)).toBe(2)
    expect(signalChevronGroupsPerSide(15)).toBe(3)
    expect(signalChevronGroupsPerSide(18)).toBe(4)
    expect(makeSignalChevronMarks(15)).toHaveLength(6)
  })

  it('streams marks within the band and freezes them for reduced motion', () => {
    const y0 = 7.25
    expect(streamedSignalY(y0, 12, true)).toBe(y0)
    const moved = streamedSignalY(y0, 12, false)
    expect(moved).not.toBe(y0)
    expect(moved).toBeGreaterThanOrEqual(BAND.minY)
    expect(moved).toBeLessThan(BAND.maxY)
  })
})
