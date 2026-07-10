import { useFrame } from '@react-three/fiber'
import { useLayoutEffect, useMemo, useRef } from 'react'
import {
  BoxGeometry,
  Color,
  type Group,
  type InstancedMesh,
  type Mesh,
  MeshStandardMaterial,
  Object3D,
  SphereGeometry,
} from 'three'
import {
  BAND,
  DEATH_HOLD,
  MAX_ENEMIES,
  MAX_ENEMY_BULLETS,
  MAX_PLAYER_BULLETS,
  MAX_POWERUPS,
  PLAYER_HULL,
} from '../sim/constants'
import type { EnemyKind, PowerupType } from '../sim/types'
import { getWorld } from '../sim/world'

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
  const width = BAND.maxX - BAND.minX
  const height = BAND.maxY - BAND.minY
  const cx = (BAND.minX + BAND.maxX) / 2
  const cy = (BAND.minY + BAND.maxY) / 2
  const bandGeo = useMemo(() => new BoxGeometry(width, height, 0.01), [width, height])

  return (
    <group>
      <mesh position={[0, 8, -0.08]}>
        <planeGeometry args={[28, 48]} />
        <meshStandardMaterial color="#0a1220" metalness={0.2} roughness={0.9} />
      </mesh>

      <mesh position={[cx, cy, -0.02]}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial color="#123048" transparent opacity={0.35} />
      </mesh>

      <lineSegments position={[cx, cy, 0.02]}>
        <edgesGeometry args={[bandGeo]} />
        <lineBasicMaterial color="#3d8ec4" />
      </lineSegments>

      <StreamMarkers />
      <PlayerMesh />
      <DeathBurst />
      <PlayerBulletInstances />
      <EnemyBulletInstances />
      <EnemyInstances />
      <PowerupInstances />
    </group>
  )
}

function StreamMarkers() {
  const group = useRef<Group>(null)

  useFrame((_, delta) => {
    const g = group.current
    if (!g) return
    const speed = getWorld().streamSpeed
    for (const child of g.children) {
      child.position.y -= speed * delta * 0.35
      if (child.position.y < -2) child.position.y += 22
    }
  })

  const markers = []
  for (let i = 0; i < 16; i++) {
    markers.push(
      <mesh key={i} position={[-5 + (i % 4) * 3.3, -1 + Math.floor(i / 4) * 5.5, -0.05]}>
        <boxGeometry args={[0.12, 0.9, 0.12]} />
        <meshStandardMaterial color="#224466" emissive="#113344" emissiveIntensity={0.4} />
      </mesh>,
    )
  }

  return <group ref={group}>{markers}</group>
}

type KitVisual = {
  color: string
  emissive: string
  bodyScaleX: number
  bodyScaleY: number
  wingSpread: number
  wingScale: number
}

const KIT_VISUAL: Record<string, KitVisual> = {
  vanguard: {
    color: '#7fd4ff',
    emissive: '#2a88bb',
    bodyScaleX: 1,
    bodyScaleY: 1,
    wingSpread: 0.38,
    wingScale: 1,
  },
  striker: {
    color: '#ffb070',
    emissive: '#c05020',
    bodyScaleX: 0.85,
    bodyScaleY: 1.25,
    wingSpread: 0.32,
    wingScale: 0.85,
  },
  aegis: {
    color: '#90b8e0',
    emissive: '#3060a0',
    bodyScaleX: 1.25,
    bodyScaleY: 0.95,
    wingSpread: 0.48,
    wingScale: 1.2,
  },
  phantom: {
    color: '#6a7a98',
    emissive: '#304060',
    bodyScaleX: 0.7,
    bodyScaleY: 1.15,
    wingSpread: 0.28,
    wingScale: 0.7,
  },
}

function PlayerMesh() {
  const mesh = useRef<Mesh>(null)
  const wingL = useRef<Mesh>(null)
  const wingR = useRef<Mesh>(null)
  const bodyMat = useRef<MeshStandardMaterial>(null)
  const wingLMat = useRef<MeshStandardMaterial>(null)
  const wingRMat = useRef<MeshStandardMaterial>(null)

  useFrame(() => {
    const world = getWorld()
    const p = world.player
    const dead = world.session.runOver
    const blink = !dead && p.iFrames > 0 && Math.floor(p.iFrames * 20) % 2 === 0
    const visible = !dead && !blink
    const visual = KIT_VISUAL[p.shipId] ?? KIT_VISUAL.vanguard
    const bodyH = PLAYER_HULL.halfH * 1.7 * visual.bodyScaleY
    const bodyW = PLAYER_HULL.halfW * 1.0 * visual.bodyScaleX

    for (const ref of [mesh, wingL, wingR]) {
      const m = ref.current
      if (!m) continue
      m.visible = visible
      m.position.x =
        p.x + (ref === wingL ? -visual.wingSpread : ref === wingR ? visual.wingSpread : 0)
      m.position.y = p.y + (ref === mesh ? 0 : -0.1)
      m.position.z = 0.2
    }
    if (mesh.current) mesh.current.scale.set(bodyW, bodyH, 0.32)
    if (wingL.current) wingL.current.scale.set(0.28 * visual.wingScale, 0.35 * visual.wingScale, 0.12)
    if (wingR.current) wingR.current.scale.set(0.28 * visual.wingScale, 0.35 * visual.wingScale, 0.12)
    for (const mat of [bodyMat.current, wingLMat.current, wingRMat.current]) {
      if (!mat) continue
      mat.color.set(visual.color)
      mat.emissive.set(visual.emissive)
    }
  })

  return (
    <group>
      <mesh ref={mesh} position={[0, 3.5, 0.2]} scale={[1, 1, 0.32]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          ref={bodyMat}
          color="#7fd4ff"
          emissive="#2a88bb"
          emissiveIntensity={0.75}
          metalness={0.45}
          roughness={0.3}
        />
      </mesh>
      <mesh ref={wingL} position={[-0.38, 3.4, 0.2]} scale={[0.28, 0.35, 0.12]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          ref={wingLMat}
          color="#5eb8e8"
          emissive="#1a6a99"
          emissiveIntensity={0.5}
          metalness={0.4}
          roughness={0.35}
        />
      </mesh>
      <mesh ref={wingR} position={[0.38, 3.4, 0.2]} scale={[0.28, 0.35, 0.12]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          ref={wingRMat}
          color="#5eb8e8"
          emissive="#1a6a99"
          emissiveIntensity={0.5}
          metalness={0.4}
          roughness={0.35}
        />
      </mesh>
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

function useInstancedPool(
  count: number,
  geometry: BoxGeometry | SphereGeometry,
  material: MeshStandardMaterial,
) {
  const mesh = useRef<InstancedMesh>(null)

  useLayoutEffect(() => {
    const inst = mesh.current
    if (!inst) return
    for (let i = 0; i < count; i++) hideInstance(inst, i)
    inst.instanceMatrix.needsUpdate = true
    inst.computeBoundingSphere()
  }, [count])

  return { mesh, geometry, material }
}

function PlayerBulletInstances() {
  const geometry = useMemo(() => new SphereGeometry(0.14, 10, 10), [])
  const material = useMemo(
    () =>
      new MeshStandardMaterial({
        color: '#e8fbff',
        emissive: '#66d0ff',
        emissiveIntensity: 1.6,
        metalness: 0.15,
        roughness: 0.25,
        toneMapped: false,
      }),
    [],
  )
  const { mesh } = useInstancedPool(MAX_PLAYER_BULLETS, geometry, material)

  useFrame(() => {
    const inst = mesh.current
    if (!inst) return
    const bullets = getWorld().playerBullets
    let i = 0
    for (const b of bullets) {
      if (!b.active) continue
      writeInstance(inst, i, b.x, b.y, 0.28, 1, 1.4, 1)
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
  const geometry = useMemo(() => new SphereGeometry(0.16, 10, 10), [])
  const material = useMemo(
    () =>
      new MeshStandardMaterial({
        color: '#ff9977',
        emissive: '#ff4422',
        emissiveIntensity: 1.5,
        metalness: 0.15,
        roughness: 0.3,
        toneMapped: false,
      }),
    [],
  )
  const { mesh } = useInstancedPool(MAX_ENEMY_BULLETS, geometry, material)

  useFrame(() => {
    const inst = mesh.current
    if (!inst) return
    const bullets = getWorld().enemyBullets
    let i = 0
    for (const b of bullets) {
      if (!b.active) continue
      writeInstance(inst, i, b.x, b.y, 0.26, 1, 1, 1)
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

type KindVisual = {
  color: string
  emissive: string
  sx: number
  sy: number
  sz: number
}

const KIND_VISUAL: Record<EnemyKind, KindVisual> = {
  drone: { color: '#e87840', emissive: '#a03010', sx: 0.85, sy: 0.7, sz: 0.4 },
  dart: { color: '#f0c040', emissive: '#a07010', sx: 0.45, sy: 1.05, sz: 0.3 },
  gunner: { color: '#d04050', emissive: '#801020', sx: 1.15, sy: 0.9, sz: 0.5 },
  sidecar: { color: '#e06090', emissive: '#901040', sx: 1.2, sy: 0.75, sz: 0.45 },
  razor: { color: '#c050ff', emissive: '#7010b0', sx: 1.35, sy: 1.1, sz: 0.55 },
  prism: { color: '#50e0d0', emissive: '#108070', sx: 1.3, sy: 1.3, sz: 0.55 },
  colossus: { color: '#ff6060', emissive: '#a01010', sx: 2.0, sy: 1.2, sz: 0.7 },
}

function EnemyKindInstances({ kind }: { kind: EnemyKind }) {
  const visual = KIND_VISUAL[kind]
  const geometry = useMemo(() => new BoxGeometry(1, 1, 1), [])
  const material = useMemo(
    () =>
      new MeshStandardMaterial({
        color: visual.color,
        emissive: visual.emissive,
        emissiveIntensity: 0.85,
        metalness: 0.35,
        roughness: 0.4,
        toneMapped: false,
      }),
    [visual.color, visual.emissive],
  )
  const { mesh } = useInstancedPool(MAX_ENEMIES, geometry, material)

  useFrame(() => {
    const inst = mesh.current
    if (!inst) return
    const enemies = getWorld().enemies
    let i = 0
    for (const e of enemies) {
      if (!e.active || e.kind !== kind) continue
      writeInstance(inst, i, e.x, e.y, 0.22, visual.sx, visual.sy, visual.sz)
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

function EnemyInstances() {
  return (
    <group>
      <EnemyKindInstances kind="drone" />
      <EnemyKindInstances kind="dart" />
      <EnemyKindInstances kind="gunner" />
      <EnemyKindInstances kind="sidecar" />
      <EnemyKindInstances kind="razor" />
      <EnemyKindInstances kind="prism" />
      <EnemyKindInstances kind="colossus" />
    </group>
  )
}

function PowerupInstances() {
  const geometry = useMemo(() => new SphereGeometry(0.32, 12, 12), [])
  const material = useMemo(
    () =>
      new MeshStandardMaterial({
        color: '#ffdc62',
        emissive: '#dca318',
        emissiveIntensity: 1.5,
        metalness: 0.3,
        roughness: 0.25,
        toneMapped: false,
        vertexColors: true,
      }),
    [],
  )
  const { mesh } = useInstancedPool(MAX_POWERUPS, geometry, material)

  const color = useMemo(() => new Color(), [])

  useFrame((state) => {
    const inst = mesh.current
    if (!inst) return
    const powerups = getWorld().powerups
    let i = 0
    for (const powerup of powerups) {
      if (!powerup.active) continue
      writeInstance(inst, i, powerup.x, powerup.y, 0.32, 1, 1, 1, state.clock.elapsedTime * 1.8)
      color.set(POWERUP_COLORS[powerup.type])
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

const POWERUP_COLORS: Record<PowerupType, string> = {
  shield: '#78e8ff',
  bomb_stock: '#ffca50',
  repair: '#88ff92',
  rate_up: '#ffe66b',
  spread_up: '#e18cff',
  score_mult: '#ffd85c',
}
