import type { BufferGeometry, MeshStandardMaterial } from 'three'
import type { EnemyKind } from '../../sim/types'
import { bakeParts, type GeoPart } from './bakeGeometry'
import { createTokenMaterial } from './createMaterial'
import { getMicroNoiseTexture, getPanelLineTexture } from './ProceduralTextures'
import type { DetailLevel } from './registry'
import { ENEMY_RECIPES, partsForEnemy } from './registry'

const HALF = Math.PI / 2

/**
 * Hostile silhouette families (unit playfield scale). Each kind reads by
 * shape before color: pod swarm, arrowhead, turret barge, twin catamaran,
 * blade wing, crystal, and the Colossus battleship.
 */
function bodyParts(kind: EnemyKind): GeoPart[] {
  switch (kind) {
    case 'drone':
      // Insectoid pod: hex core, angled winglets, ventral stinger
      return [
        { kind: 'cylinder', rTop: 0.3, rBottom: 0.3, height: 0.24, rotX: HALF, radialSeg: 6 },
        { kind: 'box', sx: 0.34, sy: 0.14, sz: 0.1, x: -0.32, y: 0.06, rotZ: 0.5 },
        { kind: 'box', sx: 0.34, sy: 0.14, sz: 0.1, x: 0.32, y: 0.06, rotZ: -0.5 },
        { kind: 'cylinder', rTop: 0.02, rBottom: 0.07, height: 0.26, y: -0.34, radialSeg: 5 },
        { kind: 'box', sx: 0.18, sy: 0.12, sz: 0.3, y: 0.1 },
      ]
    case 'dart':
      // Arrowhead diver: needle fuselage, swept delta fins, nose spike (points -Y at player)
      return [
        { kind: 'box', sx: 0.2, sy: 0.8, sz: 0.16 },
        { kind: 'cylinder', rTop: 0.02, rBottom: 0.1, height: 0.34, y: -0.55, radialSeg: 6 },
        { kind: 'box', sx: 0.42, sy: 0.3, sz: 0.06, x: -0.24, y: 0.24, rotZ: 0.62 },
        { kind: 'box', sx: 0.42, sy: 0.3, sz: 0.06, x: 0.24, y: 0.24, rotZ: -0.62 },
        { kind: 'box', sx: 0.08, sy: 0.34, sz: 0.14, y: 0.42 },
      ]
    case 'gunner':
      // Turret barge: wide armored hull, twin barrels aimed down the stream
      return [
        { kind: 'box', sx: 0.85, sy: 0.55, sz: 0.34 },
        { kind: 'box', sx: 0.55, sy: 0.3, sz: 0.3, y: 0.38 },
        { kind: 'box', sx: 0.3, sy: 0.42, sz: 0.42, x: -0.5, y: -0.04 },
        { kind: 'box', sx: 0.3, sy: 0.42, sz: 0.42, x: 0.5, y: -0.04 },
        { kind: 'cylinder', rTop: 0.07, rBottom: 0.07, height: 0.5, x: -0.2, y: -0.46, radialSeg: 6 },
        { kind: 'cylinder', rTop: 0.07, rBottom: 0.07, height: 0.5, x: 0.2, y: -0.46, radialSeg: 6 },
        { kind: 'box', sx: 0.5, sy: 0.12, sz: 0.38, y: -0.28 },
      ]
    case 'sidecar':
      // Catamaran: twin pods bridged, lateral cannon stubs
      return [
        { kind: 'cylinder', rTop: 0.14, rBottom: 0.2, height: 0.7, x: -0.42, radialSeg: 7 },
        { kind: 'cylinder', rTop: 0.14, rBottom: 0.2, height: 0.7, x: 0.42, radialSeg: 7 },
        { kind: 'box', sx: 0.66, sy: 0.18, sz: 0.2, y: 0.1 },
        { kind: 'box', sx: 0.5, sy: 0.12, sz: 0.14, y: -0.14 },
        { kind: 'cylinder', rTop: 0.05, rBottom: 0.05, height: 0.3, x: -0.66, rotZ: HALF, radialSeg: 6 },
        { kind: 'cylinder', rTop: 0.05, rBottom: 0.05, height: 0.3, x: 0.66, rotZ: HALF, radialSeg: 6 },
      ]
    case 'razor':
      // Blade wing: swept scythe silhouette with wingtip claws
      return [
        { kind: 'box', sx: 0.3, sy: 0.95, sz: 0.3 },
        { kind: 'box', sx: 0.9, sy: 0.24, sz: 0.12, x: -0.55, y: 0.2, rotZ: 0.35 },
        { kind: 'box', sx: 0.9, sy: 0.24, sz: 0.12, x: 0.55, y: 0.2, rotZ: -0.35 },
        { kind: 'box', sx: 0.4, sy: 0.16, sz: 0.1, x: -1.0, y: -0.06, rotZ: 1.0 },
        { kind: 'box', sx: 0.4, sy: 0.16, sz: 0.1, x: 1.0, y: -0.06, rotZ: -1.0 },
        { kind: 'cylinder', rTop: 0.03, rBottom: 0.09, height: 0.4, y: -0.62, radialSeg: 6 },
        { kind: 'box', sx: 0.16, sy: 0.4, sz: 0.34, y: 0.28 },
      ]
    case 'prism':
      // Crystal cage: angular frame and shards around the emissive core
      return [
        { kind: 'box', sx: 0.1, sy: 1.1, sz: 0.1, x: -0.3, rotZ: 0.3 },
        { kind: 'box', sx: 0.1, sy: 1.1, sz: 0.1, x: 0.3, rotZ: -0.3 },
        { kind: 'box', sx: 0.45, sy: 0.12, sz: 0.14, y: 0.62 },
        { kind: 'box', sx: 0.45, sy: 0.12, sz: 0.14, y: -0.62 },
        { kind: 'octahedron', r: 0.18, x: -0.6, y: 0.25, sy: 1.4 },
        { kind: 'octahedron', r: 0.18, x: 0.6, y: 0.25, sy: 1.4 },
        { kind: 'octahedron', r: 0.13, y: -0.72, sy: 1.5 },
      ]
    case 'colossus':
      // Battleship: layered slabs, side turret pods, bridge, intake maw
      return [
        { kind: 'box', sx: 2.1, sy: 1.05, sz: 0.5 },
        { kind: 'box', sx: 2.55, sy: 0.4, sz: 0.36, y: 0.28 },
        { kind: 'box', sx: 1.5, sy: 0.3, sz: 0.55, y: -0.5 },
        { kind: 'cylinder', rTop: 0.28, rBottom: 0.34, height: 0.7, x: -1.05, y: -0.2, radialSeg: 8 },
        { kind: 'cylinder', rTop: 0.28, rBottom: 0.34, height: 0.7, x: 1.05, y: -0.2, radialSeg: 8 },
        { kind: 'box', sx: 0.65, sy: 0.5, sz: 0.5, y: 0.6 },
        { kind: 'box', sx: 0.35, sy: 0.3, sz: 0.35, y: 0.92 },
        { kind: 'box', sx: 0.5, sy: 0.35, sz: 0.3, x: -1.55, y: 0.2 },
        { kind: 'box', sx: 0.5, sy: 0.35, sz: 0.3, x: 1.55, y: 0.2 },
      ]
  }
}

/** Emissive accent geometry (separate instanced mesh; blooms and telegraphs). */
function accentParts(kind: EnemyKind): GeoPart[] {
  switch (kind) {
    case 'drone':
      return [
        { kind: 'sphere', r: 0.09, y: -0.1, z: 0.16, wSeg: 8, hSeg: 6 },
        { kind: 'box', sx: 0.1, sy: 0.05, sz: 0.05, x: -0.4, y: 0.14, rotZ: 0.5 },
        { kind: 'box', sx: 0.1, sy: 0.05, sz: 0.05, x: 0.4, y: 0.14, rotZ: -0.5 },
      ]
    case 'dart':
      return [
        { kind: 'box', sx: 0.05, sy: 0.55, sz: 0.05, x: -0.11, z: 0.09 },
        { kind: 'box', sx: 0.05, sy: 0.55, sz: 0.05, x: 0.11, z: 0.09 },
        { kind: 'sphere', r: 0.06, y: 0.44, z: 0.08, wSeg: 6, hSeg: 5 },
      ]
    case 'gunner':
      return [
        { kind: 'sphere', r: 0.08, x: -0.2, y: -0.72, wSeg: 6, hSeg: 5 },
        { kind: 'sphere', r: 0.08, x: 0.2, y: -0.72, wSeg: 6, hSeg: 5 },
        { kind: 'box', sx: 0.4, sy: 0.07, sz: 0.06, y: 0.4, z: 0.17 },
      ]
    case 'sidecar':
      return [
        { kind: 'sphere', r: 0.07, x: -0.82, wSeg: 6, hSeg: 5 },
        { kind: 'sphere', r: 0.07, x: 0.82, wSeg: 6, hSeg: 5 },
        { kind: 'box', sx: 0.1, sy: 0.1, sz: 0.06, z: 0.14 },
        { kind: 'cylinder', rTop: 0.05, rBottom: 0.09, height: 0.14, x: -0.42, y: -0.4, radialSeg: 6 },
        { kind: 'cylinder', rTop: 0.05, rBottom: 0.09, height: 0.14, x: 0.42, y: -0.4, radialSeg: 6 },
      ]
    case 'razor':
      return [
        { kind: 'sphere', r: 0.11, y: -0.2, z: 0.14, wSeg: 8, hSeg: 6 },
        { kind: 'box', sx: 0.8, sy: 0.05, sz: 0.05, x: -0.5, y: 0.3, z: 0.1, rotZ: 0.35 },
        { kind: 'box', sx: 0.8, sy: 0.05, sz: 0.05, x: 0.5, y: 0.3, z: 0.1, rotZ: -0.35 },
      ]
    case 'prism':
      return [
        { kind: 'octahedron', r: 0.34, sy: 1.5 },
        { kind: 'sphere', r: 0.05, x: -0.6, y: 0.25, wSeg: 5, hSeg: 4 },
        { kind: 'sphere', r: 0.05, x: 0.6, y: 0.25, wSeg: 5, hSeg: 4 },
      ]
    case 'colossus':
      return [
        { kind: 'box', sx: 1.7, sy: 0.09, sz: 0.08, y: 0.32, z: 0.22 },
        { kind: 'cylinder', rTop: 0.16, rBottom: 0.2, height: 0.16, x: -1.05, y: -0.6, radialSeg: 8 },
        { kind: 'cylinder', rTop: 0.16, rBottom: 0.2, height: 0.16, x: 1.05, y: -0.6, radialSeg: 8 },
        // Reactor maw: the glowing weak-point read under the prow
        { kind: 'octahedron', r: 0.24, y: -0.52, sx: 1.5, sy: 0.8 },
        { kind: 'box', sx: 0.5, sy: 0.12, sz: 0.1, y: -0.68, z: 0.24 },
        { kind: 'box', sx: 0.22, sy: 0.1, sz: 0.08, y: 0.92, z: 0.2 },
        { kind: 'sphere', r: 0.09, x: -1.55, y: 0.02, wSeg: 6, hSeg: 5 },
        { kind: 'sphere', r: 0.09, x: 1.55, y: 0.02, wSeg: 6, hSeg: 5 },
      ]
  }
}

/** Dark armor facets remain legible when the main hull flashes white on damage. */
function panelParts(kind: EnemyKind): GeoPart[] {
  switch (kind) {
    case 'drone':
      return [{ kind: 'box', sx: 0.3, sy: 0.1, sz: 0.045, y: 0.08, z: 0.18 }]
    case 'dart':
      return [{ kind: 'box', sx: 0.12, sy: 0.46, sz: 0.04, y: 0.08, z: 0.105 }]
    case 'gunner':
      return [
        { kind: 'box', sx: 0.28, sy: 0.26, sz: 0.04, x: -0.25, y: 0.1, z: 0.2 },
        { kind: 'box', sx: 0.28, sy: 0.26, sz: 0.04, x: 0.25, y: 0.1, z: 0.2 },
      ]
    case 'sidecar':
      return [
        { kind: 'box', sx: 0.16, sy: 0.4, sz: 0.04, x: -0.42, z: 0.16 },
        { kind: 'box', sx: 0.16, sy: 0.4, sz: 0.04, x: 0.42, z: 0.16 },
      ]
    case 'razor':
      return [
        { kind: 'box', sx: 0.58, sy: 0.09, sz: 0.04, x: -0.48, y: 0.22, z: 0.11, rotZ: 0.35 },
        { kind: 'box', sx: 0.58, sy: 0.09, sz: 0.04, x: 0.48, y: 0.22, z: 0.11, rotZ: -0.35 },
      ]
    case 'prism':
      return [
        { kind: 'box', sx: 0.32, sy: 0.07, sz: 0.04, y: 0.62, z: 0.1 },
        { kind: 'box', sx: 0.32, sy: 0.07, sz: 0.04, y: -0.62, z: 0.1 },
      ]
    case 'colossus':
      return [
        { kind: 'box', sx: 0.72, sy: 0.38, sz: 0.05, x: -0.55, y: 0.05, z: 0.28 },
        { kind: 'box', sx: 0.72, sy: 0.38, sz: 0.05, x: 0.55, y: 0.05, z: 0.28 },
        { kind: 'box', sx: 0.48, sy: 0.24, sz: 0.05, y: 0.55, z: 0.31 },
      ]
  }
}

/** Extra greeble at Medium/High. */
function optionalParts(kind: EnemyKind): GeoPart[] {
  switch (kind) {
    case 'drone':
      return [
        { kind: 'box', sx: 0.08, sy: 0.2, sz: 0.08, y: 0.3 },
        { kind: 'cylinder', rTop: 0.04, rBottom: 0.04, height: 0.16, x: -0.16, y: 0.26, radialSeg: 5 },
        { kind: 'cylinder', rTop: 0.04, rBottom: 0.04, height: 0.16, x: 0.16, y: 0.26, radialSeg: 5 },
      ]
    case 'gunner':
      return [
        { kind: 'box', sx: 0.2, sy: 0.14, sz: 0.2, x: -0.45, y: 0.24 },
        { kind: 'box', sx: 0.2, sy: 0.14, sz: 0.2, x: 0.45, y: 0.24 },
        { kind: 'box', sx: 0.7, sy: 0.06, sz: 0.06, y: 0.12, z: 0.19 },
      ]
    case 'sidecar':
      return [
        { kind: 'box', sx: 0.1, sy: 0.28, sz: 0.1, x: -0.42, y: 0.42 },
        { kind: 'box', sx: 0.1, sy: 0.28, sz: 0.1, x: 0.42, y: 0.42 },
      ]
    case 'razor':
      return [
        { kind: 'box', sx: 0.1, sy: 0.5, sz: 0.08, x: -0.16, y: 0.5, rotZ: 0.15 },
        { kind: 'box', sx: 0.1, sy: 0.5, sz: 0.08, x: 0.16, y: 0.5, rotZ: -0.15 },
      ]
    case 'prism':
      return [
        { kind: 'torus', r: 0.62, tube: 0.03, rotX: 0.4, radialSeg: 5, tubularSeg: 20 },
      ]
    case 'colossus':
      return [
        { kind: 'box', sx: 0.22, sy: 0.8, sz: 0.18, x: -1.3, y: -0.15 },
        { kind: 'box', sx: 0.22, sy: 0.8, sz: 0.18, x: 1.3, y: -0.15 },
        { kind: 'cylinder', rTop: 0.06, rBottom: 0.06, height: 0.5, x: -0.4, y: 1.05, radialSeg: 5 },
        { kind: 'cylinder', rTop: 0.06, rBottom: 0.06, height: 0.5, x: 0.4, y: 1.05, radialSeg: 5 },
        { kind: 'box', sx: 1.9, sy: 0.08, sz: 0.1, y: -0.32, z: 0.26 },
      ]
    default:
      return []
  }
}

export function bakeEnemyGeometry(kind: EnemyKind, detail: DetailLevel): BufferGeometry {
  const active = partsForEnemy(kind, detail)
  const parts: GeoPart[] = []
  if (active.includes('body')) parts.push(...bodyParts(kind))
  if (active.includes('optionalDetail')) parts.push(...optionalParts(kind))
  return bakeParts(parts)
}

export function bakeEnemyAccentGeometry(kind: EnemyKind): BufferGeometry {
  return bakeParts(accentParts(kind))
}

export function bakeEnemyPanelGeometry(kind: EnemyKind): BufferGeometry {
  return bakeParts(panelParts(kind))
}

/** Hostile hull: rust base lifted for lane separation, with panel detail. */
export function createEnemyMaterial(kind: EnemyKind): MeshStandardMaterial {
  const recipe = ENEMY_RECIPES[kind]
  const mat = createTokenMaterial(recipe.hullToken)
  // Panel map is mid-grey; overdrive the base color so the hull still reads rust
  mat.color.setRGB(1.9, 0.98, 0.64)
  mat.emissive.set('#511d0e')
  mat.emissiveIntensity = 0.55
  mat.map = getPanelLineTexture()
  mat.roughnessMap = getMicroNoiseTexture()
  mat.envMapIntensity = 0.9
  return mat
}

/** Hot emissive accent; supports per-instance charge telegraph tinting. */
export function createEnemyAccentMaterial(kind: EnemyKind): MeshStandardMaterial {
  const recipe = ENEMY_RECIPES[kind]
  const mat = createTokenMaterial(recipe.accentToken)
  mat.emissiveIntensity = Math.max(1.5, mat.emissiveIntensity)
  mat.toneMapped = false
  return mat
}

export function createEnemyPanelMaterial(): MeshStandardMaterial {
  const mat = createTokenMaterial('hullPanel')
  mat.color.set('#3b2020')
  mat.emissive.set('#1d0805')
  mat.emissiveIntensity = 0.24
  mat.metalness = 0.82
  mat.roughness = 0.5
  return mat
}
