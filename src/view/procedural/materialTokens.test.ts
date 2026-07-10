import { describe, expect, it } from 'vitest'
import {
  allMaterialTokenIds,
  EMISSIVE_INTENSITY_MAX,
  MATERIAL_TOKENS,
  materialToken,
} from './materialTokens'

describe('material tokens', () => {
  it('exposes every token id with color and emissive fields', () => {
    const ids = allMaterialTokenIds()
    expect(ids.length).toBeGreaterThan(8)
    for (const id of ids) {
      const token = materialToken(id)
      expect(token.color).toMatch(/^#/)
      expect(token.emissive).toMatch(/^#/)
      expect(token.metalness).toBeGreaterThanOrEqual(0)
      expect(token.metalness).toBeLessThanOrEqual(1)
      expect(token.roughness).toBeGreaterThanOrEqual(0)
      expect(token.roughness).toBeLessThanOrEqual(1)
    }
  })

  it('keeps emissive intensity within bloom-safe ceiling', () => {
    for (const token of Object.values(MATERIAL_TOKENS)) {
      expect(token.emissiveIntensity).toBeGreaterThan(0)
      expect(token.emissiveIntensity).toBeLessThanOrEqual(EMISSIVE_INTENSITY_MAX)
    }
  })

  it('keeps player projectiles cooler than enemy projectiles in hue family', () => {
    const player = materialToken('projectilePlayer')
    const enemy = materialToken('projectileEnemy')
    expect(player.emissive.toLowerCase()).not.toBe(enemy.emissive.toLowerCase())
    expect(player.color.toLowerCase()).not.toBe(enemy.color.toLowerCase())
  })

  it('keeps player signal tokens cool and threat tokens warm', () => {
    for (const id of ['projectilePlayer', 'thrusterPlayer', 'accentPlayer'] as const) {
      const t = materialToken(id)
      expect(isCoolFamily(t.emissive), id).toBe(true)
    }
    for (const id of ['projectileEnemy', 'accentEnemy', 'hullHostile'] as const) {
      const t = materialToken(id)
      expect(isWarmFamily(t.emissive), id).toBe(true)
    }
  })
})

/** Cool = cyan/blue-dominant emissive (player signal). */
function isCoolFamily(hex: string): boolean {
  const { r, g, b } = parseHex(hex)
  return b >= r && b + g > r * 1.6
}

/** Warm = red/amber-dominant emissive (threat). Not a magenta requirement. */
function isWarmFamily(hex: string): boolean {
  const { r, g, b } = parseHex(hex)
  return r > b && r >= g * 0.85
}

function parseHex(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace('#', '')
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  }
}
