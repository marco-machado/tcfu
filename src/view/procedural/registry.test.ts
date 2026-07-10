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
  sceneryLayers,
  SHIP_KIT_VISUAL_IDS,
} from './registry'
import { MATERIAL_TOKENS } from './materialTokens'

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
    expect(partsForEnemy('dart', 'medium')).toEqual([...ENEMY_RECIPES.dart.baseParts])
  })

  it('scenery drops mid layer on Low', () => {
    expect(sceneryLayers('low')).toEqual(['far', 'near'])
    expect(sceneryLayers('medium')).toEqual(['far', 'mid', 'near'])
    expect(sceneryLayers('high')).toEqual(['far', 'mid', 'near'])
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
})
