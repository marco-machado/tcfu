import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import type { Group, Mesh, MeshStandardMaterial } from 'three'
import type { ShipId } from '../../sim/types'
import { presentationFxState } from '../../presentation/fxState'
import { materialToken, type MaterialTokenId } from './materialTokens'
import type { DetailLevel } from './registry'
import { hasKitPart, kitRecipe } from './registry'
import { ThrusterPlume } from './ThrusterPlume'
import { VanguardFactory } from './VanguardFactory'

type Props = {
  shipId: ShipId
  detail: DetailLevel
  liveFlash?: boolean
  flash?: number
  /** Scale thruster plumes from live player velocity (Run). Hangar leaves false. */
  liveThrust?: boolean
}

type MatProps = {
  color: string
  emissive: string
  emissiveIntensity: number
  metalness: number
  roughness: number
  toneMapped: boolean
}

function tokenProps(tokenId: MaterialTokenId): MatProps {
  const t = materialToken(tokenId)
  return {
    color: t.color,
    emissive: t.emissive,
    emissiveIntensity: t.emissiveIntensity,
    metalness: t.metalness,
    roughness: t.roughness,
    toneMapped: t.toneMapped,
  }
}

function applyFlashToGroup(
  group: Group | null,
  flash: number,
  base: Map<MeshStandardMaterial, MatProps>,
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
  const base = useRef(new Map<MeshStandardMaterial, MatProps>())
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
          metalness: mat.metalness,
          roughness: mat.roughness,
          toneMapped: mat.toneMapped,
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
}: {
  pos: [number, number, number]
  scale: [number, number, number]
  rot?: [number, number, number]
  mat: MatProps
}) {
  return (
    <mesh position={pos} scale={scale} rotation={rot ?? [0, 0, 0]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial {...mat} />
    </mesh>
  )
}

/** Engine: bulkier bell, dark throat, hot core, optional live plume. */
function EngineNozzle({
  x,
  y,
  z = 0,
  scale = 1,
  thruster,
  nozzle,
  plume = false,
  densePlume = false,
  liveThrust = false,
}: {
  x: number
  y: number
  z?: number
  scale?: number
  thruster: MatProps
  nozzle: MatProps
  plume?: boolean
  densePlume?: boolean
  liveThrust?: boolean
}) {
  const s = scale
  return (
    <group position={[x, y, z]}>
      <mesh position={[0, 0.05 * s, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.15 * s, 0.15 * s, 0.05 * s, 12]} />
        <meshStandardMaterial {...nozzle} />
      </mesh>
      <mesh position={[0, -0.02 * s, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.11 * s, 0.145 * s, 0.18 * s, 12]} />
        <meshStandardMaterial {...nozzle} />
      </mesh>
      <mesh position={[0, -0.06 * s, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.06 * s, 0.08 * s, 0.14 * s, 10]} />
        <meshStandardMaterial {...nozzle} />
      </mesh>
      <mesh position={[0, -0.1 * s, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.045 * s, 0.04 * s, 0.12 * s, 8]} />
        <meshStandardMaterial {...thruster} />
      </mesh>
      <mesh position={[0, -0.16 * s, 0]}>
        <sphereGeometry args={[0.06 * s, 10, 8]} />
        <meshStandardMaterial {...thruster} />
      </mesh>
      {plume && (
        <ThrusterPlume
          scale={s}
          dense={densePlume}
          thruster={thruster}
          live={liveThrust}
        />
      )}
    </group>
  )
}

function useKitMats(shipId: ShipId) {
  const recipe = kitRecipe(shipId)
  return useMemo(
    () => ({
      hull: tokenProps(recipe.hullToken),
      thruster: tokenProps(recipe.thrusterToken),
      accent: tokenProps(recipe.accentToken),
      panel: tokenProps('hullPanel'),
      nozzle: tokenProps('nozzleMetal'),
      glass: tokenProps('glassCanopy'),
    }),
    [recipe.hullToken, recipe.thrusterToken, recipe.accentToken],
  )
}

function StrikerKit({ detail, liveThrust }: { detail: DetailLevel; liveThrust: boolean }) {
  const m = useKitMats('striker')
  const show = (p: Parameters<typeof hasKitPart>[2]) => hasKitPart('striker', detail, p)
  const plume = show('thrusterPlume')
  const densePlume = detail === 'high'

  return (
    <group>
      <Box pos={[0, 0.1, 0]} scale={[0.34, 1.12, 0.28]} mat={m.hull} />
      <Box pos={[0, 0.72, 0]} scale={[0.26, 0.38, 0.22]} mat={m.hull} />
      <Box pos={[0, 1.05, 0]} scale={[0.18, 0.32, 0.16]} mat={m.panel} />
      <Box pos={[0, 0.15, -0.12]} scale={[0.24, 0.9, 0.1]} mat={m.panel} />
      <Box pos={[0, 0.2, 0.14]} scale={[0.12, 0.95, 0.06]} mat={m.panel} />

      {show('gunPods') && (
        <>
          <Box pos={[-0.22, 0.55, 0.08]} scale={[0.1, 0.68, 0.1]} mat={m.nozzle} />
          <Box pos={[0.22, 0.55, 0.08]} scale={[0.1, 0.68, 0.1]} mat={m.nozzle} />
          <Box pos={[-0.22, 0.95, 0.08]} scale={[0.08, 0.14, 0.08]} mat={m.accent} />
          <Box pos={[0.22, 0.95, 0.08]} scale={[0.08, 0.14, 0.08]} mat={m.accent} />
        </>
      )}

      {show('wings') && (
        <>
          <Box pos={[-0.48, -0.18, 0]} scale={[0.48, 0.58, 0.1]} rot={[0, 0, 0.48]} mat={m.hull} />
          <Box pos={[0.48, -0.18, 0]} scale={[0.48, 0.58, 0.1]} rot={[0, 0, -0.48]} mat={m.hull} />
          <Box pos={[-0.42, 0.22, 0]} scale={[0.36, 0.2, 0.08]} rot={[0, 0, 0.25]} mat={m.panel} />
          <Box pos={[0.42, 0.22, 0]} scale={[0.36, 0.2, 0.08]} rot={[0, 0, -0.25]} mat={m.panel} />
          <Box pos={[-0.62, -0.38, 0]} scale={[0.14, 0.38, 0.06]} rot={[0, 0, 0.55]} mat={m.accent} />
          <Box pos={[0.62, -0.38, 0]} scale={[0.14, 0.38, 0.06]} rot={[0, 0, -0.55]} mat={m.accent} />
        </>
      )}

      {show('thruster') && (
        <>
          <EngineNozzle
            x={-0.14}
            y={-0.62}
            scale={1.2}
            thruster={m.thruster}
            nozzle={m.nozzle}
            plume={plume}
            densePlume={densePlume}
            liveThrust={liveThrust}
          />
          <EngineNozzle
            x={0.14}
            y={-0.62}
            scale={1.2}
            thruster={m.thruster}
            nozzle={m.nozzle}
            plume={plume}
            densePlume={densePlume}
            liveThrust={liveThrust}
          />
          <Box pos={[0, -0.5, 0]} scale={[0.42, 0.16, 0.22]} mat={m.panel} />
        </>
      )}

      {show('canopy') && <Box pos={[0, 0.4, 0.12]} scale={[0.16, 0.38, 0.09]} mat={m.glass} />}

      {show('finDetail') && (
        <>
          <Box pos={[0, -0.15, 0]} scale={[0.06, 0.45, 0.32]} mat={m.hull} />
          <Box pos={[0, 0.05, 0.14]} scale={[0.06, 0.5, 0.03]} mat={m.accent} />
        </>
      )}

      {show('edgeGlow') && (
        <Box pos={[0, -0.72, 0]} scale={[0.36, 0.04, 0.05]} mat={m.thruster} />
      )}
    </group>
  )
}

function AegisKit({ detail, liveThrust }: { detail: DetailLevel; liveThrust: boolean }) {
  const m = useKitMats('aegis')
  const show = (p: Parameters<typeof hasKitPart>[2]) => hasKitPart('aegis', detail, p)
  const plume = show('thrusterPlume')
  const densePlume = detail === 'high'

  return (
    <group>
      <Box pos={[0, 0, 0]} scale={[0.82, 0.72, 0.4]} mat={m.hull} />
      <Box pos={[0, 0.45, 0]} scale={[0.56, 0.34, 0.32]} mat={m.hull} />
      <Box pos={[0, 0.72, 0]} scale={[0.34, 0.24, 0.24]} mat={m.panel} />
      <Box pos={[0, 0.05, -0.16]} scale={[0.66, 0.52, 0.12]} mat={m.panel} />
      <Box pos={[-0.38, 0.1, 0.18]} scale={[0.3, 0.42, 0.1]} mat={m.panel} />
      <Box pos={[0.38, 0.1, 0.18]} scale={[0.3, 0.42, 0.1]} mat={m.panel} />

      {show('wings') && (
        <>
          <Box pos={[-0.78, -0.02, 0]} scale={[0.52, 0.56, 0.16]} mat={m.hull} />
          <Box pos={[0.78, -0.02, 0]} scale={[0.52, 0.56, 0.16]} mat={m.hull} />
          <Box pos={[-0.9, 0.1, 0.06]} scale={[0.22, 0.38, 0.12]} mat={m.panel} />
          <Box pos={[0.9, 0.1, 0.06]} scale={[0.22, 0.38, 0.12]} mat={m.panel} />
        </>
      )}

      {show('shieldRing') && (
        <>
          <mesh position={[0, 0.08, 0.22]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.55, 0.034, 8, 32]} />
            <meshStandardMaterial {...m.accent} />
          </mesh>
          <mesh position={[0, 0.08, 0.22]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.4, 0.022, 6, 24]} />
            <meshStandardMaterial {...m.thruster} />
          </mesh>
          <Box pos={[-0.6, 0.18, 0.12]} scale={[0.16, 0.16, 0.12]} mat={m.accent} />
          <Box pos={[0.6, 0.18, 0.12]} scale={[0.16, 0.16, 0.12]} mat={m.accent} />
        </>
      )}

      {show('thruster') && (
        <>
          <EngineNozzle
            x={-0.3}
            y={-0.52}
            thruster={m.thruster}
            nozzle={m.nozzle}
            plume={plume}
            densePlume={densePlume}
            liveThrust={liveThrust}
          />
          <EngineNozzle
            x={0.3}
            y={-0.52}
            thruster={m.thruster}
            nozzle={m.nozzle}
            plume={plume}
            densePlume={densePlume}
            liveThrust={liveThrust}
          />
          <EngineNozzle
            x={0}
            y={-0.54}
            scale={0.95}
            thruster={m.thruster}
            nozzle={m.nozzle}
            plume={plume}
            densePlume={densePlume}
            liveThrust={liveThrust}
          />
          <Box pos={[0, -0.42, 0]} scale={[0.74, 0.16, 0.26]} mat={m.panel} />
        </>
      )}

      {show('canopy') && <Box pos={[0, 0.22, 0.18]} scale={[0.32, 0.28, 0.1]} mat={m.glass} />}

      {show('finDetail') && (
        <>
          <Box pos={[-0.82, 0.22, 0]} scale={[0.1, 0.32, 0.1]} mat={m.accent} />
          <Box pos={[0.82, 0.22, 0]} scale={[0.1, 0.32, 0.1]} mat={m.accent} />
        </>
      )}

      {show('edgeGlow') && (
        <Box pos={[0, 0.08, 0.28]} scale={[0.55, 0.04, 0.03]} mat={m.thruster} />
      )}
    </group>
  )
}

function PhantomKit({ detail, liveThrust }: { detail: DetailLevel; liveThrust: boolean }) {
  const m = useKitMats('phantom')
  const show = (p: Parameters<typeof hasKitPart>[2]) => hasKitPart('phantom', detail, p)
  const plume = show('thrusterPlume')
  const densePlume = detail === 'high'

  return (
    <group>
      <Box pos={[0, 0.08, 0]} scale={[0.24, 1.12, 0.18]} mat={m.hull} />
      <Box pos={[0, 0.68, 0]} scale={[0.18, 0.34, 0.14]} mat={m.hull} />
      <Box pos={[0, 0.96, 0]} scale={[0.12, 0.24, 0.11]} mat={m.panel} />
      <Box pos={[0, 0.1, -0.07]} scale={[0.15, 0.85, 0.07]} mat={m.panel} />
      <Box pos={[0, 0.15, 0.09]} scale={[0.09, 0.8, 0.05]} mat={m.panel} />

      {show('wings') && (
        <>
          <Box pos={[-0.34, 0.05, 0]} scale={[0.48, 0.16, 0.06]} rot={[0, 0, 0.08]} mat={m.hull} />
          <Box pos={[0.34, 0.05, 0]} scale={[0.48, 0.16, 0.06]} rot={[0, 0, -0.08]} mat={m.hull} />
          <Box pos={[-0.3, -0.34, 0]} scale={[0.24, 0.42, 0.05]} rot={[0, 0, 0.4]} mat={m.panel} />
          <Box pos={[0.3, -0.34, 0]} scale={[0.24, 0.42, 0.05]} rot={[0, 0, -0.4]} mat={m.panel} />
          <Box pos={[-0.48, 0.05, 0.03]} scale={[0.22, 0.04, 0.025]} mat={m.accent} />
          <Box pos={[0.48, 0.05, 0.03]} scale={[0.22, 0.04, 0.025]} mat={m.accent} />
        </>
      )}

      {show('thruster') && (
        <>
          <EngineNozzle
            x={0}
            y={-0.62}
            scale={1.05}
            thruster={m.thruster}
            nozzle={m.nozzle}
            plume={plume}
            densePlume={densePlume}
            liveThrust={liveThrust}
          />
          <Box pos={[0, -0.5, 0]} scale={[0.22, 0.14, 0.16]} mat={m.panel} />
        </>
      )}

      {show('canopy') && <Box pos={[0, 0.3, 0.08]} scale={[0.12, 0.32, 0.07]} mat={m.glass} />}

      {show('edgeGlow') && (
        <Box pos={[0, -0.1, 0.09]} scale={[0.06, 0.7, 0.02]} mat={m.thruster} />
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
  switch (shipId) {
    case 'striker':
      return <StrikerKit detail={detail} liveThrust={liveThrust} />
    case 'aegis':
      return <AegisKit detail={detail} liveThrust={liveThrust} />
    case 'phantom':
      return <PhantomKit detail={detail} liveThrust={liveThrust} />
    case 'vanguard':
      return (
        <VanguardFactory
          detail={detail}
          mutableMaterials={mutableMaterials}
          liveThrust={liveThrust}
        />
      )
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
