export type DeepSpacePoint = {
  x: number
  y: number
  z: number
  scale: number
  phase: number
}

export type DeepSpaceFieldContract = {
  xSpan: number
  yMin: number
  ySpan: number
  zMin: number
  zSpan: number
  scaleMin: number
  scaleMax: number
}

/** One shared stream with depth-dependent response; ratios are perceptual, not physical distance. */
export const DEEP_SPACE_STREAM_RATIOS = {
  farStars: 0.025,
  midStars: 0.075,
  distantSilhouettes: 0.055,
  depthVeils: 0.018,
  nearStreaks: 0.92,
} as const

/** Deterministic pseudo-random value in [0, 1) from an integer seed. */
export function deepSpaceHash01(seed: number): number {
  let value = seed | 0
  value = Math.imul(value ^ (value >>> 16), 0x45d9f3b)
  value = Math.imul(value ^ (value >>> 16), 0x45d9f3b)
  value ^= value >>> 16
  return (value >>> 0) / 4294967296
}

export function makeDeepSpaceField(
  count: number,
  seed: number,
  contract: DeepSpaceFieldContract,
): DeepSpacePoint[] {
  return Array.from({ length: count }, (_, index) => {
    const sample = (channel: number) => deepSpaceHash01(seed + index * 101 + channel * 7919)
    return {
      x: (sample(1) - 0.5) * contract.xSpan,
      y: contract.yMin + sample(2) * contract.ySpan,
      z: contract.zMin - sample(3) * contract.zSpan,
      scale: contract.scaleMin + sample(4) * (contract.scaleMax - contract.scaleMin),
      phase: sample(5),
    }
  })
}

export function advanceWrappedY(y: number, distance: number, minY: number, span: number): number {
  const shifted = y - distance - minY
  return minY + ((shifted % span) + span) % span
}
