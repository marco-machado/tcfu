import { describe, expect, it } from 'vitest'
import {
  detailFromQuality,
  ENEMY_KIND_VISUAL_IDS,
  ENEMY_RECIPES,
  enemyRecipe,
  hasEnemyPart,
  hasKitPart,
  KIT_RECIPES,
  kitRecipe,
  partsForEnemy,
  partsForKit,
  POWERUP_TOKENS,
  POWERUP_VISUAL_TYPES,
  PROJECTILE_ROLES,
  PROJECTILE_TOKENS,
  sceneryExtras,
  sceneryLayers,
  SHIP_SILHOUETTE_PROFILES,
  SHIP_KIT_VISUAL_IDS,
  ENEMY_SILHOUETTE_PROFILES,
} from './registry'
import { MATERIAL_TOKENS } from './materialTokens'

function parseHex(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace('#', '')
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  }
}

describe('visual registry', () => {
  it('resolves a recipe for every ship kit id', () => {
    expect(SHIP_KIT_VISUAL_IDS).toHaveLength(4)
    for (const id of SHIP_KIT_VISUAL_IDS) {
      const recipe = kitRecipe(id)
      expect(recipe.id).toBe(id)
      expect(recipe.baseParts.length).toBeGreaterThan(0)
      expect(MATERIAL_TOKENS[recipe.hullToken]).toBeDefined()
      expect(MATERIAL_TOKENS[recipe.thrusterToken]).toBeDefined()
    }
  })

  it('keeps every kit thruster token in the cool player signal family', () => {
    for (const id of SHIP_KIT_VISUAL_IDS) {
      const thruster = MATERIAL_TOKENS[kitRecipe(id).thrusterToken]
      const { r, g, b } = parseHex(thruster.emissive)
      expect(b >= r && b + g > r * 1.6, `${id} thruster ${thruster.emissive}`).toBe(true)
    }
  })

  it('resolves a recipe for every enemy kind', () => {
    expect(ENEMY_KIND_VISUAL_IDS).toHaveLength(7)
    for (const kind of ENEMY_KIND_VISUAL_IDS) {
      const recipe = enemyRecipe(kind)
      expect(recipe.kind).toBe(kind)
      expect(recipe.baseParts).toContain('body')
      expect(MATERIAL_TOKENS[recipe.hullToken]).toBeDefined()
      expect(MATERIAL_TOKENS[recipe.accentToken]).toBeDefined()
    }
  })

  it('resolves projectile and powerup token roles', () => {
    for (const role of PROJECTILE_ROLES) {
      expect(MATERIAL_TOKENS[PROJECTILE_TOKENS[role]]).toBeDefined()
    }
    for (const type of POWERUP_VISUAL_TYPES) {
      expect(MATERIAL_TOKENS[POWERUP_TOKENS[type]]).toBeDefined()
    }
  })

  it('detail ladder omits optional kit parts on Low and adds high-only on High', () => {
    const low = partsForKit('vanguard', 'low')
    const medium = partsForKit('vanguard', 'medium')
    const high = partsForKit('vanguard', 'high')

    expect(low).toEqual([...KIT_RECIPES.vanguard.baseParts])
    expect(medium.length).toBeGreaterThan(low.length)
    expect(high.length).toBeGreaterThanOrEqual(medium.length)
    expect(hasKitPart('vanguard', 'low', 'finDetail')).toBe(false)
    expect(hasKitPart('vanguard', 'medium', 'finDetail')).toBe(true)
    expect(hasKitPart('vanguard', 'high', 'edgeGlow')).toBe(true)
    expect(hasKitPart('vanguard', 'medium', 'edgeGlow')).toBe(false)
  })

  it('detail ladder strips optional enemy detail on Low', () => {
    expect(hasEnemyPart('gunner', 'low', 'optionalDetail')).toBe(false)
    expect(hasEnemyPart('gunner', 'medium', 'optionalDetail')).toBe(true)
    expect(hasEnemyPart('dart', 'low', 'panel')).toBe(false)
    expect(hasEnemyPart('dart', 'medium', 'panel')).toBe(true)
    expect(partsForEnemy('dart', 'medium')).toEqual([
      ...ENEMY_RECIPES.dart.baseParts,
      ...ENEMY_RECIPES.dart.optionalParts,
    ])
  })

  it('scenery drops mid layer on Low', () => {
    expect(sceneryLayers('low')).toEqual(['far', 'near'])
    expect(sceneryLayers('medium')).toEqual(['far', 'mid', 'near'])
    expect(sceneryLayers('high')).toEqual(['far', 'mid', 'near'])
  })

  it('deep-space scenery extras densify with quality; Low omits distant silhouettes', () => {
    const low = sceneryExtras('low')
    const medium = sceneryExtras('medium')
    const high = sceneryExtras('high')

    expect(low.distantSilhouettes).toBe(false)
    expect(medium.distantSilhouettes).toBe(true)
    expect(high.distantSilhouettes).toBe(true)
    expect(medium.starCount).toBeGreaterThan(low.starCount)
    expect(high.starCount).toBeGreaterThanOrEqual(medium.starCount)
    expect(medium.streakCount).toBeGreaterThan(low.streakCount)
    expect(high.streakCount).toBeGreaterThanOrEqual(medium.streakCount)
  })

  it('thruster plume is optional (Medium+) not base', () => {
    expect(hasKitPart('vanguard', 'low', 'thrusterPlume')).toBe(false)
    expect(hasKitPart('vanguard', 'medium', 'thrusterPlume')).toBe(true)
    expect(hasKitPart('striker', 'low', 'thrusterPlume')).toBe(false)
    expect(hasKitPart('striker', 'medium', 'thrusterPlume')).toBe(true)
    expect(hasKitPart('aegis', 'medium', 'thrusterPlume')).toBe(true)
    expect(hasKitPart('phantom', 'medium', 'thrusterPlume')).toBe(true)
  })

  it('maps quality settings onto detail levels', () => {
    expect(detailFromQuality('low')).toBe('low')
    expect(detailFromQuality('medium')).toBe('medium')
    expect(detailFromQuality('high')).toBe('high')
  })

  it('keeps enemy class tags consistent with threat hierarchy', () => {
    expect(enemyRecipe('drone').enemyClass).toBe('fodder')
    expect(enemyRecipe('gunner').enemyClass).toBe('grunt')
    expect(enemyRecipe('razor').enemyClass).toBe('elite')
    expect(enemyRecipe('colossus').enemyClass).toBe('set_piece')
  })

  it('keeps signature signals and hull identity available without post or optional detail', () => {
    for (const id of SHIP_KIT_VISUAL_IDS) {
      expect(partsForKit(id, 'low'), id).toContain('signal')
      expect(partsForKit(id, 'medium'), id).toContain('hullPanels')
    }
  })

  it('defines distinct silhouette contracts for every ship and enemy family', () => {
    expect(Object.keys(SHIP_SILHOUETTE_PROFILES)).toEqual([...SHIP_KIT_VISUAL_IDS])
    expect(Object.keys(ENEMY_SILHOUETTE_PROFILES)).toEqual([...ENEMY_KIND_VISUAL_IDS])

    expect(SHIP_SILHOUETTE_PROFILES.aegis.widthToLength).toBeGreaterThan(
      SHIP_SILHOUETTE_PROFILES.phantom.widthToLength,
    )
    expect(ENEMY_SILHOUETTE_PROFILES.gunner.family).not.toBe(
      ENEMY_SILHOUETTE_PROFILES.sidecar.family,
    )
    expect(ENEMY_SILHOUETTE_PROFILES.razor.widthToLength).toBeGreaterThan(
      ENEMY_SILHOUETTE_PROFILES.prism.widthToLength,
    )
  })
})
