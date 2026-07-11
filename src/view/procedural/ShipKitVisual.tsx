import { useFrame } from '@react-three/fiber'
import { useLayoutEffect, useMemo, useRef } from 'react'
import type { Group, Material, Mesh, MeshStandardMaterial } from 'three'
import type { ShipId } from '../../sim/types'
import { presentationFxState } from '../../presentation/fxState'
import type { DetailLevel } from './registry'
import { hasKitPart } from './registry'
import {
  EngineAssembly,
  makeWingGeometry,
  useLatheSet,
  usePlumeMat,
  useRoleMats,
  type RoleMats,
} from './shipParts'
import { VanguardFactory } from './VanguardFactory'

type Props = {
  shipId: ShipId
  detail: DetailLevel
  liveFlash?: boolean
  flash?: number
  /** Scale thruster plumes from live player velocity (Run). Hangar leaves false. */
  liveThrust?: boolean
}

type MatSnapshot = {
  color: string
  emissive: string
  emissiveIntensity: number
}

function applyFlashToGroup(
  group: Group | null,
  flash: number,
  base: Map<MeshStandardMaterial, MatSnapshot>,
) {
  if (!group) return
  group.traverse((obj) => {
    const mesh = obj as Mesh
    if (!mesh.isMesh) return
    const mat = mesh.material as MeshStandardMaterial
    if (!mat?.isMeshStandardMaterial) return
    const rest = base.get(mat)
    if (!rest) return
    if (flash > 0) {
      mat.color.set('#ffffff')
      mat.emissive.set('#c8f0ff')
      mat.emissiveIntensity = 1.4
    } else {
      mat.color.set(rest.color)
      mat.emissive.set(rest.emissive)
      mat.emissiveIntensity = rest.emissiveIntensity
    }
  })
}

function useFlashDriver(liveFlash: boolean, flash: number, captureKey: string) {
  const group = useRef<Group>(null)
  const base = useRef(new Map<MeshStandardMaterial, MatSnapshot>())
  const capturedKey = useRef('')
  const wasFlashing = useRef(false)

  useFrame(() => {
    const g = group.current
    if (!g) return
    if (capturedKey.current !== captureKey) {
      base.current.clear()
      g.traverse((obj) => {
        const mesh = obj as Mesh
        if (!mesh.isMesh) return
        const mat = mesh.material as MeshStandardMaterial
        if (!mat?.isMeshStandardMaterial) return
        base.current.set(mat, {
          color: `#${mat.color.getHexString()}`,
          emissive: `#${mat.emissive.getHexString()}`,
          emissiveIntensity: mat.emissiveIntensity,
        })
      })
      capturedKey.current = captureKey
    }
    const f = liveFlash ? presentationFxState.playerFlash : flash
    const flashing = f > 0
    // Restore only on the flash-off transition so per-frame drivers
    // (thruster plume intensity) keep authority between flashes.
    if (flashing || wasFlashing.current) applyFlashToGroup(g, f, base.current)
    wasFlashing.current = flashing
  })

  return group
}

function Box({
  pos,
  scale,
  rot,
  mat,
  name,
}: {
  pos: [number, number, number]
  scale: [number, number, number]
  rot?: [number, number, number]
  mat: Material
  name?: string
}) {
  return (
    <mesh name={name} position={pos} scale={scale} rotation={rot ?? [0, 0, 0]}>
      <boxGeometry args={[1, 1, 1]} />
      <primitive object={mat} attach="material" />
    </mesh>
  )
}

type KitProps = {
  detail: DetailLevel
  mats: RoleMats
  liveThrust: boolean
}

/**
 * Striker: twin-boom gunship. Slim fuselage between two forward gun booms,
 * canards, swept rear wings, twin engines. Reads as "guns first".
 */
function StrikerKit({ detail, mats, liveThrust }: KitProps) {
  const show = (p: Parameters<typeof hasKitPart>[2]) => hasKitPart('striker', detail, p)
  const { slimNose, canopy, bell } = useLatheSet()
  const plumeMat = usePlumeMat()
  const wingL = useMemo(() => makeWingGeometry(true, 'swept'), [])
  const wingR = useMemo(() => makeWingGeometry(false, 'swept'), [])
  useLayoutEffect(
    () => () => {
      wingL.dispose()
      wingR.dispose()
    },
    [wingL, wingR],
  )
  const plume = show('thrusterPlume')
  const dense = detail === 'high'

  return (
    <group name="strikerRoot">
      {/* Central fuselage */}
      <mesh name="hullCore" position={[0, 0.12, 0]} castShadow>
        <boxGeometry args={[0.3, 0.95, 0.26]} />
        <primitive object={mats.body} attach="material" />
      </mesh>
      <mesh name="hullForward" position={[0, 0.68, 0]} castShadow>
        <boxGeometry args={[0.22, 0.3, 0.2]} />
        <primitive object={mats.body} attach="material" />
      </mesh>
      <mesh name="noseCone" geometry={slimNose} position={[0, 0.84, 0]} castShadow>
        <primitive object={mats.body} attach="material" />
      </mesh>
      <Box name="bellyPlate" pos={[0, 0.1, -0.12]} scale={[0.22, 0.8, 0.06]} mat={mats.panel} />
      <Box name="spineRail" pos={[0, 0.2, 0.135]} scale={[0.06, 0.85, 0.03]} mat={mats.decal} />

      {show('gunPods') && (
        <group name="gunBooms">
          {([-0.3, 0.3] as const).map((x) => (
            <group key={x} position={[x, 0.3, 0]}>
              <mesh name="boom" position={[0, 0.1, 0]} castShadow>
                <boxGeometry args={[0.14, 0.85, 0.14]} />
                <primitive object={mats.panel} attach="material" />
              </mesh>
              <mesh name="barrel" position={[0, 0.62, 0]} rotation={[0, 0, 0]}>
                <cylinderGeometry args={[0.045, 0.055, 0.5, 8]} />
                <primitive object={mats.nozzle} attach="material" />
              </mesh>
              <mesh name="muzzle" position={[0, 0.9, 0]}>
                <cylinderGeometry args={[0.055, 0.045, 0.08, 8]} />
                <primitive object={mats.trim} attach="material" />
              </mesh>
              <Box name="boomClamp" pos={[x < 0 ? 0.09 : -0.09, 0.05, 0]} scale={[0.1, 0.2, 0.16]} mat={mats.decal} />
              <Box name="boomFin" pos={[0, -0.32, 0.06]} scale={[0.05, 0.24, 0.12]} mat={mats.panel} />
            </group>
          ))}
        </group>
      )}

      {show('wings') && (
        <group name="wings">
          <mesh name="wingL" geometry={wingL} position={[-0.26, -0.3, 0]} scale={[0.62, 1, 1]} castShadow>
            <primitive object={mats.body} attach="material" />
          </mesh>
          <mesh name="wingR" geometry={wingR} position={[0.26, -0.3, 0]} scale={[0.62, 1, 1]} castShadow>
            <primitive object={mats.body} attach="material" />
          </mesh>
          <Box name="canardL" pos={[-0.26, 0.52, 0]} scale={[0.26, 0.1, 0.04]} rot={[0, 0, 0.25]} mat={mats.panel} />
          <Box name="canardR" pos={[0.26, 0.52, 0]} scale={[0.26, 0.1, 0.04]} rot={[0, 0, -0.25]} mat={mats.panel} />
          <Box name="wingEdgeL" pos={[-0.68, -0.5, 0.045]} scale={[0.3, 0.018, 0.014]} rot={[0, 0, 0.42]} mat={mats.trim} />
          <Box name="wingEdgeR" pos={[0.68, -0.5, 0.045]} scale={[0.3, 0.018, 0.014]} rot={[0, 0, -0.42]} mat={mats.trim} />
        </group>
      )}

      {show('thruster') && (
        <group name="engines" position={[0, -0.5, 0]}>
          <Box name="engineBay" pos={[0, 0.1, 0]} scale={[0.56, 0.14, 0.22]} mat={mats.panel} />
          <EngineAssembly x={-0.18} y={0} mats={mats} bell={bell} plume={plume} dense={dense} liveThrust={liveThrust} plumeMat={plumeMat} />
          <EngineAssembly x={0.18} y={0} mats={mats} bell={bell} plume={plume} dense={dense} liveThrust={liveThrust} plumeMat={plumeMat} />
        </group>
      )}

      {show('canopy') && (
        <group name="cockpit" position={[0, 0.34, 0.09]}>
          <Box name="canopyFrame" pos={[0, -0.02, 0.01]} scale={[0.18, 0.08, 0.1]} mat={mats.nozzle} />
          <mesh name="cockpitGlass" geometry={canopy} position={[0, 0.02, 0.03]} scale={[0.8, 0.9, 0.8]} castShadow>
            <primitive object={mats.glass} attach="material" />
          </mesh>
        </group>
      )}

      {show('finDetail') && (
        <group name="detail">
          <Box name="tailFin" pos={[0, -0.32, 0.12]} scale={[0.04, 0.34, 0.18]} mat={mats.panel} />
          <Box name="tailEdge" pos={[0, -0.28, 0.22]} scale={[0.02, 0.26, 0.02]} mat={mats.trim} />
          <Box name="panelGap" pos={[0, 0.02, -0.155]} scale={[0.24, 0.01, 0.015]} mat={mats.decal} />
        </group>
      )}

      {show('edgeGlow') && (
        <group name="highOnly">
          <Box name="muzzleGlowL" pos={[-0.3, 1.24, 0]} scale={[0.05, 0.05, 0.05]} mat={mats.glow} />
          <Box name="muzzleGlowR" pos={[0.3, 1.24, 0]} scale={[0.05, 0.05, 0.05]} mat={mats.glow} />
        </group>
      )}
    </group>
  )
}

/**
 * Aegis: armored bulwark. Wide layered wing-body, front armor chevrons,
 * shield ring, triple engines. Reads as "a wall with thrusters".
 */
function AegisKit({ detail, mats, liveThrust }: KitProps) {
  const show = (p: Parameters<typeof hasKitPart>[2]) => hasKitPart('aegis', detail, p)
  const { canopy, bell } = useLatheSet()
  const plumeMat = usePlumeMat()
  const wingL = useMemo(() => makeWingGeometry(true, 'broad'), [])
  const wingR = useMemo(() => makeWingGeometry(false, 'broad'), [])
  useLayoutEffect(
    () => () => {
      wingL.dispose()
      wingR.dispose()
    },
    [wingL, wingR],
  )
  const plume = show('thrusterPlume')
  const dense = detail === 'high'

  return (
    <group name="aegisRoot">
      <mesh name="hullCore" position={[0, 0, 0]} castShadow>
        <boxGeometry args={[0.78, 0.68, 0.34]} />
        <primitive object={mats.body} attach="material" />
      </mesh>
      <mesh name="hullProw" position={[0, 0.48, 0]} castShadow>
        <boxGeometry args={[0.5, 0.34, 0.28]} />
        <primitive object={mats.body} attach="material" />
      </mesh>
      {/* Front armor chevrons */}
      <Box name="armorChevL" pos={[-0.2, 0.72, 0.03]} scale={[0.34, 0.14, 0.2]} rot={[0, 0, 0.5]} mat={mats.panel} />
      <Box name="armorChevR" pos={[0.2, 0.72, 0.03]} scale={[0.34, 0.14, 0.2]} rot={[0, 0, -0.5]} mat={mats.panel} />
      <Box name="armorNose" pos={[0, 0.82, 0]} scale={[0.16, 0.18, 0.16]} mat={mats.panel} />
      <Box name="bellyPlate" pos={[0, 0, -0.2]} scale={[0.6, 0.5, 0.06]} mat={mats.panel} />
      {/* Side sponsons with dark intakes */}
      {([-1, 1] as const).map((s) => (
        <group key={s} name={s < 0 ? 'sponsonL' : 'sponsonR'} position={[s * 0.52, 0.06, 0]}>
          <mesh name="sponson" castShadow>
            <boxGeometry args={[0.3, 0.46, 0.26]} />
            <primitive object={mats.panel} attach="material" />
          </mesh>
          <Box name="intakeDark" pos={[s * 0.06, 0.18, 0.04]} scale={[0.14, 0.12, 0.16]} mat={mats.nozzle} />
          <Box name="sponsonTrim" pos={[s * 0.16, -0.1, 0.1]} scale={[0.02, 0.24, 0.02]} mat={mats.trim} />
        </group>
      ))}

      {show('wings') && (
        <group name="wings">
          <mesh name="wingL" geometry={wingL} position={[-0.6, -0.1, 0]} scale={[0.55, 1, 1.4]} castShadow>
            <primitive object={mats.body} attach="material" />
          </mesh>
          <mesh name="wingR" geometry={wingR} position={[0.6, -0.1, 0]} scale={[0.55, 1, 1.4]} castShadow>
            <primitive object={mats.body} attach="material" />
          </mesh>
          <Box name="wingArmorL" pos={[-0.86, 0.02, 0.05]} scale={[0.24, 0.3, 0.08]} mat={mats.panel} />
          <Box name="wingArmorR" pos={[0.86, 0.02, 0.05]} scale={[0.24, 0.3, 0.08]} mat={mats.panel} />
        </group>
      )}

      {show('shieldRing') && (
        <group name="shieldEmitter" position={[0, 0.08, 0.2]}>
          <mesh name="shieldRingOuter" rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.55, 0.034, 8, 32]} />
            <primitive object={mats.trim} attach="material" />
          </mesh>
          <mesh name="shieldRingInner" rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.4, 0.022, 6, 24]} />
            <primitive object={mats.glow} attach="material" />
          </mesh>
          <Box name="emitterL" pos={[-0.6, 0.1, -0.08]} scale={[0.14, 0.14, 0.1]} mat={mats.trim} />
          <Box name="emitterR" pos={[0.6, 0.1, -0.08]} scale={[0.14, 0.14, 0.1]} mat={mats.trim} />
        </group>
      )}

      {show('thruster') && (
        <group name="engines" position={[0, -0.46, 0]}>
          <Box name="engineBay" pos={[0, 0.06, 0]} scale={[0.78, 0.16, 0.26]} mat={mats.panel} />
          <EngineAssembly x={-0.3} y={-0.06} mats={mats} bell={bell} plume={plume} dense={dense} liveThrust={liveThrust} plumeMat={plumeMat} />
          <EngineAssembly x={0.3} y={-0.06} mats={mats} bell={bell} plume={plume} dense={dense} liveThrust={liveThrust} plumeMat={plumeMat} />
          <EngineAssembly x={0} y={-0.08} scale={0.9} mats={mats} bell={bell} plume={plume} dense={dense} liveThrust={liveThrust} plumeMat={plumeMat} />
        </group>
      )}

      {show('canopy') && (
        <group name="cockpit" position={[0, 0.24, 0.16]}>
          <Box name="canopyFrame" pos={[0, -0.03, 0]} scale={[0.26, 0.1, 0.1]} mat={mats.nozzle} />
          <mesh name="cockpitGlass" geometry={canopy} position={[0, 0.01, 0.03]} castShadow>
            <primitive object={mats.glass} attach="material" />
          </mesh>
        </group>
      )}

      {show('finDetail') && (
        <group name="detail">
          <Box name="hazardL" pos={[-0.84, 0.24, 0.03]} scale={[0.08, 0.24, 0.08]} mat={mats.trim} />
          <Box name="hazardR" pos={[0.84, 0.24, 0.03]} scale={[0.08, 0.24, 0.08]} mat={mats.trim} />
          <Box name="panelGap1" pos={[0, -0.18, -0.23]} scale={[0.5, 0.01, 0.015]} mat={mats.decal} />
          <Box name="panelGap2" pos={[0, 0.22, -0.2]} scale={[0.4, 0.01, 0.015]} mat={mats.decal} />
        </group>
      )}

      {show('edgeGlow') && (
        <Box name="prowGlow" pos={[0, 0.94, 0.02]} scale={[0.1, 0.02, 0.02]} mat={mats.glow} />
      )}
    </group>
  )
}

/**
 * Phantom: stiletto interceptor. Needle nose, blade wings swept hard back,
 * one oversized engine, dorsal glow spine. Reads as "a knife".
 */
function PhantomKit({ detail, mats, liveThrust }: KitProps) {
  const show = (p: Parameters<typeof hasKitPart>[2]) => hasKitPart('phantom', detail, p)
  const { slimNose, canopy, bell } = useLatheSet()
  const plumeMat = usePlumeMat()
  const wingL = useMemo(() => makeWingGeometry(true, 'swept'), [])
  const wingR = useMemo(() => makeWingGeometry(false, 'swept'), [])
  useLayoutEffect(
    () => () => {
      wingL.dispose()
      wingR.dispose()
    },
    [wingL, wingR],
  )
  const plume = show('thrusterPlume')
  const dense = detail === 'high'

  return (
    <group name="phantomRoot">
      <mesh name="hullCore" position={[0, 0.05, 0]} castShadow>
        <boxGeometry args={[0.2, 0.9, 0.16]} />
        <primitive object={mats.body} attach="material" />
      </mesh>
      <mesh name="hullForward" position={[0, 0.55, 0]} castShadow>
        <boxGeometry args={[0.15, 0.34, 0.13]} />
        <primitive object={mats.body} attach="material" />
      </mesh>
      <mesh name="noseCone" geometry={slimNose} position={[0, 0.7, 0]} scale={[0.9, 0.9, 1.15]} castShadow>
        <primitive object={mats.body} attach="material" />
      </mesh>
      <Box name="bellyPlate" pos={[0, 0.08, -0.08]} scale={[0.13, 0.72, 0.05]} mat={mats.panel} />

      {show('wings') && (
        <group name="wings">
          <mesh name="wingL" geometry={wingL} position={[-0.12, -0.05, 0]} scale={[0.72, 1, 0.8]} castShadow>
            <primitive object={mats.body} attach="material" />
          </mesh>
          <mesh name="wingR" geometry={wingR} position={[0.12, -0.05, 0]} scale={[0.72, 1, 0.8]} castShadow>
            <primitive object={mats.body} attach="material" />
          </mesh>
          <Box name="bladeTipL" pos={[-0.76, -0.42, 0.02]} scale={[0.2, 0.05, 0.03]} rot={[0, 0, 0.6]} mat={mats.trim} />
          <Box name="bladeTipR" pos={[0.76, -0.42, 0.02]} scale={[0.2, 0.05, 0.03]} rot={[0, 0, -0.6]} mat={mats.trim} />
        </group>
      )}

      {show('thruster') && (
        <group name="engines" position={[0, -0.52, 0]}>
          <Box name="engineBay" pos={[0, 0.12, 0]} scale={[0.26, 0.16, 0.18]} mat={mats.panel} />
          <EngineAssembly x={0} y={0} scale={1.35} mats={mats} bell={bell} plume={plume} dense={dense} liveThrust={liveThrust} plumeMat={plumeMat} />
        </group>
      )}

      {show('canopy') && (
        <group name="cockpit" position={[0, 0.28, 0.07]}>
          <mesh name="cockpitGlass" geometry={canopy} position={[0, 0, 0.02]} scale={[0.6, 1.1, 0.6]} castShadow>
            <primitive object={mats.glass} attach="material" />
          </mesh>
        </group>
      )}

      {/* Canted twin tail fins */}
      <Box name="tailFinL" pos={[-0.1, -0.38, 0.1]} scale={[0.03, 0.3, 0.16]} rot={[0.35, 0, 0.2]} mat={mats.panel} />
      <Box name="tailFinR" pos={[0.1, -0.38, 0.1]} scale={[0.03, 0.3, 0.16]} rot={[0.35, 0, -0.2]} mat={mats.panel} />

      {show('edgeGlow') && (
        <group name="highOnly">
          <Box name="dorsalGlow" pos={[0, 0.1, 0.09]} scale={[0.025, 0.75, 0.015]} mat={mats.glow} />
          <Box name="finGlowL" pos={[-0.1, -0.3, 0.18]} scale={[0.015, 0.2, 0.015]} mat={mats.trim} />
          <Box name="finGlowR" pos={[0.1, -0.3, 0.18]} scale={[0.015, 0.2, 0.015]} mat={mats.trim} />
        </group>
      )}
    </group>
  )
}

function KitBody({
  shipId,
  detail,
  mutableMaterials,
  liveThrust,
}: {
  shipId: ShipId
  detail: DetailLevel
  mutableMaterials: boolean
  liveThrust: boolean
}) {
  const mats = useRoleMats(mutableMaterials)
  switch (shipId) {
    case 'striker':
      return <StrikerKit detail={detail} mats={mats} liveThrust={liveThrust} />
    case 'aegis':
      return <AegisKit detail={detail} mats={mats} liveThrust={liveThrust} />
    case 'phantom':
      return <PhantomKit detail={detail} mats={mats} liveThrust={liveThrust} />
    default:
      return (
        <VanguardFactory
          detail={detail}
          mutableMaterials={mutableMaterials}
          liveThrust={liveThrust}
        />
      )
  }
}

/** Catalog id → bespoke procedural kit graph (Hangar + Run). */
export function ShipKitVisual({
  shipId,
  detail,
  liveFlash = false,
  flash = 0,
  liveThrust = false,
}: Props) {
  const group = useFlashDriver(liveFlash, flash, `${shipId}-${detail}`)
  return (
    <group ref={group}>
      <KitBody
        shipId={shipId}
        detail={detail}
        mutableMaterials={liveFlash}
        liveThrust={liveThrust}
      />
    </group>
  )
}
