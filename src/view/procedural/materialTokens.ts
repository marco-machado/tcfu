/** Named material recipes for interim procedural craft. Builders pick tokens only. */

export type MaterialTokenId =
  | 'hullCold'
  | 'hullStealth'
  | 'hullArmored'
  | 'hullPanel'
  | 'hullHostile'
  | 'nozzleMetal'
  | 'glassCanopy'
  | 'thrusterPlayer'
  | 'thrusterHot'
  | 'accentPlayer'
  | 'accentEnemy'
  | 'accentCrystal'
  | 'pickupGold'
  | 'pickupGreen'
  | 'pickupCyan'
  | 'pickupViolet'
  | 'projectilePlayer'
  | 'projectileEnemy'
  | 'sceneryMetal'
  | 'sceneryEmissive'
  | 'voidPlate'

export type MaterialToken = {
  color: string
  emissive: string
  emissiveIntensity: number
  metalness: number
  roughness: number
  toneMapped: boolean
}

/** Soft ceiling for tests and bloom-safe authoring. */
export const EMISSIVE_INTENSITY_MAX = 2.2

export const MATERIAL_TOKENS: Record<MaterialTokenId, MaterialToken> = {
  // Dark cold metal: specular reads from lights, not self-glow (avoids flat icon look).
  hullCold: {
    color: '#4e6780',
    emissive: '#070e16',
    emissiveIntensity: 0.05,
    metalness: 0.9,
    roughness: 0.26,
    toneMapped: true,
  },
  hullStealth: {
    color: '#3a4558',
    emissive: '#060a12',
    emissiveIntensity: 0.06,
    metalness: 0.92,
    roughness: 0.22,
    toneMapped: true,
  },
  hullArmored: {
    color: '#6a7a90',
    emissive: '#0c1420',
    emissiveIntensity: 0.07,
    metalness: 0.82,
    roughness: 0.38,
    toneMapped: true,
  },
  hullPanel: {
    color: '#2a3548',
    emissive: '#050810',
    emissiveIntensity: 0.05,
    metalness: 0.75,
    roughness: 0.48,
    toneMapped: true,
  },
  hullHostile: {
    color: '#a85840',
    emissive: '#4a180c',
    emissiveIntensity: 0.4,
    metalness: 0.62,
    roughness: 0.38,
    toneMapped: false,
  },
  nozzleMetal: {
    color: '#1a222e',
    emissive: '#05080c',
    emissiveIntensity: 0.05,
    metalness: 0.95,
    roughness: 0.18,
    toneMapped: true,
  },
  glassCanopy: {
    color: '#0c1828',
    emissive: '#102838',
    emissiveIntensity: 0.22,
    metalness: 0.05,
    roughness: 0.08,
    toneMapped: true,
  },
  thrusterPlayer: {
    color: '#f0fcff',
    emissive: '#2ec8ff',
    emissiveIntensity: 1.85,
    metalness: 0.02,
    roughness: 0.12,
    toneMapped: false,
  },
  thrusterHot: {
    color: '#fff0e0',
    emissive: '#ff5520',
    emissiveIntensity: 2.05,
    metalness: 0.05,
    roughness: 0.15,
    toneMapped: false,
  },
  accentPlayer: {
    color: '#3a98c8',
    emissive: '#1a90d0',
    emissiveIntensity: 0.72,
    metalness: 0.6,
    roughness: 0.3,
    toneMapped: false,
  },
  accentEnemy: {
    color: '#ff7744',
    emissive: '#ff4422',
    emissiveIntensity: 1.1,
    metalness: 0.35,
    roughness: 0.35,
    toneMapped: false,
  },
  accentCrystal: {
    color: '#70e8d8',
    emissive: '#20a090',
    emissiveIntensity: 1.2,
    metalness: 0.45,
    roughness: 0.2,
    toneMapped: false,
  },
  pickupGold: {
    color: '#ffdc62',
    emissive: '#dca318',
    emissiveIntensity: 1.45,
    metalness: 0.35,
    roughness: 0.25,
    toneMapped: false,
  },
  pickupGreen: {
    color: '#88ff92',
    emissive: '#38c848',
    emissiveIntensity: 1.4,
    metalness: 0.3,
    roughness: 0.28,
    toneMapped: false,
  },
  pickupCyan: {
    color: '#78e8ff',
    emissive: '#30b0d8',
    emissiveIntensity: 1.4,
    metalness: 0.3,
    roughness: 0.28,
    toneMapped: false,
  },
  pickupViolet: {
    color: '#e18cff',
    emissive: '#a040d0',
    emissiveIntensity: 1.35,
    metalness: 0.3,
    roughness: 0.28,
    toneMapped: false,
  },
  projectilePlayer: {
    color: '#e8fbff',
    emissive: '#66d0ff',
    emissiveIntensity: 1.6,
    metalness: 0.15,
    roughness: 0.25,
    toneMapped: false,
  },
  projectileEnemy: {
    color: '#ff9977',
    emissive: '#ff4422',
    emissiveIntensity: 1.5,
    metalness: 0.15,
    roughness: 0.3,
    toneMapped: false,
  },
  sceneryMetal: {
    color: '#2a4058',
    emissive: '#0a1828',
    emissiveIntensity: 0.25,
    metalness: 0.65,
    roughness: 0.55,
    toneMapped: true,
  },
  sceneryEmissive: {
    color: '#3a6a88',
    emissive: '#1a5070',
    emissiveIntensity: 0.55,
    metalness: 0.4,
    roughness: 0.45,
    toneMapped: false,
  },
  voidPlate: {
    color: '#0a1220',
    emissive: '#040810',
    emissiveIntensity: 0.1,
    metalness: 0.15,
    roughness: 0.92,
    toneMapped: true,
  },
}

export function materialToken(id: MaterialTokenId): MaterialToken {
  return MATERIAL_TOKENS[id]
}

export function allMaterialTokenIds(): MaterialTokenId[] {
  return Object.keys(MATERIAL_TOKENS) as MaterialTokenId[]
}
