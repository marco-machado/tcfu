import { describe, expect, it } from 'vitest'
import {
  advanceWrappedY,
  DEEP_SPACE_STREAM_RATIOS,
  makeDeepSpaceField,
} from './deepSpaceField'

const contract = {
  xSpan: 40,
  yMin: -8,
  ySpan: 48,
  zMin: -4,
  zSpan: 2,
  scaleMin: 0.1,
  scaleMax: 0.3,
}

describe('deep space field', () => {
  it('reproduces the same field for a fixed seed', () => {
    expect(makeDeepSpaceField(12, 1337, contract)).toEqual(makeDeepSpaceField(12, 1337, contract))
    expect(makeDeepSpaceField(12, 1337, contract)).not.toEqual(
      makeDeepSpaceField(12, 1338, contract),
    )
  })

  it('keeps generated points inside their declared perceptual bands', () => {
    for (const point of makeDeepSpaceField(100, 42, contract)) {
      expect(point.x).toBeGreaterThanOrEqual(-20)
      expect(point.x).toBeLessThan(20)
      expect(point.y).toBeGreaterThanOrEqual(-8)
      expect(point.y).toBeLessThan(40)
      expect(point.z).toBeLessThanOrEqual(-4)
      expect(point.z).toBeGreaterThan(-6)
      expect(point.scale).toBeGreaterThanOrEqual(0.1)
      expect(point.scale).toBeLessThan(0.3)
    }
  })

  it('wraps stream motion without drift and preserves depth ordering', () => {
    expect(advanceWrappedY(-7, 3, -8, 48)).toBe(38)
    expect(advanceWrappedY(39, -3, -8, 48)).toBe(-6)
    expect(DEEP_SPACE_STREAM_RATIOS.farStars).toBeLessThan(
      DEEP_SPACE_STREAM_RATIOS.midStars,
    )
    expect(DEEP_SPACE_STREAM_RATIOS.midStars).toBeLessThan(
      DEEP_SPACE_STREAM_RATIOS.nearStreaks,
    )
    expect(DEEP_SPACE_STREAM_RATIOS.distantSilhouettes).toBeLessThan(0.1)
  })
})
