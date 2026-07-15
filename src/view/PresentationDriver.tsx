import { useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import {
  AdditiveBlending,
  BoxGeometry,
  Color,
  type InstancedMesh,
  MeshBasicMaterial,
  Object3D,
  type PerspectiveCamera,
  RingGeometry,
} from 'three'
import { useSessionStore } from '../app/sessionStore'
import { playSfx } from '../audio/bus'
import { rumbleForEvent } from '../input/rumble'
import { CAMERA_FOV, CAMERA_FOV_MAX, CAMERA_LOOK_AT, CAMERA_POS, STREAM_BASE_SPEED } from '../sim/constants'
import { drainPresentation, type PresentationEvent } from '../sim/presentation'
import { getWorld } from '../sim/world'
import { presentationFxState, triggerHitstop } from '../presentation/fxState'
import { debugCameraLive, debugCameraOverride } from '../presentation/debugCamera'
import { runCameraDirection, runCameraSway } from '../presentation/runCameraDirection'
import { isDebugMode } from '../app/debugMode'

const MAX_FX = 128
const MAX_RINGS = 24
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
  stretch: number
  color: string
}

type FxRing = {
  active: boolean
  x: number
  y: number
  life: number
  maxLife: number
  fromScale: number
  toScale: number
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
  stretch = 1,
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
    p.stretch = stretch
    p.color = color
    spawned += 1
    if (spawned >= count) break
  }
}

function spawnRing(
  rings: FxRing[],
  x: number,
  y: number,
  color: string,
  life: number,
  fromScale: number,
  toScale: number,
): void {
  for (const r of rings) {
    if (r.active) continue
    r.active = true
    r.x = x
    r.y = y
    r.life = life
    r.maxLife = life
    r.fromScale = fromScale
    r.toScale = toScale
    r.color = color
    return
  }
}

type FxRefs = {
  playerFlash: { current: number }
  bombPulse: { current: number }
  trauma: { current: number }
  fovPunch: { current: number }
}

function handleEvent(
  pool: FxParticle[],
  rings: FxRing[],
  event: PresentationEvent,
  particleMult: number,
  refs: FxRefs,
): void {
  const n = (base: number) => Math.max(0, Math.round(base * particleMult))
  const addTrauma = (amount: number) => {
    refs.trauma.current = Math.min(1, refs.trauma.current + amount)
  }
  switch (event.type) {
    case 'kill':
      spawnBurst(pool, event.x, event.y, n(10), '#ff8844', 4.5, 0.4, 0.16, 2.2)
      spawnBurst(pool, event.x, event.y, n(4), '#5a3a2c', 3, 0.55, 0.14)
      spawnRing(rings, event.x, event.y, '#ff9a55', 0.32, 0.12, 1.05)
      addTrauma(0.08)
      break
    case 'pickup':
      spawnBurst(pool, event.x, event.y, n(7), '#a8ffc0', 3.2, 0.3, 0.12, 1.6)
      spawnRing(rings, event.x, event.y, '#7dffb0', 0.3, 0.7, 0.05)
      addTrauma(0.05)
      break
    case 'bomb':
      refs.bombPulse.current = 0.35
      spawnBurst(pool, event.x, event.y, n(18), '#ffeeaa', 7.5, 0.45, 0.22, 2)
      spawnRing(rings, event.x, event.y, '#ffe9a0', 0.55, 0.2, 6.5)
      spawnRing(rings, event.x, event.y, '#8adfff', 0.4, 0.1, 4)
      addTrauma(0.42)
      refs.fovPunch.current = Math.min(10, refs.fovPunch.current + 5)
      triggerHitstop(0.045, 0.12)
      break
    case 'player_hit':
      refs.playerFlash.current = 0.18
      presentationFxState.hudDamage = 0.45
      spawnBurst(pool, event.x, event.y, n(6), '#e8fbff', 2.8, 0.24, 0.13, 1.8)
      spawnRing(rings, event.x, event.y, '#ff6a6a', 0.28, 0.15, 1.4)
      addTrauma(0.34)
      break
    case 'shield_break':
      refs.playerFlash.current = 0.22
      presentationFxState.hudShieldBreak = 0.55
      spawnBurst(pool, event.x, event.y, n(9), '#78e8ff', 3.4, 0.3, 0.14, 1.8)
      spawnRing(rings, event.x, event.y, '#66e0ff', 0.4, 0.3, 2.2)
      addTrauma(0.25)
      break
    case 'life_loss':
      refs.playerFlash.current = 0.25
      presentationFxState.hudLifeLoss = 0.7
      spawnBurst(pool, event.x, event.y, n(10), '#ffccaa', 3.8, 0.36, 0.16, 2)
      spawnRing(rings, event.x, event.y, '#ff8a5a', 0.5, 0.2, 3)
      addTrauma(0.5)
      refs.fovPunch.current = Math.min(10, refs.fovPunch.current + 4)
      triggerHitstop(0.07, 0.08)
      break
    case 'death':
      spawnBurst(pool, event.x, event.y, n(20), '#ff9977', 6, 0.6, 0.2, 2)
      spawnBurst(pool, event.x, event.y, n(8), '#ffe4b8', 4, 0.5, 0.14, 1.5)
      spawnRing(rings, event.x, event.y, '#ff7755', 0.7, 0.2, 5)
      addTrauma(0.7)
      refs.fovPunch.current = Math.min(12, refs.fovPunch.current + 6)
      break
    case 'graze':
      presentationFxState.hudGraze = 0.3
      spawnBurst(pool, event.x, event.y, n(2), '#bff2ff', 2.2, 0.18, 0.08, 2.6)
      break
    case 'combo_break':
      presentationFxState.hudComboBreak = 0.6
      break
    case 'tier_up':
      presentationFxState.hudTierUp = 1.2
      spawnRing(rings, event.x, event.y, '#6ee7ff', 0.5, 0.2, 2.6)
      spawnBurst(pool, event.x, event.y, n(8), '#8ae4ff', 3, 0.4, 0.12, 1.8)
      refs.fovPunch.current = Math.min(10, refs.fovPunch.current + 2.5)
      break
    case 'wave_clear':
      presentationFxState.hudWaveClear = 1.4
      spawnRing(rings, event.x, event.y, '#9adfff', 0.6, 0.4, 3.6)
      refs.fovPunch.current = Math.min(10, refs.fovPunch.current + 2)
      break
    default:
      break
  }
}

/**
 * Widen the vertical FOV on narrow viewports so the full band (designed for
 * a 4:3 frame) stays horizontally visible on portrait phones.
 */
function baseFovForAspect(aspect: number): number {
  const designAspect = 4 / 3
  if (aspect >= designAspect) return CAMERA_FOV
  const t = (Math.tan((CAMERA_FOV * Math.PI) / 360) * designAspect) / aspect
  return Math.min((Math.atan(t) * 360) / Math.PI, CAMERA_FOV_MAX)
}

/** Deterministic value noise in [-1, 1]; per-axis seed keeps axes independent. */
function pseudoNoise(t: number, seed: number): number {
  const x = Math.sin(t * 12.9898 + seed * 78.233) * 43758.5453
  return (x - Math.floor(x)) * 2 - 1
}

const EMPTY_OVERRIDE: typeof debugCameraOverride = {
  fov: null,
  posX: null,
  posY: null,
  posZ: null,
  lookX: null,
  lookY: null,
  lookZ: null,
}

const TRAUMA_DECAY = 1.5
const MAX_SHAKE_OFFSET = 0.4
const MAX_SHAKE_ROLL = 0.045

export function PresentationDriver() {
  const mesh = useRef<InstancedMesh>(null)
  const ringMesh = useRef<InstancedMesh>(null)
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
        stretch: 1,
        color: '#fff',
      })),
    [],
  )
  const rings = useMemo<FxRing[]>(
    () =>
      Array.from({ length: MAX_RINGS }, () => ({
        active: false,
        x: 0,
        y: 0,
        life: 0,
        maxLife: 1,
        fromScale: 0.1,
        toScale: 1,
        color: '#fff',
      })),
    [],
  )
  const geometry = useMemo(() => new BoxGeometry(0.14, 0.14, 0.14), [])
  const ringGeometry = useMemo(() => new RingGeometry(0.42, 0.5, 28), [])
  const material = useMemo(
    () =>
      new MeshBasicMaterial({
        color: '#ffffff',
        transparent: true,
        opacity: 0.92,
        toneMapped: false,
        vertexColors: true,
      }),
    [],
  )
  const ringMaterial = useMemo(
    () =>
      new MeshBasicMaterial({
        color: '#ffffff',
        transparent: true,
        opacity: 0.85,
        toneMapped: false,
        blending: AdditiveBlending,
        depthWrite: false,
        vertexColors: true,
      }),
    [],
  )
  const playerFlash = useRef(0)
  const bombPulse = useRef(0)
  const trauma = useRef(0)
  const fovPunch = useRef(0)
  const shakeTime = useRef(0)
  const { camera } = useThree()
  const basePos = useRef({ x: CAMERA_POS.x, y: CAMERA_POS.y, z: CAMERA_POS.z })
  const lookAt = useRef({ x: CAMERA_LOOK_AT.x, y: CAMERA_LOOK_AT.y, z: CAMERA_LOOK_AT.z })
  const directedFovOffset = useRef(0)
  const cameraRigReady = useRef(false)
  const swayT = useRef(0)

  useFrame((_, delta) => {
    const world = getWorld()
    const settings = useSessionStore.getState().settings
    const quality = settings.quality
    const particleMult = quality === 'high' ? 1.25 : quality === 'medium' ? 1 : 0.4
    const swayOn = quality !== 'low' && !settings.reducedMotion
    const shakeOn = settings.screenShake && !settings.reducedMotion

    const refs: FxRefs = { playerFlash, bombPulse, trauma, fovPunch }
    const events = drainPresentation(world.presentation)
    for (const event of events) {
      handleEvent(pool, rings, event, particleMult, refs)
      playSfx(event.type, settings)
      rumbleForEvent(event.type)
    }

    if (playerFlash.current > 0) playerFlash.current = Math.max(0, playerFlash.current - delta)
    if (bombPulse.current > 0) bombPulse.current = Math.max(0, bombPulse.current - delta)
    const fx = presentationFxState
    fx.hudDamage = Math.max(0, fx.hudDamage - delta)
    fx.hudShieldBreak = Math.max(0, fx.hudShieldBreak - delta)
    fx.hudLifeLoss = Math.max(0, fx.hudLifeLoss - delta)
    fx.hudGraze = Math.max(0, fx.hudGraze - delta)
    fx.hudComboBreak = Math.max(0, fx.hudComboBreak - delta)
    fx.hudWaveClear = Math.max(0, fx.hudWaveClear - delta)
    fx.hudTierUp = Math.max(0, fx.hudTierUp - delta)

    // Expose flashes on world session via module-level side channel for PlayerMesh
    fx.playerFlash = playerFlash.current
    fx.bombPulse = bombPulse.current

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
    for (const r of rings) {
      if (!r.active) continue
      r.life -= dt
      if (r.life <= 0) r.active = false
    }

    const inst = mesh.current
    if (inst) {
      let i = 0
      for (const p of pool) {
        if (!p.active) continue
        const t = p.life / p.maxLife
        const s = p.scale * (0.4 + t * 0.8)
        const speed = Math.hypot(p.vx, p.vy)
        const rotZ = speed > 0.01 ? Math.atan2(-p.vx, p.vy) : 0
        _proxy.position.set(p.x, p.y, 0.4)
        _proxy.scale.set(s, s * (1 + (p.stretch - 1) * Math.min(1, speed / 3)), s)
        _proxy.rotation.set(0, 0, rotZ)
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

    const ringsInst = ringMesh.current
    if (ringsInst) {
      let i = 0
      for (const r of rings) {
        if (!r.active) continue
        const t = 1 - r.life / r.maxLife
        const eased = 1 - (1 - t) * (1 - t)
        const s = r.fromScale + (r.toScale - r.fromScale) * eased
        _proxy.position.set(r.x, r.y, 0.38)
        _proxy.scale.set(s, s, 1)
        _proxy.rotation.set(0, 0, 0)
        _proxy.updateMatrix()
        ringsInst.setMatrixAt(i, _proxy.matrix)
        const fade = r.life / r.maxLife
        _color.set(r.color).multiplyScalar(0.25 + fade * 0.75)
        ringsInst.setColorAt(i, _color)
        i += 1
      }
      for (let j = i; j < MAX_RINGS; j++) {
        _proxy.position.set(0, -200, 0)
        _proxy.scale.setScalar(0)
        _proxy.updateMatrix()
        ringsInst.setMatrixAt(j, _proxy.matrix)
      }
      ringsInst.count = i
      ringsInst.instanceMatrix.needsUpdate = true
      if (ringsInst.instanceColor) ringsInst.instanceColor.needsUpdate = true
    }

    /* Camera rig: base + speed FOV + sway + trauma shake + roll. */
    const cam = camera as PerspectiveCamera
    swayT.current += dt
    shakeTime.current += dt
    trauma.current = Math.max(0, trauma.current - TRAUMA_DECAY * dt)
    if (fovPunch.current > 0.001) {
      fovPunch.current *= Math.exp(-delta / 0.2)
      if (fovPunch.current < 0.001) fovPunch.current = 0
    }

    const debug = isDebugMode()
    const ov = debug ? debugCameraOverride : EMPTY_OVERRIDE
    const setPiece = world.enemies.find((enemy) => enemy.active && enemy.class === 'set_piece')
    const directed = runCameraDirection({
      elapsed: world.session.elapsed,
      wave: world.session.wave,
      wavePhase: world.waves.phase,
      setPieceX: setPiece?.x ?? null,
      reducedMotion: settings.reducedMotion,
    })
    const directionResponse = 1 - Math.exp(-dt * (directed.setPieceWeight > 0 ? 2.6 : 4.8))
    const bp = basePos.current
    const la = lookAt.current
    if (!cameraRigReady.current) {
      Object.assign(bp, directed.position)
      Object.assign(la, directed.lookAt)
      directedFovOffset.current = directed.fovOffset
      cameraRigReady.current = true
    } else {
      bp.x += (directed.position.x - bp.x) * directionResponse
      bp.y += (directed.position.y - bp.y) * directionResponse
      bp.z += (directed.position.z - bp.z) * directionResponse
      la.x += (directed.lookAt.x - la.x) * directionResponse
      la.y += (directed.lookAt.y - la.y) * directionResponse
      la.z += (directed.lookAt.z - la.z) * directionResponse
      directedFovOffset.current += (directed.fovOffset - directedFovOffset.current) * directionResponse
    }

    const speedRatio = world.streamSpeed / STREAM_BASE_SPEED
    const speedFov = (speedRatio - 1) * 9
    const baseFov = baseFovForAspect(cam.aspect)
    const targetFov = (ov.fov ?? baseFov) + speedFov + directedFovOffset.current + fovPunch.current
    if (Math.abs(cam.fov - targetFov) > 0.01) {
      cam.fov += (targetFov - cam.fov) * Math.min(1, delta * 6)
      cam.updateProjectionMatrix()
    }

    const lay = ov.lookY ?? la.y
    const laz = ov.lookZ ?? la.z
    let px = ov.posX ?? bp.x
    let py = ov.posY ?? bp.y
    let pz = ov.posZ ?? bp.z
    let lx = ov.lookX ?? la.x
    let roll = 0

    if (swayOn && !world.session.paused) {
      const sway = runCameraSway(swayT.current)
      px += sway.position.x
      py += sway.position.y
      pz += sway.position.z
      lx += sway.lookX
      roll += sway.roll
    }

    if (shakeOn && trauma.current > 0) {
      const shake = trauma.current * trauma.current
      const freq = shakeTime.current * 30
      px += MAX_SHAKE_OFFSET * shake * pseudoNoise(freq, 1)
      py += MAX_SHAKE_OFFSET * shake * pseudoNoise(freq, 2)
      roll += MAX_SHAKE_ROLL * shake * pseudoNoise(freq, 3)
    }

    camera.position.set(px, py, pz)
    camera.lookAt(lx, lay, laz)
    camera.rotation.z += roll

    if (debug) {
      debugCameraLive.baseFov = baseFov
      debugCameraLive.fov = cam.fov
      debugCameraLive.posX = px
      debugCameraLive.posY = py
      debugCameraLive.posZ = pz
      debugCameraLive.lookX = lx
      debugCameraLive.lookY = lay
      debugCameraLive.lookZ = laz
    }
  })

  return (
    <>
      <instancedMesh
        ref={mesh}
        args={[geometry, material, MAX_FX]}
        frustumCulled={false}
        castShadow={false}
        receiveShadow={false}
      />
      <instancedMesh
        ref={ringMesh}
        args={[ringGeometry, ringMaterial, MAX_RINGS]}
        frustumCulled={false}
        castShadow={false}
        receiveShadow={false}
      />
    </>
  )
}
