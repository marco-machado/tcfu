import { describe, expect, it } from 'vitest'
import { PREVIEW_THRUST, thrustIntensity } from './thrustIntensity'

describe('thrustIntensity', () => {
  it('idles below full burn when velocity is zero', () => {
    expect(thrustIntensity(0, 0)).toBeLessThan(0.55)
    expect(thrustIntensity(0, 0)).toBeGreaterThan(0.4)
  })

  it('rises with forward stream thrust', () => {
    const idle = thrustIntensity(0, 0)
    const forward = thrustIntensity(0, 8)
    expect(forward).toBeGreaterThan(idle)
    expect(forward).toBeGreaterThan(1)
  })

  it('responds to lateral strafe without matching full forward burn', () => {
    const lateral = thrustIntensity(8, 0)
    const forward = thrustIntensity(0, 8)
    expect(lateral).toBeGreaterThan(thrustIntensity(0, 0))
    expect(lateral).toBeLessThan(forward)
  })

  it('caps intensity so bloom stays controlled', () => {
    expect(thrustIntensity(40, 40)).toBeLessThanOrEqual(1.45)
  })

  it('keeps hangar preview thrust above idle', () => {
    expect(PREVIEW_THRUST).toBeGreaterThan(thrustIntensity(0, 0))
  })
})
