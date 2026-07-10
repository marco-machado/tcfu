import { MeshStandardMaterial } from 'three'
import { materialToken, type MaterialTokenId } from './materialTokens'

export function createTokenMaterial(
  id: MaterialTokenId,
  overrides?: Partial<{ emissiveIntensity: number }>,
): MeshStandardMaterial {
  const t = materialToken(id)
  return new MeshStandardMaterial({
    color: t.color,
    emissive: t.emissive,
    emissiveIntensity: overrides?.emissiveIntensity ?? t.emissiveIntensity,
    metalness: t.metalness,
    roughness: t.roughness,
    toneMapped: t.toneMapped,
  })
}
