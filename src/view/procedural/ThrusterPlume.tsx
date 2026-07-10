import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import type { Group, Mesh, MeshStandardMaterial } from 'three'
import { getWorld } from '../../sim/world'
import { PLAYER_MAX_SPEED } from '../../sim/constants'
import { PREVIEW_THRUST, thrustIntensity } from './thrustIntensity'

type MatProps = {
  color: string
  emissive: string
  emissiveIntensity: number
  metalness: number
  roughness: number
  toneMapped: boolean
}

type Props = {
  scale?: number
  dense?: boolean
  thruster: MatProps
  /** When true, plume length tracks live player velocity. */
  live?: boolean
  /** Base length multiplier (Medium ~1, High denser). */
  length?: number
}

/**
 * Cyan thruster exhaust: elongated cone + tip, scaled by thrust.
 * View-only; does not affect hitboxes.
 */
export function ThrusterPlume({
  scale = 1,
  dense = false,
  thruster,
  live = false,
  length = 1,
}: Props) {
  const root = useRef<Group>(null)
  const baseLen = (dense ? 0.95 : 0.68) * length
  const mat = useMemo(
    () =>
      ({
        ...thruster,
        transparent: true,
        opacity: 0.92,
        depthWrite: false,
      }) as MatProps & { transparent: boolean; opacity: number; depthWrite: boolean },
    [thruster],
  )

  useFrame(() => {
    const g = root.current
    if (!g) return
    let t = PREVIEW_THRUST
    if (live) {
      const p = getWorld().player
      t = thrustIntensity(p.vx, p.vy, PLAYER_MAX_SPEED)
    }
    // Length along -Y; width blooms slightly with thrust
    const len = 0.55 + t * 0.9
    const width = 0.85 + t * 0.35
    g.scale.set(width, len, width)
    g.traverse((obj) => {
      const mesh = obj as Mesh
      if (!mesh.isMesh) return
      const m = mesh.material as MeshStandardMaterial
      if (!m?.isMeshStandardMaterial) return
      m.emissiveIntensity = thruster.emissiveIntensity * (0.75 + t * 0.55)
    })
  })

  const s = scale
  return (
    <group ref={root} name="thrusterPlume" position={[0, -0.16 * s, 0]}>
      <mesh position={[0, -baseLen * 0.38 * s, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.012 * s, 0.062 * s, baseLen * s, dense ? 10 : 8]} />
        <meshStandardMaterial {...mat} />
      </mesh>
      {dense && (
        <mesh position={[0, -baseLen * 0.28 * s, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.006 * s, 0.035 * s, baseLen * 0.85 * s, 6]} />
          <meshStandardMaterial {...mat} />
        </mesh>
      )}
      <mesh position={[0, -baseLen * 0.78 * s, 0]}>
        <sphereGeometry args={[(dense ? 0.05 : 0.038) * s, 8, 6]} />
        <meshStandardMaterial {...mat} />
      </mesh>
    </group>
  )
}
