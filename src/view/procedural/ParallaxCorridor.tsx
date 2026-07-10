import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import type { Group } from 'three'
import { getWorld } from '../../sim/world'
import { createTokenMaterial } from './createMaterial'
import type { DetailLevel } from './registry'
import { sceneryLayers } from './registry'

type Props = {
  detail: DetailLevel
}

function recycleY(y: number, min: number, span: number): number {
  if (y < min) return y + span
  return y
}

export function ParallaxCorridor({ detail }: Props) {
  const layers = sceneryLayers(detail)
  const farRef = useRef<Group>(null)
  const midRef = useRef<Group>(null)
  const nearRef = useRef<Group>(null)

  const voidMat = useMemo(() => createTokenMaterial('voidPlate'), [])
  const metalMat = useMemo(() => createTokenMaterial('sceneryMetal'), [])
  const glowMat = useMemo(() => createTokenMaterial('sceneryEmissive'), [])

  const farStars = useMemo(() => {
    const pts: [number, number, number][] = []
    for (let i = 0; i < 40; i++) {
      pts.push([(i * 2.7) % 22 - 11, (i * 3.1) % 30 - 4, -1.2 - (i % 5) * 0.05])
    }
    return pts
  }, [])

  const midPylons = useMemo(() => {
    const list: { x: number; y: number; h: number }[] = []
    for (let i = 0; i < 10; i++) {
      const side = i % 2 === 0 ? -1 : 1
      list.push({
        x: side * (7.2 + (i % 3) * 0.35),
        y: -2 + i * 3.2,
        h: 1.4 + (i % 3) * 0.4,
      })
    }
    return list
  }, [])

  const nearStreaks = useMemo(() => {
    const list: { x: number; y: number; len: number }[] = []
    const count = detail === 'high' ? 22 : 14
    for (let i = 0; i < count; i++) {
      list.push({
        x: -6 + (i % 7) * 2,
        y: -1 + Math.floor(i / 7) * 5.5 + (i % 3) * 0.4,
        len: 0.7 + (i % 4) * 0.25,
      })
    }
    return list
  }, [detail])

  useFrame((_, delta) => {
    const speed = getWorld().streamSpeed
    const far = farRef.current
    if (far) {
      for (const child of far.children) {
        child.position.y -= speed * delta * 0.12
        child.position.y = recycleY(child.position.y, -6, 32)
      }
    }
    const mid = midRef.current
    if (mid) {
      for (const child of mid.children) {
        child.position.y -= speed * delta * 0.28
        child.position.y = recycleY(child.position.y, -4, 34)
      }
    }
    const near = nearRef.current
    if (near) {
      for (const child of near.children) {
        child.position.y -= speed * delta * 0.45
        child.position.y = recycleY(child.position.y, -3, 24)
      }
    }
  })

  return (
    <group>
      <mesh position={[0, 8, -1.4]} material={voidMat}>
        <planeGeometry args={[32, 52]} />
      </mesh>

      {layers.includes('far') && (
        <group ref={farRef}>
          {farStars.map((p, i) => (
            <mesh key={`star-${i}`} position={p} material={glowMat}>
              <boxGeometry args={[0.06, 0.06, 0.02]} />
            </mesh>
          ))}
        </group>
      )}

      {layers.includes('mid') && (
        <group ref={midRef}>
          {midPylons.map((p, i) => (
            <group key={`pylon-${i}`} position={[p.x, p.y, -0.55]}>
              <mesh material={metalMat} position={[0, 0, 0]} scale={[0.35, p.h, 0.35]}>
                <boxGeometry args={[1, 1, 1]} />
              </mesh>
              <mesh material={glowMat} position={[0, p.h * 0.35, 0.12]} scale={[0.12, 0.35, 0.08]}>
                <boxGeometry args={[1, 1, 1]} />
              </mesh>
            </group>
          ))}
          {/* tech ribs along corridor sides */}
          {[-1, 1].map((side) =>
            [0, 1, 2, 3, 4].map((i) => (
              <mesh
                key={`rib-${side}-${i}`}
                material={metalMat}
                position={[side * 6.4, -1 + i * 5, -0.4]}
                scale={[0.15, 2.2, 0.4]}
              >
                <boxGeometry args={[1, 1, 1]} />
              </mesh>
            )),
          )}
        </group>
      )}

      {layers.includes('near') && (
        <group ref={nearRef}>
          {nearStreaks.map((s, i) => (
            <mesh
              key={`streak-${i}`}
              material={glowMat}
              position={[s.x, s.y, -0.08]}
              scale={[0.08, s.len, 0.06]}
            >
              <boxGeometry args={[1, 1, 1]} />
            </mesh>
          ))}
        </group>
      )}
    </group>
  )
}
