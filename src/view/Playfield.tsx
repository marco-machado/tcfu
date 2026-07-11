import { useFrame } from '@react-three/fiber'
import { useLayoutEffect, useMemo, useRef } from 'react'
import {
  AdditiveBlending,
  BoxGeometry,
  Color,
  type Group,
  type InstancedMesh,
  MeshBasicMaterial,
  Object3D,
  PlaneGeometry,
} from 'three'
import { useSessionStore } from '../app/sessionStore'
import {
  BAND,
  DEATH_HOLD,
  MAGNET_RADIUS,
  MAX_ENEMIES,
  MAX_ENEMY_BULLETS,
  MAX_PLAYER_BULLETS,
  MAX_POWERUPS,
} from '../sim/constants'
import type { Enemy, EnemyKind, PowerupType } from '../sim/types'
import { getWorld } from '../sim/world'
import { bakeParts, type GeoPart } from './procedural/bakeGeometry'
import { createTokenMaterial } from './procedural/createMaterial'
import {
  bakeEnemyAccentGeometry,
  bakeEnemyGeometry,
  createEnemyAccentMaterial,
  createEnemyMaterial,
} from './procedural/enemyGeometry'
import { getSoftGlowTexture } from './procedural/ProceduralTextures'
import { materialToken } from './procedural/materialTokens'
import { WorldCorridor } from './procedural/WorldCorridor'
import {
  detailFromQuality,
  type DetailLevel,
  ENEMY_KIND_VISUAL_IDS,
  POWERUP_TOKENS,
} from './procedural/registry'
import { ShipKitVisual } from './procedural/ShipKitVisual'

const _proxy = new Object3D()
const _color = new Color()
const HALF = Math.PI / 2

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
      <WorldCorridor detail={detail} />

      {/* Movement-band chrome only — not physical corridor walls */}
      <mesh position={[cx, cy, -0.02]}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial color="#071019" transparent opacity={0.1} />
      </mesh>

      <lineSegments position={[cx, cy, 0.02]}>
        <edgesGeometry args={[bandGeo]} />
        <lineBasicMaterial color="#2a6a88" transparent opacity={0.4} />
      </lineSegments>

      <PlayerMesh detail={detail} />
      <DeathBurst />
      <PlayerBulletInstances />
      <EnemyBulletInstances />
      <EnemyInstances detail={detail} />
      <TelegraphGlows />
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
      <pointLight position={[0, 0.2, 1.1]} intensity={3.6} distance={3.6} color="#a8ddff" />
      <pointLight position={[0, 0.9, 0.5]} intensity={1.4} distance={2.4} color="#cfeaff" />
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

function useGlowMaterial(color: string, opacity: number) {
  const material = useMemo(
    () =>
      new MeshBasicMaterial({
        map: getSoftGlowTexture(),
        color,
        transparent: true,
        opacity,
        blending: AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
      }),
    [color, opacity],
  )
  useLayoutEffect(() => () => material.dispose(), [material])
  return material
}

function PlayerBulletInstances() {
  const geometry = useMemo(() => new BoxGeometry(0.08, 0.66, 0.08), [])
  const glowGeo = useMemo(() => new PlaneGeometry(0.26, 0.9), [])
  const material = useMemo(() => createTokenMaterial('projectilePlayer'), [])
  const glowMaterial = useGlowMaterial('#2a90e8', 0.4)
  const mesh = useInstancedPool(MAX_PLAYER_BULLETS)
  const glow = useInstancedPool(MAX_PLAYER_BULLETS)

  useFrame(() => {
    const inst = mesh.current
    const glowInst = glow.current
    if (!inst || !glowInst) return
    const bullets = getWorld().playerBullets
    let i = 0
    for (const b of bullets) {
      if (!b.active) continue
      const rotZ = Math.atan2(-b.vx, b.vy)
      writeInstance(inst, i, b.x, b.y, 0.28, 1, 1, 1, rotZ)
      writeInstance(glowInst, i, b.x, b.y, 0.26, 1, 1, 1, rotZ)
      i++
    }
    for (let j = i; j < MAX_PLAYER_BULLETS; j++) {
      hideInstance(inst, j)
      hideInstance(glowInst, j)
    }
    inst.count = i
    glowInst.count = i
    inst.instanceMatrix.needsUpdate = true
    glowInst.instanceMatrix.needsUpdate = true
  })

  return (
    <>
      <instancedMesh ref={mesh} args={[geometry, material, MAX_PLAYER_BULLETS]} frustumCulled={false} />
      <instancedMesh ref={glow} args={[glowGeo, glowMaterial, MAX_PLAYER_BULLETS]} frustumCulled={false} />
    </>
  )
}

function EnemyBulletInstances() {
  // Hot plasma bolt: warm core plus additive halo, shape-distinct from player bolts
  const geometry = useMemo(() => {
    const g = bakeParts([
      { kind: 'octahedron', r: 0.13, sy: 1.9 },
    ])
    return g
  }, [])
  const glowGeo = useMemo(() => new PlaneGeometry(0.62, 0.62), [])
  const material = useMemo(() => {
    const m = createTokenMaterial('projectileEnemy')
    m.emissiveIntensity = 2
    return m
  }, [])
  const glowMaterial = useGlowMaterial('#ff5a30', 0.7)
  const mesh = useInstancedPool(MAX_ENEMY_BULLETS)
  const glow = useInstancedPool(MAX_ENEMY_BULLETS)

  useFrame(() => {
    const inst = mesh.current
    const glowInst = glow.current
    if (!inst || !glowInst) return
    const bullets = getWorld().enemyBullets
    let i = 0
    for (const b of bullets) {
      if (!b.active) continue
      const rotZ = Math.atan2(-b.vx, b.vy)
      writeInstance(inst, i, b.x, b.y, 0.26, 1, 1, 1, rotZ)
      writeInstance(glowInst, i, b.x, b.y, 0.24, 1, 1, 1, 0)
      i++
    }
    for (let j = i; j < MAX_ENEMY_BULLETS; j++) {
      hideInstance(inst, j)
      hideInstance(glowInst, j)
    }
    inst.count = i
    glowInst.count = i
    inst.instanceMatrix.needsUpdate = true
    glowInst.instanceMatrix.needsUpdate = true
  })

  return (
    <>
      <instancedMesh ref={mesh} args={[geometry, material, MAX_ENEMY_BULLETS]} frustumCulled={false} />
      <instancedMesh ref={glow} args={[glowGeo, glowMaterial, MAX_ENEMY_BULLETS]} frustumCulled={false} />
    </>
  )
}

/** Class hull tint (multiplies the hostile hull material color). */
const CLASS_TINT: Record<Enemy['class'], [number, number, number]> = {
  fodder: [1.3, 1.18, 1.05],
  grunt: [1, 0.95, 1.05],
  elite: [0.85, 0.68, 0.95],
  set_piece: [0.7, 0.64, 0.74],
}

function enemyIdleRotation(kind: EnemyKind, id: number, t: number): number {
  switch (kind) {
    case 'prism':
      return t * 1.1 + id * 0.7
    case 'drone':
      return Math.sin(t * 3 + id) * 0.16
    case 'razor':
      return Math.sin(t * 1.8 + id) * 0.09
    case 'colossus':
      return Math.sin(t * 0.7) * 0.02
    default:
      return 0
  }
}

function EnemyKindInstances({ kind, detail }: { kind: EnemyKind; detail: DetailLevel }) {
  const geometry = useMemo(() => bakeEnemyGeometry(kind, detail), [kind, detail])
  const accentGeometry = useMemo(() => bakeEnemyAccentGeometry(kind), [kind])
  const material = useMemo(() => createEnemyMaterial(kind), [kind])
  const accentMaterial = useMemo(() => createEnemyAccentMaterial(kind), [kind])
  const mesh = useInstancedPool(MAX_ENEMIES)
  const accent = useInstancedPool(MAX_ENEMIES)

  useLayoutEffect(() => {
    return () => {
      geometry.dispose()
      accentGeometry.dispose()
      material.dispose()
      accentMaterial.dispose()
    }
  }, [geometry, accentGeometry, material, accentMaterial])

  useFrame((state) => {
    const inst = mesh.current
    const accInst = accent.current
    if (!inst || !accInst) return
    const t = state.clock.elapsedTime
    const enemies = getWorld().enemies
    let i = 0
    for (const e of enemies) {
      if (!e.active || e.kind !== kind) continue
      const rotZ = enemyIdleRotation(kind, e.id, t)
      writeInstance(inst, i, e.x, e.y, 0.22, 1, 1, 1, rotZ)
      writeInstance(accInst, i, e.x, e.y, 0.23, 1, 1, 1, rotZ)
      const tint = CLASS_TINT[e.class]
      const flash = e.hitFlash > 0 ? e.hitFlash / 0.09 : 0
      _color.setRGB(
        tint[0] + flash * 2.2,
        tint[1] + flash * 2.2,
        tint[2] + flash * 2.2,
      )
      inst.setColorAt(i, _color)
      i++
    }
    for (let j = i; j < MAX_ENEMIES; j++) {
      hideInstance(inst, j)
      hideInstance(accInst, j)
    }
    inst.count = i
    accInst.count = i
    inst.instanceMatrix.needsUpdate = true
    accInst.instanceMatrix.needsUpdate = true
    if (inst.instanceColor) inst.instanceColor.needsUpdate = true
  })

  return (
    <>
      <instancedMesh
        ref={mesh}
        args={[geometry, material, MAX_ENEMIES]}
        frustumCulled={false}
      />
      <instancedMesh
        ref={accent}
        args={[accentGeometry, accentMaterial, MAX_ENEMIES]}
        frustumCulled={false}
      />
    </>
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

const TELEGRAPH_TIME = 0.45

/** Muzzle offset (local Y) where the pre-fire charge glow appears. */
const MUZZLE_Y: Partial<Record<EnemyKind, number>> = {
  dart: -0.55,
  gunner: -0.72,
  sidecar: 0,
  razor: -0.35,
  prism: 0,
  colossus: -0.65,
}

function TelegraphGlows() {
  const geometry = useMemo(() => new PlaneGeometry(1, 1), [])
  const material = useGlowMaterial('#ffffff', 0.9)
  const mesh = useInstancedPool(MAX_ENEMIES)

  useFrame(() => {
    const inst = mesh.current
    if (!inst) return
    const enemies = getWorld().enemies
    let i = 0
    for (const e of enemies) {
      if (!e.active || e.fireInterval <= 0 || e.shotStyle === 'none') continue
      if (e.shotStyle === 'boss_spray' && e.phase !== 'spray') continue
      if (e.fireCooldown > TELEGRAPH_TIME) continue
      const charge = 1 - e.fireCooldown / TELEGRAPH_TIME
      const size = (0.28 + charge * 0.55) * (e.kind === 'colossus' ? 1.7 : 1)
      writeInstance(inst, i, e.x, e.y + (MUZZLE_Y[e.kind] ?? 0), 0.3, size, size, 1)
      _color.setRGB(1, 0.45 + charge * 0.5, 0.25 + charge * 0.6)
      inst.setColorAt(i, _color)
      i++
      if (i >= MAX_ENEMIES) break
    }
    for (let j = i; j < MAX_ENEMIES; j++) hideInstance(inst, j)
    inst.count = i
    inst.instanceMatrix.needsUpdate = true
    if (inst.instanceColor) inst.instanceColor.needsUpdate = true
  })

  return (
    <instancedMesh ref={mesh} args={[geometry, material, MAX_ENEMIES]} frustumCulled={false} />
  )
}

/* -------------------------------- Powerups ------------------------------- */

type PowerupRecipe = {
  hull: GeoPart[]
  accent: GeoPart[]
  spin: number
}

const POWERUP_RECIPES: Record<PowerupType, PowerupRecipe> = {
  shield: {
    // Aegis ring: torus shell with hex emitter core
    hull: [
      { kind: 'torus', r: 0.3, tube: 0.055, radialSeg: 6, tubularSeg: 22 },
      { kind: 'box', sx: 0.1, sy: 0.1, sz: 0.08, y: 0.32 },
      { kind: 'box', sx: 0.1, sy: 0.1, sz: 0.08, y: -0.32 },
    ],
    accent: [
      { kind: 'cylinder', rTop: 0.14, rBottom: 0.14, height: 0.08, rotX: HALF, radialSeg: 6 },
    ],
    spin: 0.9,
  },
  repair: {
    // Nanite capsule: shell brackets around a glowing cross
    hull: [
      { kind: 'box', sx: 0.12, sy: 0.44, sz: 0.12, x: -0.24 },
      { kind: 'box', sx: 0.12, sy: 0.44, sz: 0.12, x: 0.24 },
      { kind: 'box', sx: 0.42, sy: 0.1, sz: 0.12, y: 0.24 },
      { kind: 'box', sx: 0.42, sy: 0.1, sz: 0.12, y: -0.24 },
    ],
    accent: [
      { kind: 'box', sx: 0.34, sy: 0.12, sz: 0.1 },
      { kind: 'box', sx: 0.12, sy: 0.34, sz: 0.1 },
    ],
    spin: 0,
  },
  bomb_stock: {
    // Warhead: finned sphere with hot core seam
    hull: [
      { kind: 'sphere', r: 0.26, wSeg: 10, hSeg: 8 },
      { kind: 'box', sx: 0.08, sy: 0.3, sz: 0.16, y: -0.3 },
      { kind: 'box', sx: 0.16, sy: 0.3, sz: 0.08, y: -0.3 },
      { kind: 'cylinder', rTop: 0.06, rBottom: 0.1, height: 0.12, y: 0.3, radialSeg: 6 },
    ],
    accent: [
      { kind: 'box', sx: 0.56, sy: 0.07, sz: 0.07 },
      { kind: 'sphere', r: 0.07, y: 0.38, wSeg: 6, hSeg: 5 },
    ],
    spin: 0.6,
  },
  rate_up: {
    // Overclock: stacked chevrons pointing up-stream
    hull: [
      { kind: 'box', sx: 0.34, sy: 0.12, sz: 0.1, x: -0.14, y: 0.1, rotZ: 0.6 },
      { kind: 'box', sx: 0.34, sy: 0.12, sz: 0.1, x: 0.14, y: 0.1, rotZ: -0.6 },
      { kind: 'box', sx: 0.34, sy: 0.12, sz: 0.1, x: -0.14, y: -0.16, rotZ: 0.6 },
      { kind: 'box', sx: 0.34, sy: 0.12, sz: 0.1, x: 0.14, y: -0.16, rotZ: -0.6 },
    ],
    accent: [
      { kind: 'box', sx: 0.3, sy: 0.05, sz: 0.11, x: -0.12, y: 0.14, rotZ: 0.6 },
      { kind: 'box', sx: 0.3, sy: 0.05, sz: 0.11, x: 0.12, y: 0.14, rotZ: -0.6 },
    ],
    spin: 0,
  },
  spread_up: {
    // Options fan: hub with three angled emitter blades
    hull: [
      { kind: 'cylinder', rTop: 0.12, rBottom: 0.12, height: 0.1, rotX: HALF, radialSeg: 8 },
      { kind: 'box', sx: 0.1, sy: 0.4, sz: 0.08, y: 0.24 },
      { kind: 'box', sx: 0.1, sy: 0.4, sz: 0.08, x: -0.2, y: 0.16, rotZ: 0.55 },
      { kind: 'box', sx: 0.1, sy: 0.4, sz: 0.08, x: 0.2, y: 0.16, rotZ: -0.55 },
    ],
    accent: [
      { kind: 'sphere', r: 0.06, y: 0.44, wSeg: 6, hSeg: 5 },
      { kind: 'sphere', r: 0.06, x: -0.32, y: 0.32, wSeg: 6, hSeg: 5 },
      { kind: 'sphere', r: 0.06, x: 0.32, y: 0.32, wSeg: 6, hSeg: 5 },
    ],
    spin: 0,
  },
  score_mult: {
    // Bounty gem: faceted crystal in a bracket ring
    hull: [
      { kind: 'torus', r: 0.32, tube: 0.035, rotX: 0.5, radialSeg: 5, tubularSeg: 18 },
    ],
    accent: [
      { kind: 'octahedron', r: 0.22, sy: 1.35 },
    ],
    spin: 1.6,
  },
}

function PowerupTypePool({ type }: { type: PowerupType }) {
  const recipe = POWERUP_RECIPES[type]
  const hullGeo = useMemo(() => bakeParts(recipe.hull), [recipe])
  const accentGeo = useMemo(() => bakeParts(recipe.accent), [recipe])
  const hullMaterial = useMemo(() => {
    const m = createTokenMaterial('nozzleMetal')
    m.metalness = 0.85
    m.roughness = 0.3
    m.color.set('#4a5a6c')
    return m
  }, [])
  const accentMaterial = useMemo(() => {
    const m = createTokenMaterial(POWERUP_TOKENS[type])
    m.emissiveIntensity = Math.max(1.8, m.emissiveIntensity)
    m.toneMapped = false
    return m
  }, [type])
  const hull = useInstancedPool(MAX_POWERUPS)
  const accent = useInstancedPool(MAX_POWERUPS)

  useLayoutEffect(() => {
    return () => {
      hullGeo.dispose()
      accentGeo.dispose()
      hullMaterial.dispose()
      accentMaterial.dispose()
    }
  }, [hullGeo, accentGeo, hullMaterial, accentMaterial])

  useFrame((state) => {
    const hullInst = hull.current
    const accInst = accent.current
    if (!hullInst || !accInst) return
    const world = getWorld()
    const t = state.clock.elapsedTime
    const p = world.player
    let i = 0
    for (const powerup of world.powerups) {
      if (!powerup.active || powerup.type !== type) continue
      const bob = Math.sin(t * 2.2 + powerup.id * 2) * 0.05
      const dist = Math.hypot(p.x - powerup.x, p.y - powerup.y)
      const attracted = dist < MAGNET_RADIUS
      const pulse = attracted ? 1.18 + Math.sin(t * 10) * 0.08 : 1
      const rotZ = recipe.spin === 0 ? Math.sin(t * 1.6 + powerup.id) * 0.18 : t * recipe.spin
      writeInstance(hullInst, i, powerup.x, powerup.y + bob, 0.32, pulse, pulse, pulse, rotZ)
      writeInstance(accInst, i, powerup.x, powerup.y + bob, 0.33, pulse, pulse, pulse, rotZ)
      i++
    }
    for (let j = i; j < MAX_POWERUPS; j++) {
      hideInstance(hullInst, j)
      hideInstance(accInst, j)
    }
    hullInst.count = i
    accInst.count = i
    hullInst.instanceMatrix.needsUpdate = true
    accInst.instanceMatrix.needsUpdate = true
  })

  return (
    <>
      <instancedMesh ref={hull} args={[hullGeo, hullMaterial, MAX_POWERUPS]} frustumCulled={false} />
      <instancedMesh ref={accent} args={[accentGeo, accentMaterial, MAX_POWERUPS]} frustumCulled={false} />
    </>
  )
}

function PowerupHalos() {
  const geometry = useMemo(() => new PlaneGeometry(1, 1), [])
  const material = useGlowMaterial('#ffffff', 0.5)
  const mesh = useInstancedPool(MAX_POWERUPS)

  useFrame((state) => {
    const inst = mesh.current
    if (!inst) return
    const world = getWorld()
    const t = state.clock.elapsedTime
    let i = 0
    for (const powerup of world.powerups) {
      if (!powerup.active) continue
      const size = 1 + Math.sin(t * 3 + powerup.id) * 0.12
      writeInstance(inst, i, powerup.x, powerup.y, 0.28, size, size, 1)
      _color.set(materialToken(POWERUP_TOKENS[powerup.type]).emissive)
      inst.setColorAt(i, _color)
      i++
    }
    for (let j = i; j < MAX_POWERUPS; j++) hideInstance(inst, j)
    inst.count = i
    inst.instanceMatrix.needsUpdate = true
    if (inst.instanceColor) inst.instanceColor.needsUpdate = true
  })

  return (
    <instancedMesh ref={mesh} args={[geometry, material, MAX_POWERUPS]} frustumCulled={false} />
  )
}

const POWERUP_TYPE_LIST: PowerupType[] = [
  'shield',
  'bomb_stock',
  'repair',
  'rate_up',
  'spread_up',
  'score_mult',
]

function PowerupInstances() {
  return (
    <group>
      <PowerupHalos />
      {POWERUP_TYPE_LIST.map((type) => (
        <PowerupTypePool key={type} type={type} />
      ))}
    </group>
  )
}
