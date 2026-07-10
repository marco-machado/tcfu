import { useFrame } from '@react-three/fiber'
import { useLayoutEffect, useMemo, useRef } from 'react'
import {
  BoxGeometry,
  Color,
  type BufferGeometry,
  type Group,
  type InstancedMesh,
  Object3D,
  OctahedronGeometry,
  SphereGeometry,
} from 'three'
import { useSessionStore } from '../app/sessionStore'
import {
  BAND,
  DEATH_HOLD,
  MAX_ENEMIES,
  MAX_ENEMY_BULLETS,
  MAX_PLAYER_BULLETS,
  MAX_POWERUPS,
} from '../sim/constants'
import type { EnemyKind, PowerupType } from '../sim/types'
import { getWorld } from '../sim/world'
import { createTokenMaterial } from './procedural/createMaterial'
import { bakeEnemyGeometry, createEnemyMaterial } from './procedural/enemyGeometry'
import { materialToken } from './procedural/materialTokens'
import { ParallaxCorridor } from './procedural/ParallaxCorridor'
import {
  detailFromQuality,
  type DetailLevel,
  ENEMY_KIND_VISUAL_IDS,
  POWERUP_TOKENS,
} from './procedural/registry'
import { ShipKitVisual } from './procedural/ShipKitVisual'

const _proxy = new Object3D()

function hideInstance(inst: InstancedMesh, index: number): void {
  _proxy.position.set(0, -200, 0)
  _proxy.scale.setScalar(0)
  _proxy.rotation.set(0, 0, 0)
  _proxy.updateMatrix()
  inst.setMatrixAt(index, _proxy.matrix)
}

function writeInstance(
  inst: InstancedMesh,
  index: number,
  x: number,
  y: number,
  z: number,
  sx: number,
  sy: number,
  sz: number,
  rotZ = 0,
): void {
  _proxy.position.set(x, y, z)
  _proxy.scale.set(sx, sy, sz)
  _proxy.rotation.set(0, 0, rotZ)
  _proxy.updateMatrix()
  inst.setMatrixAt(index, _proxy.matrix)
}

export function Playfield() {
  const quality = useSessionStore((s) => s.settings.quality)
  const detail = detailFromQuality(quality)
  const width = BAND.maxX - BAND.minX
  const height = BAND.maxY - BAND.minY
  const cx = (BAND.minX + BAND.maxX) / 2
  const cy = (BAND.minY + BAND.maxY) / 2
  const bandGeo = useMemo(() => new BoxGeometry(width, height, 0.01), [width, height])

  return (
    <group>
      <ParallaxCorridor detail={detail} />

      {/* Movement-band chrome only — not physical corridor walls */}
      <mesh position={[cx, cy, -0.02]}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial color="#071019" transparent opacity={0.14} />
      </mesh>

      <lineSegments position={[cx, cy, 0.02]}>
        <edgesGeometry args={[bandGeo]} />
        <lineBasicMaterial color="#2a6a88" transparent opacity={0.55} />
      </lineSegments>

      <PlayerMesh detail={detail} />
      <DeathBurst />
      <PlayerBulletInstances />
      <EnemyBulletInstances />
      <EnemyInstances detail={detail} />
      <PowerupInstances />
    </group>
  )
}

function PlayerMesh({ detail }: { detail: DetailLevel }) {
  const group = useRef<Group>(null)
  // Ship is fixed for the Run; session selection matches world.player.shipId at launch.
  const shipId = useSessionStore((s) => s.selectedShip)

  useFrame(() => {
    const world = getWorld()
    const p = world.player
    const dead = world.session.runOver
    const blink = !dead && p.iFrames > 0 && Math.floor(p.iFrames * 20) % 2 === 0
    const visible = !dead && !blink
    const g = group.current
    if (!g) return
    g.visible = visible
    g.position.set(p.x, p.y, 0.2)
    // Tip thrusters toward camera (elevated rear read) and bank with strafe
    g.rotation.x = -0.52
    g.rotation.z = -p.vx * 0.055
  })

  return (
    <group ref={group} position={[0, 3.5, 0.2]}>
      <ShipKitVisual
        key={`${shipId}-${detail}`}
        shipId={shipId}
        detail={detail}
        liveFlash
        liveThrust
      />
    </group>
  )
}

const DEATH_PARTICLES = 14

function DeathBurst() {
  const group = useRef<Group>(null)
  const seeded = useRef(false)
  const origin = useRef({ x: 0, y: 0 })
  const dirs = useMemo(() => {
    const list: { x: number; y: number; s: number }[] = []
    for (let i = 0; i < DEATH_PARTICLES; i++) {
      const a = (i / DEATH_PARTICLES) * Math.PI * 2
      const speed = 2.2 + (i % 3) * 0.7
      list.push({ x: Math.cos(a) * speed, y: Math.sin(a) * speed, s: 0.18 + (i % 4) * 0.05 })
    }
    return list
  }, [])

  useFrame(() => {
    const g = group.current
    if (!g) return
    const world = getWorld()
    const flash = world.session.deathFlash
    if (!world.session.runOver || flash <= 0) {
      g.visible = false
      seeded.current = false
      return
    }

    if (!seeded.current) {
      origin.current = { x: world.player.x, y: world.player.y }
      seeded.current = true
    }

    const t = 1 - flash / DEATH_HOLD
    const expand = t * 1.15
    g.visible = true
    g.position.set(origin.current.x, origin.current.y, 0.35)
    let i = 0
    for (const child of g.children) {
      const d = dirs[i++]
      if (!d) break
      child.position.set(d.x * expand, d.y * expand, 0)
      const scale = d.s * (1.15 - t * 0.85)
      child.scale.setScalar(Math.max(0.01, scale))
    }
  })

  return (
    <group ref={group} visible={false}>
      {dirs.map((_, i) => (
        <mesh key={i}>
          <boxGeometry args={[1, 1, 0.2]} />
          <meshStandardMaterial
            color={i % 2 === 0 ? '#7fd4ff' : '#ffaa66'}
            emissive={i % 2 === 0 ? '#44aadd' : '#ff6622'}
            emissiveIntensity={2}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  )
}

function useInstancedPool(count: number) {
  const mesh = useRef<InstancedMesh>(null)

  useLayoutEffect(() => {
    const inst = mesh.current
    if (!inst) return
    for (let i = 0; i < count; i++) hideInstance(inst, i)
    inst.instanceMatrix.needsUpdate = true
    inst.computeBoundingSphere()
  }, [count])

  return mesh
}

function PlayerBulletInstances() {
  const geometry = useMemo(() => {
    // Elongated cyan bolt for direction read under bloom
    const g = new BoxGeometry(0.1, 0.72, 0.1)
    return g
  }, [])
  const material = useMemo(() => createTokenMaterial('projectilePlayer'), [])
  const mesh = useInstancedPool(MAX_PLAYER_BULLETS)

  useFrame(() => {
    const inst = mesh.current
    if (!inst) return
    const bullets = getWorld().playerBullets
    let i = 0
    for (const b of bullets) {
      if (!b.active) continue
      writeInstance(inst, i, b.x, b.y, 0.28, 1, 1, 1)
      i++
    }
    for (let j = i; j < MAX_PLAYER_BULLETS; j++) hideInstance(inst, j)
    inst.count = i
    inst.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh
      ref={mesh}
      args={[geometry, material, MAX_PLAYER_BULLETS]}
      frustumCulled={false}
      castShadow={false}
      receiveShadow={false}
    />
  )
}

function EnemyBulletInstances() {
  // Warm elongated bolt, shape-distinct from cyan player boxes
  const geometry = useMemo(() => new BoxGeometry(0.14, 0.52, 0.14), [])
  const material = useMemo(() => createTokenMaterial('projectileEnemy'), [])
  const mesh = useInstancedPool(MAX_ENEMY_BULLETS)

  useFrame(() => {
    const inst = mesh.current
    if (!inst) return
    const bullets = getWorld().enemyBullets
    let i = 0
    for (const b of bullets) {
      if (!b.active) continue
      const rotZ = Math.atan2(b.vx, b.vy)
      writeInstance(inst, i, b.x, b.y, 0.26, 1, 1, 1, rotZ)
      i++
    }
    for (let j = i; j < MAX_ENEMY_BULLETS; j++) hideInstance(inst, j)
    inst.count = i
    inst.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh
      ref={mesh}
      args={[geometry, material, MAX_ENEMY_BULLETS]}
      frustumCulled={false}
      castShadow={false}
      receiveShadow={false}
    />
  )
}

function EnemyKindInstances({ kind, detail }: { kind: EnemyKind; detail: DetailLevel }) {
  const geometry = useMemo(() => bakeEnemyGeometry(kind, detail), [kind, detail])
  const material = useMemo(() => createEnemyMaterial(kind), [kind])
  const mesh = useInstancedPool(MAX_ENEMIES)

  useLayoutEffect(() => {
    return () => {
      geometry.dispose()
      material.dispose()
    }
  }, [geometry, material])

  useFrame(() => {
    const inst = mesh.current
    if (!inst) return
    const enemies = getWorld().enemies
    let i = 0
    for (const e of enemies) {
      if (!e.active || e.kind !== kind) continue
      writeInstance(inst, i, e.x, e.y, 0.22, 1, 1, 1)
      i++
    }
    for (let j = i; j < MAX_ENEMIES; j++) hideInstance(inst, j)
    inst.count = i
    inst.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh
      ref={mesh}
      args={[geometry, material, MAX_ENEMIES]}
      frustumCulled={false}
      castShadow={false}
      receiveShadow={false}
    />
  )
}

function EnemyInstances({ detail }: { detail: DetailLevel }) {
  return (
    <group>
      {ENEMY_KIND_VISUAL_IDS.map((kind) => (
        <EnemyKindInstances key={`${kind}-${detail}`} kind={kind} detail={detail} />
      ))}
    </group>
  )
}

/** Shape families: sphere, octahedron diamond, box wedge. */
type PowerupShape = 'orb' | 'diamond' | 'wedge'

function PowerupShapePool({
  shape,
  types,
}: {
  shape: PowerupShape
  types: PowerupType[]
}) {
  const geometry = useMemo((): BufferGeometry => {
    if (shape === 'orb') return new SphereGeometry(0.32, 12, 12)
    if (shape === 'diamond') return new OctahedronGeometry(0.34, 0)
    return new BoxGeometry(0.38, 0.28, 0.28)
  }, [shape])

  const material = useMemo(() => {
    const mat = createTokenMaterial('pickupGold')
    mat.vertexColors = true
    return mat
  }, [])

  const mesh = useInstancedPool(MAX_POWERUPS)
  const color = useMemo(() => new Color(), [])
  const typeSet = useMemo(() => new Set(types), [types])

  useLayoutEffect(() => {
    return () => {
      geometry.dispose()
      material.dispose()
    }
  }, [geometry, material])

  useFrame((state) => {
    const inst = mesh.current
    if (!inst) return
    const powerups = getWorld().powerups
    let i = 0
    for (const powerup of powerups) {
      if (!powerup.active || !typeSet.has(powerup.type)) continue
      const spin = state.clock.elapsedTime * 1.8
      writeInstance(inst, i, powerup.x, powerup.y, 0.32, 1, 1, 1, spin)
      color.set(materialToken(POWERUP_TOKENS[powerup.type]).color)
      inst.setColorAt(i, color)
      i++
    }
    for (let j = i; j < MAX_POWERUPS; j++) hideInstance(inst, j)
    inst.count = i
    inst.instanceMatrix.needsUpdate = true
    if (inst.instanceColor) inst.instanceColor.needsUpdate = true
  })

  return <instancedMesh ref={mesh} args={[geometry, material, MAX_POWERUPS]} frustumCulled={false} />
}

function PowerupInstances() {
  return (
    <group>
      <PowerupShapePool shape="orb" types={['shield', 'repair']} />
      <PowerupShapePool shape="diamond" types={['bomb_stock', 'rate_up', 'score_mult']} />
      <PowerupShapePool shape="wedge" types={['spread_up']} />
    </group>
  )
}
