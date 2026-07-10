import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import type { Group } from 'three'
import { getWorld } from '../../sim/world'
import { createTokenMaterial } from './createMaterial'
import type { DetailLevel } from './registry'
import { sceneryExtras, sceneryLayers } from './registry'

type Props = {
  detail: DetailLevel
}

function recycleY(y: number, min: number, span: number): number {
  if (y < min) return y + span
  return y
}

/** Deterministic pseudo-random in [0, 1) from integer seed. */
function hash01(n: number): number {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}

export function ParallaxCorridor({ detail }: Props) {
  const layers = sceneryLayers(detail)
  const extras = sceneryExtras(detail)
  const farRef = useRef<Group>(null)
  const midRef = useRef<Group>(null)
  const nearRef = useRef<Group>(null)

  const voidMat = useMemo(() => createTokenMaterial('voidPlate'), [])
  const metalMat = useMemo(() => createTokenMaterial('sceneryMetal'), [])
  const glowMat = useMemo(() => createTokenMaterial('sceneryEmissive'), [])

  const farStars = useMemo(() => {
    const pts: [number, number, number, number][] = []
    for (let i = 0; i < extras.starCount; i++) {
      const x = (hash01(i) - 0.5) * 28
      const y = hash01(i + 40) * 36 - 6
      const z = -1.6 - hash01(i + 80) * 0.8
      const s = 0.035 + hash01(i + 120) * 0.05
      pts.push([x, y, z, s])
    }
    return pts
  }, [extras.starCount])

  const distantSilhouettes = useMemo(() => {
    if (!extras.distantSilhouettes) return []
    const list: { x: number; y: number; sx: number; sy: number; sz: number }[] = []
    for (let i = 0; i < 8; i++) {
      const side = i % 2 === 0 ? -1 : 1
      list.push({
        x: side * (9.5 + hash01(i + 200) * 2.5),
        y: -3 + i * 4.2 + hash01(i + 220) * 1.2,
        sx: 0.5 + hash01(i + 240) * 0.9,
        sy: 0.35 + hash01(i + 260) * 0.5,
        sz: 0.2 + hash01(i + 280) * 0.15,
      })
    }
    return list
  }, [extras.distantSilhouettes])

  const nearStreaks = useMemo(() => {
    const list: { x: number; y: number; len: number }[] = []
    for (let i = 0; i < extras.streakCount; i++) {
      list.push({
        x: (hash01(i + 300) - 0.5) * 14,
        y: -2 + hash01(i + 320) * 22,
        len: 0.6 + hash01(i + 340) * 0.9,
      })
    }
    return list
  }, [extras.streakCount])

  useFrame((_, delta) => {
    const speed = getWorld().streamSpeed
    const far = farRef.current
    if (far) {
      for (const child of far.children) {
        child.position.y -= speed * delta * 0.1
        child.position.y = recycleY(child.position.y, -8, 40)
      }
    }
    const mid = midRef.current
    if (mid) {
      for (const child of mid.children) {
        child.position.y -= speed * delta * 0.22
        child.position.y = recycleY(child.position.y, -6, 38)
      }
    }
    const near = nearRef.current
    if (near) {
      for (const child of near.children) {
        child.position.y -= speed * delta * 0.42
        child.position.y = recycleY(child.position.y, -4, 26)
      }
    }
  })

  return (
    <group>
      <mesh position={[0, 8, -2.2]} material={voidMat}>
        <planeGeometry args={[40, 56]} />
      </mesh>

      {layers.includes('far') && (
        <group ref={farRef}>
          {farStars.map((p, i) => (
            <mesh key={`star-${i}`} position={[p[0], p[1], p[2]]} material={glowMat}>
              <boxGeometry args={[p[3], p[3], 0.02]} />
            </mesh>
          ))}
        </group>
      )}

      {layers.includes('mid') && extras.distantSilhouettes && (
        <group ref={midRef}>
          {distantSilhouettes.map((p, i) => (
            <mesh
              key={`sil-${i}`}
              material={metalMat}
              position={[p.x, p.y, -1.1]}
              scale={[p.sx, p.sy, p.sz]}
            >
              <boxGeometry args={[1, 1, 1]} />
            </mesh>
          ))}
        </group>
      )}

      {layers.includes('near') && (
        <group ref={nearRef}>
          {nearStreaks.map((s, i) => (
            <mesh
              key={`streak-${i}`}
              material={glowMat}
              position={[s.x, s.y, -0.12]}
              scale={[0.05, s.len, 0.04]}
            >
              <boxGeometry args={[1, 1, 1]} />
            </mesh>
          ))}
        </group>
      )}
    </group>
  )
}
