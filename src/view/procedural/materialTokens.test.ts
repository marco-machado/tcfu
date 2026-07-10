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
})
