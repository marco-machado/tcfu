import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { InstancedMesh, Object3D } from 'three'
import { useDebugStore } from '../app/debugMode'
import { MAX_ENEMIES, MAX_ENEMY_BULLETS } from '../sim/constants'
import { getWorld } from '../sim/world'

const proxy = new Object3D()

/** Only set-piece kinds use AABB hitboxes; a handful is plenty. */
const MAX_AABB_HITBOXES = 8

function place(
  mesh: InstancedMesh,
  index: number,
  x: number,
  y: number,
  sx: number,
  sy: number,
): void {
  proxy.position.set(x, y, 0.5)
  proxy.scale.set(sx, sy, 1)
  proxy.rotation.set(0, 0, 0)
  proxy.updateMatrix()
  mesh.setMatrixAt(index, proxy.matrix)
}

export function DebugHitboxes() {
  const overlay = useDebugStore((s) => s.overlay)
  const enemyRings = useRef<InstancedMesh>(null)
  const enemyBoxes = useRef<InstancedMesh>(null)
  const bulletRings = useRef<InstancedMesh>(null)
  const playerRing = useRef<InstancedMesh>(null)

  useFrame(() => {
    const rings = enemyRings.current
    const aabbs = enemyBoxes.current
    const bullets = bulletRings.current
    const player = playerRing.current
    if (!rings || !aabbs || !bullets || !player) return
    if (!overlay) {
      rings.count = 0
      aabbs.count = 0
      bullets.count = 0
      player.count = 0
      return
    }
    const world = getWorld()

    let ringCount = 0
    let boxCount = 0
    for (const e of world.enemies) {
      if (!e.active) continue
      if (e.halfW > 0 && e.halfH > 0) {
        if (boxCount < MAX_AABB_HITBOXES) {
          place(aabbs, boxCount, e.x, e.y, e.halfW * 2, e.halfH * 2)
          boxCount += 1
        }
        continue
      }
      place(rings, ringCount, e.x, e.y, e.r, e.r)
      ringCount += 1
    }
    rings.count = ringCount
    rings.instanceMatrix.needsUpdate = true
    aabbs.count = boxCount
    aabbs.instanceMatrix.needsUpdate = true

    let bulletCount = 0
    for (const b of world.enemyBullets) {
      if (!b.active) continue
      place(bullets, bulletCount, b.x, b.y, b.r, b.r)
      bulletCount += 1
    }
    bullets.count = bulletCount
    bullets.instanceMatrix.needsUpdate = true

    place(player, 0, world.player.x, world.player.y, world.player.hitboxR, world.player.hitboxR)
    player.count = 1
    player.instanceMatrix.needsUpdate = true
  })

  return (
    <group>
      <instancedMesh ref={enemyRings} args={[undefined, undefined, MAX_ENEMIES]} frustumCulled={false}>
        <ringGeometry args={[0.92, 1, 24]} />
        <meshBasicMaterial color="#ff5050" depthTest={false} transparent opacity={0.9} />
      </instancedMesh>
      <instancedMesh
        ref={enemyBoxes}
        args={[undefined, undefined, MAX_AABB_HITBOXES]}
        frustumCulled={false}
      >
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial color="#ff5050" wireframe depthTest={false} transparent opacity={0.9} />
      </instancedMesh>
      <instancedMesh
        ref={bulletRings}
        args={[undefined, undefined, MAX_ENEMY_BULLETS]}
        frustumCulled={false}
      >
        <ringGeometry args={[0.85, 1, 12]} />
        <meshBasicMaterial color="#ffb050" depthTest={false} transparent opacity={0.9} />
      </instancedMesh>
      <instancedMesh ref={playerRing} args={[undefined, undefined, 1]} frustumCulled={false}>
        <ringGeometry args={[0.92, 1, 24]} />
        <meshBasicMaterial color="#50ff8c" depthTest={false} transparent opacity={0.9} />
      </instancedMesh>
    </group>
  )
}
