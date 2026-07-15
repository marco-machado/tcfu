import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { AdditiveBlending, type Group, type MeshBasicMaterial } from 'three'
import { getWorld } from '../../sim/world'
import { PLAYER_MAX_SPEED } from '../../sim/constants'
import { useSessionStore } from '../../app/sessionStore'
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
  const reducedMotion = useSessionStore((s) => s.settings.reducedMotion)
  const root = useRef<Group>(null)
  const core = useRef<MeshBasicMaterial>(null)
  const envelope = useRef<MeshBasicMaterial>(null)
  const baseLen = (dense ? 0.41 : 0.31) * length
  const colors = useMemo(
    () => ({ core: '#eaf8ff', envelope: thruster.emissive || thruster.color }),
    [thruster],
  )

  useFrame((state) => {
    const g = root.current
    if (!g) return
    let t = PREVIEW_THRUST
    const world = getWorld()
    if (live) {
      const p = world.player
      t = thrustIntensity(p.vx, p.vy, PLAYER_MAX_SPEED)
    }
    // Layered hot core + wider ion envelope. Flicker is bounded so silhouette
    // stays stable while still carrying thrust energy.
    const phase = live ? world.session.elapsed : state.clock.elapsedTime
    const flicker = reducedMotion ? 1 : 1 + Math.sin(phase * 31 + scale * 7) * 0.045
    const len = (0.62 + t * 1.05) * flicker
    const width = 0.92 + t * 0.28
    g.scale.set(width, len, width)
    if (core.current) core.current.opacity = Math.min(1, 0.78 + t * 0.14)
    if (envelope.current) envelope.current.opacity = Math.min(0.62, 0.24 + t * 0.2)
  })

  const s = scale
  return (
    <group ref={root} name="thrusterPlume" position={[0, -0.16 * s, 0]}>
      <mesh position={[0, -baseLen * 0.44 * s, 0]}>
        <cylinderGeometry args={[0.008 * s, 0.052 * s, baseLen * 1.08 * s, dense ? 10 : 8]} />
        <meshBasicMaterial
          ref={core}
          color={colors.core}
          transparent
          opacity={0.9}
          blending={AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[0, -baseLen * 0.5 * s, 0]}>
        <cylinderGeometry args={[0.018 * s, 0.09 * s, baseLen * 1.22 * s, dense ? 12 : 8]} />
        <meshBasicMaterial
          ref={envelope}
          color={colors.envelope}
          transparent
          opacity={0.42}
          blending={AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      {dense && (
        <>
          <mesh position={[-0.025 * s, -baseLen * 0.76 * s, 0]} rotation={[0, 0, -0.035]}>
            <cylinderGeometry args={[0.003 * s, 0.018 * s, baseLen * 0.7 * s, 5]} />
            <meshBasicMaterial color="#5ee7ff" transparent opacity={0.38} blending={AdditiveBlending} depthWrite={false} toneMapped={false} />
          </mesh>
          <mesh position={[0.025 * s, -baseLen * 0.72 * s, 0]} rotation={[0, 0, 0.035]}>
            <cylinderGeometry args={[0.003 * s, 0.016 * s, baseLen * 0.62 * s, 5]} />
            <meshBasicMaterial color="#2a8cff" transparent opacity={0.32} blending={AdditiveBlending} depthWrite={false} toneMapped={false} />
          </mesh>
        </>
      )}
      <mesh position={[0, -baseLen * 1.08 * s, 0]}>
        <sphereGeometry args={[(dense ? 0.045 : 0.034) * s, 8, 6]} />
        <meshBasicMaterial color="#5ee7ff" transparent opacity={0.58} blending={AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  )
}
