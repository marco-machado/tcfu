import {
  Color,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  type Material,
  type Texture,
} from 'three'
import { materialToken } from './materialTokens'
import { getMicroNoiseTexture, getPanelLineTexture } from './ProceduralTextures'

/**
 * Shared material-role kit (technical-art roles).
 * One instance per role; clone only when a mesh needs independent flash mutation.
 */
export type MaterialRole =
  | 'bodyPrimary'
  | 'bodySecondary'
  | 'trim'
  | 'glass'
  | 'emissiveSignal'
  | 'emissiveHot'
  | 'nozzle'
  | 'groundContact'
  | 'decalDark'

const cache = new Map<string, Material>()

function panelMap(): Texture {
  return getPanelLineTexture()
}

function noiseMap(): Texture {
  return getMicroNoiseTexture()
}

export function getRoleMaterial(role: MaterialRole): Material {
  const hit = cache.get(role)
  if (hit) return hit

  let mat: Material
  switch (role) {
    case 'bodyPrimary': {
      const t = materialToken('hullCold')
      // Panel map is mid-grey; overdrive base color so the mapped hull keeps
      // the token's intended value.
      const lifted = new Color(t.color).multiplyScalar(1.9)
      mat = new MeshPhysicalMaterial({
        color: lifted,
        map: panelMap(),
        metalness: 0.92,
        roughness: 0.32,
        roughnessMap: noiseMap(),
        clearcoat: 0.35,
        clearcoatRoughness: 0.35,
        envMapIntensity: 1.15,
        emissive: t.emissive,
        emissiveIntensity: t.emissiveIntensity,
      })
      break
    }
    case 'bodySecondary': {
      const t = materialToken('hullPanel')
      const lifted = new Color(t.color).multiplyScalar(1.8)
      mat = new MeshStandardMaterial({
        color: lifted,
        map: panelMap(),
        metalness: 0.78,
        roughness: 0.52,
        roughnessMap: noiseMap(),
        envMapIntensity: 0.75,
        emissive: t.emissive,
        emissiveIntensity: t.emissiveIntensity,
      })
      break
    }
    case 'trim': {
      const t = materialToken('accentPlayer')
      mat = new MeshStandardMaterial({
        color: t.color,
        metalness: 0.55,
        roughness: 0.28,
        emissive: t.emissive,
        emissiveIntensity: Math.max(1.2, t.emissiveIntensity),
        toneMapped: false,
        envMapIntensity: 0.9,
      })
      break
    }
    case 'glass': {
      // Cheap fake glass (no transmission buffer) — hangar + run safe.
      mat = new MeshPhysicalMaterial({
        color: 0x0a1828,
        metalness: 0.05,
        roughness: 0.06,
        transparent: true,
        opacity: 0.55,
        clearcoat: 1,
        clearcoatRoughness: 0.08,
        envMapIntensity: 1.6,
        emissive: 0x102838,
        emissiveIntensity: 0.2,
        depthWrite: false,
      })
      break
    }
    case 'emissiveSignal': {
      const t = materialToken('thrusterPlayer')
      mat = new MeshStandardMaterial({
        color: 0x101418,
        emissive: t.emissive,
        emissiveIntensity: t.emissiveIntensity,
        metalness: 0.05,
        roughness: 0.25,
        toneMapped: false,
      })
      break
    }
    case 'emissiveHot': {
      const t = materialToken('thrusterHot')
      mat = new MeshStandardMaterial({
        color: 0x181010,
        emissive: t.emissive,
        emissiveIntensity: t.emissiveIntensity,
        metalness: 0.05,
        roughness: 0.22,
        toneMapped: false,
      })
      break
    }
    case 'nozzle': {
      const t = materialToken('nozzleMetal')
      mat = new MeshStandardMaterial({
        color: t.color,
        metalness: 0.96,
        roughness: 0.16,
        envMapIntensity: 1.25,
        emissive: t.emissive,
        emissiveIntensity: t.emissiveIntensity,
      })
      break
    }
    case 'groundContact': {
      mat = new MeshStandardMaterial({
        color: 0x03060c,
        metalness: 0.3,
        roughness: 0.92,
        emissive: 0x0a2030,
        emissiveIntensity: 0.12,
        transparent: true,
        opacity: 0.85,
      })
      break
    }
    case 'decalDark': {
      mat = new MeshStandardMaterial({
        color: 0x121820,
        metalness: 0.7,
        roughness: 0.55,
        envMapIntensity: 0.5,
      })
      break
    }
  }

  mat.name = `role:${role}`
  cache.set(role, mat)
  return mat
}

/** Clone for per-mesh flash mutation without poisoning the shared kit. */
export function cloneRoleMaterial(role: MaterialRole): Material {
  return getRoleMaterial(role).clone()
}
