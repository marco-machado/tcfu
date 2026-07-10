import type { BufferGeometry } from 'three'
import type { EnemyKind } from '../../sim/types'
import { bakeParts, type GeoPart } from './bakeGeometry'
import type { DetailLevel } from './registry'
import { partsForEnemy } from './registry'
import { createTokenMaterial } from './createMaterial'
import { ENEMY_RECIPES } from './registry'
import type { MeshStandardMaterial } from 'three'

/** Class-template + id accents as bakeable parts (unit playfield scale). */
function bodyParts(kind: EnemyKind): GeoPart[] {
  switch (kind) {
    case 'drone':
      return [
        { kind: 'box', sx: 0.55, sy: 0.45, sz: 0.28 },
        { kind: 'sphere', r: 0.18, y: 0.05, z: 0.12, wSeg: 8, hSeg: 6 },
      ]
    case 'dart':
      return [
        { kind: 'box', sx: 0.28, sy: 0.95, sz: 0.2 },
        { kind: 'box', sx: 0.55, sy: 0.18, sz: 0.12, y: -0.15 },
      ]
    case 'gunner':
      return [
        { kind: 'box', sx: 0.85, sy: 0.65, sz: 0.38 },
        { kind: 'box', sx: 0.35, sy: 0.35, sz: 0.35, y: 0.35 },
        { kind: 'cylinder', rTop: 0.12, rBottom: 0.12, height: 0.4, y: 0.55, radialSeg: 6 },
      ]
    case 'sidecar':
      return [
        { kind: 'box', sx: 0.7, sy: 0.55, sz: 0.32 },
        { kind: 'box', sx: 0.28, sy: 0.4, sz: 0.28, x: -0.55, y: -0.05 },
        { kind: 'box', sx: 0.28, sy: 0.4, sz: 0.28, x: 0.55, y: -0.05 },
      ]
    case 'razor':
      return [
        { kind: 'box', sx: 1.15, sy: 0.75, sz: 0.42 },
        { kind: 'box', sx: 1.6, sy: 0.22, sz: 0.18, y: 0.1 },
        { kind: 'box', sx: 0.35, sy: 0.9, sz: 0.25, y: 0.15 },
        { kind: 'box', sx: 0.2, sy: 0.5, sz: 0.15, x: -0.7, y: -0.1 },
        { kind: 'box', sx: 0.2, sy: 0.5, sz: 0.15, x: 0.7, y: -0.1 },
      ]
    case 'prism':
      return [
        { kind: 'box', sx: 0.9, sy: 0.9, sz: 0.45, rotZ: Math.PI / 4 },
        { kind: 'box', sx: 0.55, sy: 0.55, sz: 0.55 },
        { kind: 'box', sx: 0.25, sy: 1.1, sz: 0.2 },
      ]
    case 'colossus':
      return [
        { kind: 'box', sx: 2.1, sy: 1.15, sz: 0.55 },
        { kind: 'box', sx: 2.6, sy: 0.35, sz: 0.35, y: 0.25 },
        { kind: 'box', sx: 0.55, sy: 0.7, sz: 0.45, x: -0.95, y: -0.15 },
        { kind: 'box', sx: 0.55, sy: 0.7, sz: 0.45, x: 0.95, y: -0.15 },
        { kind: 'box', sx: 0.7, sy: 0.5, sz: 0.4, y: 0.55 },
      ]
  }
}

function accentParts(kind: EnemyKind): GeoPart[] {
  switch (kind) {
    case 'drone':
      return [
        { kind: 'box', sx: 0.12, sy: 0.12, sz: 0.08, x: -0.28, z: 0.1 },
        { kind: 'box', sx: 0.12, sy: 0.12, sz: 0.08, x: 0.28, z: 0.1 },
      ]
    case 'dart':
      return [{ kind: 'box', sx: 0.12, sy: 0.35, sz: 0.1, y: 0.35, z: 0.05 }]
    case 'gunner':
      return [
        { kind: 'box', sx: 0.5, sy: 0.1, sz: 0.12, y: -0.2, z: 0.18 },
        { kind: 'box', sx: 0.15, sy: 0.2, sz: 0.15, y: 0.55, z: 0.15 },
      ]
    case 'sidecar':
      return [
        { kind: 'box', sx: 0.14, sy: 0.22, sz: 0.12, x: -0.55, z: 0.14 },
        { kind: 'box', sx: 0.14, sy: 0.22, sz: 0.12, x: 0.55, z: 0.14 },
      ]
    case 'razor':
      return [
        { kind: 'box', sx: 1.4, sy: 0.08, sz: 0.1, y: 0.28, z: 0.18 },
        { kind: 'box', sx: 0.18, sy: 0.4, sz: 0.12, x: -0.55, y: 0.35, z: 0.12 },
        { kind: 'box', sx: 0.18, sy: 0.4, sz: 0.12, x: 0.55, y: 0.35, z: 0.12 },
      ]
    case 'prism':
      return [
        { kind: 'box', sx: 0.2, sy: 0.2, sz: 0.55, z: 0.15 },
        { kind: 'box', sx: 0.15, sy: 0.7, sz: 0.12, x: -0.35, z: 0.1 },
        { kind: 'box', sx: 0.15, sy: 0.7, sz: 0.12, x: 0.35, z: 0.1 },
      ]
    case 'colossus':
      return [
        { kind: 'box', sx: 1.8, sy: 0.12, sz: 0.14, y: 0.45, z: 0.28 },
        { kind: 'box', sx: 0.35, sy: 0.35, sz: 0.2, x: -0.7, y: 0.15, z: 0.25 },
        { kind: 'box', sx: 0.35, sy: 0.35, sz: 0.2, x: 0.7, y: 0.15, z: 0.25 },
        { kind: 'box', sx: 0.4, sy: 0.25, sz: 0.2, y: 0.7, z: 0.2 },
      ]
  }
}

function optionalParts(kind: EnemyKind): GeoPart[] {
  switch (kind) {
    case 'drone':
      return [{ kind: 'box', sx: 0.08, sy: 0.3, sz: 0.08, y: -0.35 }]
    case 'gunner':
      return [
        { kind: 'box', sx: 0.2, sy: 0.15, sz: 0.2, x: -0.45, y: 0.1 },
        { kind: 'box', sx: 0.2, sy: 0.15, sz: 0.2, x: 0.45, y: 0.1 },
      ]
    case 'sidecar':
      return [{ kind: 'box', sx: 0.5, sy: 0.12, sz: 0.12, y: 0.25, z: 0.1 }]
    case 'razor':
      return [
        { kind: 'box', sx: 0.12, sy: 0.55, sz: 0.1, x: -0.9, y: 0.05 },
        { kind: 'box', sx: 0.12, sy: 0.55, sz: 0.1, x: 0.9, y: 0.05 },
      ]
    case 'prism':
      return [{ kind: 'sphere', r: 0.22, z: 0.2, wSeg: 6, hSeg: 5 }]
    case 'colossus':
      return [
        { kind: 'box', sx: 0.25, sy: 0.9, sz: 0.2, x: -1.2, y: -0.1 },
        { kind: 'box', sx: 0.25, sy: 0.9, sz: 0.2, x: 1.2, y: -0.1 },
        { kind: 'cylinder', rTop: 0.15, rBottom: 0.2, height: 0.35, y: -0.55, radialSeg: 6 },
      ]
    default:
      return []
  }
}

export function bakeEnemyGeometry(kind: EnemyKind, detail: DetailLevel): BufferGeometry {
  const active = partsForEnemy(kind, detail)
  const parts: GeoPart[] = []
  if (active.includes('body')) parts.push(...bodyParts(kind))
  if (active.includes('accent')) parts.push(...accentParts(kind))
  if (active.includes('optionalDetail')) parts.push(...optionalParts(kind))
  return bakeParts(parts)
}

export function createEnemyMaterial(kind: EnemyKind): MeshStandardMaterial {
  const recipe = ENEMY_RECIPES[kind]
  // Single material: hull base with accent emissive intensity for bloom readability.
  const mat = createTokenMaterial(recipe.hullToken)
  const accent = createTokenMaterial(recipe.accentToken)
  mat.emissive.copy(accent.emissive)
  mat.emissiveIntensity = Math.min(1.35, accent.emissiveIntensity * 0.85)
  accent.dispose()
  return mat
}
