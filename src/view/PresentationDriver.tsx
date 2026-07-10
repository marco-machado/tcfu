import { useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import {
  Color,
  type InstancedMesh,
  MeshBasicMaterial,
  Object3D,
  SphereGeometry,
} from 'three'
import { useSessionStore } from '../app/sessionStore'
import { playSfx } from '../audio/bus'
import { rumbleForEvent } from '../input/rumble'
import { drainPresentation, type PresentationEvent } from '../sim/presentation'
import { getWorld } from '../sim/world'
import { presentationFxState } from '../presentation/fxState'

const MAX_FX = 96
const _proxy = new Object3D()
const _color = new Color()

type FxParticle = {
  active: boolean
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  scale: number
  color: string
}

function spawnBurst(
  pool: FxParticle[],
  x: number,
  y: number,
  count: number,
  color: string,
  speed: number,
  life: number,
  scale: number,
): void {
  let spawned = 0
  for (const p of pool) {
    if (p.active) continue
    const a = Math.random() * Math.PI * 2
    const s = speed * (0.45 + Math.random() * 0.7)
    p.active = true
    p.x = x
    p.y = y
    p.vx = Math.cos(a) * s
    p.vy = Math.sin(a) * s
    p.life = life
    p.maxLife = life
    p.scale = scale * (0.7 + Math.random() * 0.6)
    p.color = color
    spawned += 1
    if (spawned >= count) break
  }
}

function handleEvent(
  pool: FxParticle[],
  event: PresentationEvent,
  particleMult: number,
  playerFlash: { current: number },
  bombPulse: { current: number },
): void {
  const n = (base: number) => Math.max(0, Math.round(base * particleMult))
  switch (event.type) {
    case 'kill':
      spawnBurst(pool, event.x, event.y, n(8), '#ff8844', 4.5, 0.35, 0.2)
      break
    case 'pickup':
      spawnBurst(pool, event.x, event.y, n(6), '#88ff92', 3.2, 0.28, 0.16)
      break
    case 'bomb':
      bombPulse.current = 0.35
      spawnBurst(pool, event.x, event.y, n(14), '#ffeeaa', 7, 0.4, 0.28)
      break
    case 'player_hit':
      playerFlash.current = 0.18
      presentationFxState.hudDamage = 0.45
      spawnBurst(pool, event.x, event.y, n(4), '#e8fbff', 2.5, 0.2, 0.14)
      break
    case 'shield_break':
      playerFlash.current = 0.22
      presentationFxState.hudShieldBreak = 0.55
      spawnBurst(pool, event.x, event.y, n(6), '#78e8ff', 3, 0.25, 0.16)
      break
    case 'life_loss':
      playerFlash.current = 0.25
      presentationFxState.hudLifeLoss = 0.7
      spawnBurst(pool, event.x, event.y, n(8), '#ffccaa', 3.5, 0.3, 0.18)
      break
    case 'death':
      spawnBurst(pool, event.x, event.y, n(16), '#ff9977', 5.5, 0.55, 0.24)
      break
    default:
      break
  }
}

export function PresentationDriver() {
  const mesh = useRef<InstancedMesh>(null)
  const pool = useMemo<FxParticle[]>(
    () =>
      Array.from({ length: MAX_FX }, () => ({
        active: false,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        life: 0,
        maxLife: 1,
        scale: 0.1,
        color: '#fff',
      })),
    [],
  )
  const geometry = useMemo(() => new SphereGeometry(0.12, 6, 6), [])
  const material = useMemo(
    () =>
      new MeshBasicMaterial({
        color: '#ffffff',
        transparent: true,
        opacity: 0.9,
        toneMapped: false,
        vertexColors: true,
      }),
    [],
  )
  const playerFlash = useRef(0)
  const bombPulse = useRef(0)
  const { camera } = useThree()
  const basePos = useRef({ x: 0, y: 5, z: 17 })
  const swayT = useRef(0)

  useFrame((_, delta) => {
    const world = getWorld()
    const settings = useSessionStore.getState().settings
    const quality = settings.quality
    const particleMult = quality === 'high' ? 1.25 : quality === 'medium' ? 1 : 0.35
    const swayOn = quality !== 'low'

    const events = drainPresentation(world.presentation)
    for (const event of events) {
      handleEvent(pool, event, particleMult, playerFlash, bombPulse)
      playSfx(event.type, settings)
      rumbleForEvent(event.type)
    }

    if (playerFlash.current > 0) playerFlash.current = Math.max(0, playerFlash.current - delta)
    if (bombPulse.current > 0) bombPulse.current = Math.max(0, bombPulse.current - delta)
    presentationFxState.hudDamage = Math.max(0, presentationFxState.hudDamage - delta)
    presentationFxState.hudShieldBreak = Math.max(0, presentationFxState.hudShieldBreak - delta)
    presentationFxState.hudLifeLoss = Math.max(0, presentationFxState.hudLifeLoss - delta)

    // Expose flashes on world session via module-level side channel for PlayerMesh
    presentationFxState.playerFlash = playerFlash.current
    presentationFxState.bombPulse = bombPulse.current

    const dt = Math.min(delta, 0.05)
    for (const p of pool) {
      if (!p.active) continue
      p.life -= dt
      if (p.life <= 0) {
        p.active = false
        continue
      }
      p.x += p.vx * dt
      p.y += p.vy * dt
      p.vx *= 0.92
      p.vy *= 0.92
    }

    const inst = mesh.current
    if (inst) {
      let i = 0
      for (const p of pool) {
        if (!p.active) continue
        const t = p.life / p.maxLife
        const s = p.scale * (0.4 + t * 0.8)
        _proxy.position.set(p.x, p.y, 0.4)
        _proxy.scale.setScalar(s)
        _proxy.rotation.set(0, 0, 0)
        _proxy.updateMatrix()
        inst.setMatrixAt(i, _proxy.matrix)
        _color.set(p.color)
        inst.setColorAt(i, _color)
        i += 1
      }
      for (let j = i; j < MAX_FX; j++) {
        _proxy.position.set(0, -200, 0)
        _proxy.scale.setScalar(0)
        _proxy.updateMatrix()
        inst.setMatrixAt(j, _proxy.matrix)
      }
      inst.count = i
      inst.instanceMatrix.needsUpdate = true
      if (inst.instanceColor) inst.instanceColor.needsUpdate = true
    }

    swayT.current += dt
    if (swayOn && !world.session.paused) {
      const a = 0.045
      const t = swayT.current
      camera.position.x = basePos.current.x + Math.sin(t * 0.7) * a
      camera.position.y = basePos.current.y + Math.cos(t * 0.55) * a * 0.6
      camera.position.z = basePos.current.z
      camera.lookAt(Math.sin(t * 0.5) * a * 0.4, 6.5, 0)
    } else {
      camera.position.set(basePos.current.x, basePos.current.y, basePos.current.z)
      camera.lookAt(0, 6.5, 0)
    }
  })

  return (
    <instancedMesh
      ref={mesh}
      args={[geometry, material, MAX_FX]}
      frustumCulled={false}
      castShadow={false}
      receiveShadow={false}
    />
  )
}
