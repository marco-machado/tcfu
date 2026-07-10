import type { Quality } from '../../persist/settings'
import type { EnemyKind, PowerupType, ShipId } from '../../sim/types'
import type { MaterialTokenId } from './materialTokens'

export type DetailLevel = 'low' | 'medium' | 'high'

export type SceneryLayerId = 'far' | 'mid' | 'near'

export type ProjectileRole = 'playerBullet' | 'enemyBullet'

export type KitPartId =
  | 'hull'
  | 'wings'
  | 'thruster'
  | 'canopy'
  | 'finDetail'
  | 'shieldRing'
  | 'gunPods'
  | 'edgeGlow'

export type EnemyPartId = 'body' | 'accent' | 'optionalDetail'

export type KitRecipeMeta = {
  id: ShipId
  hullToken: MaterialTokenId
  thrusterToken: MaterialTokenId
  accentToken: MaterialTokenId
  /** Always present at every detail level. */
  baseParts: readonly KitPartId[]
  /** Medium and High. */
  optionalParts: readonly KitPartId[]
  /** High only (cheap extras). */
  highOnlyParts: readonly KitPartId[]
}

export type EnemyRecipeMeta = {
  kind: EnemyKind
  enemyClass: 'fodder' | 'grunt' | 'elite' | 'set_piece'
  hullToken: MaterialTokenId
  accentToken: MaterialTokenId
  baseParts: readonly EnemyPartId[]
  optionalParts: readonly EnemyPartId[]
}

export const SHIP_KIT_VISUAL_IDS: readonly ShipId[] = [
  'vanguard',
  'striker',
  'aegis',
  'phantom',
]

export const ENEMY_KIND_VISUAL_IDS: readonly EnemyKind[] = [
  'drone',
  'dart',
  'gunner',
  'sidecar',
  'razor',
  'prism',
  'colossus',
]

export const PROJECTILE_ROLES: readonly ProjectileRole[] = ['playerBullet', 'enemyBullet']

export const POWERUP_VISUAL_TYPES: readonly PowerupType[] = [
  'shield',
  'bomb_stock',
  'repair',
  'rate_up',
  'spread_up',
  'score_mult',
]

export const KIT_RECIPES: Record<ShipId, KitRecipeMeta> = {
  vanguard: {
    id: 'vanguard',
    hullToken: 'hullCold',
    thrusterToken: 'thrusterPlayer',
    accentToken: 'accentPlayer',
    baseParts: ['hull', 'wings', 'thruster'],
    optionalParts: ['canopy', 'finDetail'],
    highOnlyParts: ['edgeGlow'],
  },
  striker: {
    id: 'striker',
    hullToken: 'hullCold',
    thrusterToken: 'thrusterHot',
    accentToken: 'thrusterHot',
    baseParts: ['hull', 'wings', 'thruster', 'gunPods'],
    optionalParts: ['canopy', 'finDetail'],
    highOnlyParts: ['edgeGlow'],
  },
  aegis: {
    id: 'aegis',
    hullToken: 'hullArmored',
    thrusterToken: 'thrusterPlayer',
    accentToken: 'accentPlayer',
    baseParts: ['hull', 'wings', 'thruster', 'shieldRing'],
    optionalParts: ['canopy', 'finDetail'],
    highOnlyParts: ['edgeGlow'],
  },
  phantom: {
    id: 'phantom',
    hullToken: 'hullStealth',
    thrusterToken: 'thrusterPlayer',
    accentToken: 'accentPlayer',
    baseParts: ['hull', 'wings', 'thruster'],
    optionalParts: ['canopy'],
    highOnlyParts: ['edgeGlow'],
  },
}

export const ENEMY_RECIPES: Record<EnemyKind, EnemyRecipeMeta> = {
  drone: {
    kind: 'drone',
    enemyClass: 'fodder',
    hullToken: 'hullHostile',
    accentToken: 'accentEnemy',
    baseParts: ['body', 'accent'],
    optionalParts: ['optionalDetail'],
  },
  dart: {
    kind: 'dart',
    enemyClass: 'fodder',
    hullToken: 'hullHostile',
    accentToken: 'accentEnemy',
    baseParts: ['body', 'accent'],
    optionalParts: [],
  },
  gunner: {
    kind: 'gunner',
    enemyClass: 'grunt',
    hullToken: 'hullHostile',
    accentToken: 'accentEnemy',
    baseParts: ['body', 'accent'],
    optionalParts: ['optionalDetail'],
  },
  sidecar: {
    kind: 'sidecar',
    enemyClass: 'grunt',
    hullToken: 'hullHostile',
    accentToken: 'accentEnemy',
    baseParts: ['body', 'accent'],
    optionalParts: ['optionalDetail'],
  },
  razor: {
    kind: 'razor',
    enemyClass: 'elite',
    hullToken: 'hullHostile',
    accentToken: 'accentEnemy',
    baseParts: ['body', 'accent'],
    optionalParts: ['optionalDetail'],
  },
  prism: {
    kind: 'prism',
    enemyClass: 'elite',
    hullToken: 'hullHostile',
    accentToken: 'accentCrystal',
    baseParts: ['body', 'accent'],
    optionalParts: ['optionalDetail'],
  },
  colossus: {
    kind: 'colossus',
    enemyClass: 'set_piece',
    hullToken: 'hullHostile',
    accentToken: 'accentEnemy',
    baseParts: ['body', 'accent'],
    optionalParts: ['optionalDetail'],
  },
}

export const PROJECTILE_TOKENS: Record<ProjectileRole, MaterialTokenId> = {
  playerBullet: 'projectilePlayer',
  enemyBullet: 'projectileEnemy',
}

export const POWERUP_TOKENS: Record<PowerupType, MaterialTokenId> = {
  shield: 'pickupCyan',
  bomb_stock: 'pickupGold',
  repair: 'pickupGreen',
  rate_up: 'pickupGold',
  spread_up: 'pickupViolet',
  score_mult: 'pickupGold',
}

export function detailFromQuality(quality: Quality): DetailLevel {
  return quality
}

export function kitRecipe(id: ShipId): KitRecipeMeta {
  return KIT_RECIPES[id]
}

export function enemyRecipe(kind: EnemyKind): EnemyRecipeMeta {
  return ENEMY_RECIPES[kind]
}

export function partsForKit(id: ShipId, detail: DetailLevel): KitPartId[] {
  const meta = KIT_RECIPES[id]
  const parts: KitPartId[] = [...meta.baseParts]
  if (detail === 'low') return parts
  parts.push(...meta.optionalParts)
  if (detail === 'high') parts.push(...meta.highOnlyParts)
  return parts
}

export function partsForEnemy(kind: EnemyKind, detail: DetailLevel): EnemyPartId[] {
  const meta = ENEMY_RECIPES[kind]
  const parts: EnemyPartId[] = [...meta.baseParts]
  if (detail !== 'low') parts.push(...meta.optionalParts)
  return parts
}

export function sceneryLayers(detail: DetailLevel): SceneryLayerId[] {
  if (detail === 'low') return ['far', 'near']
  return ['far', 'mid', 'near']
}

export function hasKitPart(id: ShipId, detail: DetailLevel, part: KitPartId): boolean {
  return partsForKit(id, detail).includes(part)
}

export function hasEnemyPart(kind: EnemyKind, detail: DetailLevel, part: EnemyPartId): boolean {
  return partsForEnemy(kind, detail).includes(part)
}
