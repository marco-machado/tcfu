import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import type { Group, Mesh, MeshStandardMaterial } from 'three'
import type { ShipId } from '../../sim/types'
import { presentationFxState } from '../../presentation/fxState'
import { materialToken, type MaterialTokenId } from './materialTokens'
import type { DetailLevel } from './registry'
import { hasKitPart, kitRecipe } from './registry'
import { VanguardFactory } from './VanguardFactory'

type Props = {
  shipId: ShipId
  detail: DetailLevel
  liveFlash?: boolean
  flash?: number
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
    applyFlashToGroup(g, f, base.current)
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

/** Engine: outer ring, tapered bell, dark throat, hot core. */
function EngineNozzle({
  x,
  y,
  z = 0,
  scale = 1,
  thruster,
  nozzle,
}: {
  x: number
  y: number
  z?: number
  scale?: number
  thruster: MatProps
  nozzle: MatProps
}) {
  const s = scale
  return (
    <group position={[x, y, z]}>
      {/* Mount flange */}
      <mesh position={[0, 0.04 * s, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.13 * s, 0.13 * s, 0.04 * s, 12]} />
        <meshStandardMaterial {...nozzle} />
      </mesh>
      {/* Outer bell (tapers toward rear) */}
      <mesh position={[0, -0.02 * s, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.1 * s, 0.125 * s, 0.14 * s, 12]} />
        <meshStandardMaterial {...nozzle} />
      </mesh>
      {/* Inner throat */}
      <mesh position={[0, -0.05 * s, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.055 * s, 0.07 * s, 0.12 * s, 10]} />
        <meshStandardMaterial {...nozzle} />
      </mesh>
      {/* Hot plasma core */}
      <mesh position={[0, -0.08 * s, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.04 * s, 0.035 * s, 0.1 * s, 8]} />
        <meshStandardMaterial {...thruster} />
      </mesh>
      {/* Exhaust bloom nub */}
      <mesh position={[0, -0.15 * s, 0]}>
        <sphereGeometry args={[0.055 * s, 10, 8]} />
        <meshStandardMaterial {...thruster} />
      </mesh>
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

function StrikerKit({ detail }: { detail: DetailLevel }) {
  const m = useKitMats('striker')
  const show = (p: Parameters<typeof hasKitPart>[2]) => hasKitPart('striker', detail, p)

  return (
    <group>
      <Box pos={[0, 0.1, 0]} scale={[0.32, 1.05, 0.24]} mat={m.hull} />
      <Box pos={[0, 0.7, 0]} scale={[0.24, 0.35, 0.2]} mat={m.hull} />
      <Box pos={[0, 1.0, 0]} scale={[0.16, 0.28, 0.14]} mat={m.panel} />
      <Box pos={[0, 0.15, -0.1]} scale={[0.22, 0.85, 0.08]} mat={m.panel} />
      <Box pos={[0, 0.2, 0.12]} scale={[0.1, 0.9, 0.05]} mat={m.panel} />

      {show('gunPods') && (
        <>
          <Box pos={[-0.2, 0.55, 0.06]} scale={[0.09, 0.62, 0.09]} mat={m.nozzle} />
          <Box pos={[0.2, 0.55, 0.06]} scale={[0.09, 0.62, 0.09]} mat={m.nozzle} />
          <Box pos={[-0.2, 0.9, 0.06]} scale={[0.07, 0.12, 0.07]} mat={m.accent} />
          <Box pos={[0.2, 0.9, 0.06]} scale={[0.07, 0.12, 0.07]} mat={m.accent} />
        </>
      )}

      {show('wings') && (
        <>
          <Box pos={[-0.42, -0.2, 0]} scale={[0.38, 0.55, 0.07]} rot={[0, 0, 0.5]} mat={m.hull} />
          <Box pos={[0.42, -0.2, 0]} scale={[0.38, 0.55, 0.07]} rot={[0, 0, -0.5]} mat={m.hull} />
          <Box pos={[-0.38, 0.2, 0]} scale={[0.32, 0.18, 0.06]} rot={[0, 0, 0.25]} mat={m.panel} />
          <Box pos={[0.38, 0.2, 0]} scale={[0.32, 0.18, 0.06]} rot={[0, 0, -0.25]} mat={m.panel} />
          <Box pos={[-0.55, -0.35, 0]} scale={[0.12, 0.35, 0.05]} rot={[0, 0, 0.55]} mat={m.accent} />
          <Box pos={[0.55, -0.35, 0]} scale={[0.12, 0.35, 0.05]} rot={[0, 0, -0.55]} mat={m.accent} />
        </>
      )}

      {show('thruster') && (
        <>
          <EngineNozzle x={-0.12} y={-0.58} scale={1.15} thruster={m.thruster} nozzle={m.nozzle} />
          <EngineNozzle x={0.12} y={-0.58} scale={1.15} thruster={m.thruster} nozzle={m.nozzle} />
          <Box pos={[0, -0.48, 0]} scale={[0.38, 0.14, 0.2]} mat={m.panel} />
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

function AegisKit({ detail }: { detail: DetailLevel }) {
  const m = useKitMats('aegis')
  const show = (p: Parameters<typeof hasKitPart>[2]) => hasKitPart('aegis', detail, p)

  return (
    <group>
      <Box pos={[0, 0, 0]} scale={[0.78, 0.68, 0.36]} mat={m.hull} />
      <Box pos={[0, 0.42, 0]} scale={[0.52, 0.32, 0.3]} mat={m.hull} />
      <Box pos={[0, 0.68, 0]} scale={[0.32, 0.22, 0.22]} mat={m.panel} />
      <Box pos={[0, 0.05, -0.14]} scale={[0.62, 0.5, 0.1]} mat={m.panel} />
      {/* Armor plates */}
      <Box pos={[-0.35, 0.1, 0.16]} scale={[0.28, 0.4, 0.08]} mat={m.panel} />
      <Box pos={[0.35, 0.1, 0.16]} scale={[0.28, 0.4, 0.08]} mat={m.panel} />

      {show('wings') && (
        <>
          <Box pos={[-0.72, -0.02, 0]} scale={[0.48, 0.52, 0.14]} mat={m.hull} />
          <Box pos={[0.72, -0.02, 0]} scale={[0.48, 0.52, 0.14]} mat={m.hull} />
          <Box pos={[-0.85, 0.1, 0.05]} scale={[0.2, 0.35, 0.1]} mat={m.panel} />
          <Box pos={[0.85, 0.1, 0.05]} scale={[0.2, 0.35, 0.1]} mat={m.panel} />
        </>
      )}

      {show('shieldRing') && (
        <>
          <mesh position={[0, 0.08, 0.2]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.52, 0.032, 8, 32]} />
            <meshStandardMaterial {...m.accent} />
          </mesh>
          <mesh position={[0, 0.08, 0.2]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.38, 0.02, 6, 24]} />
            <meshStandardMaterial {...m.thruster} />
          </mesh>
          <Box pos={[-0.58, 0.18, 0.1]} scale={[0.16, 0.16, 0.12]} mat={m.accent} />
          <Box pos={[0.58, 0.18, 0.1]} scale={[0.16, 0.16, 0.12]} mat={m.accent} />
        </>
      )}

      {show('thruster') && (
        <>
          <EngineNozzle x={-0.28} y={-0.48} thruster={m.thruster} nozzle={m.nozzle} />
          <EngineNozzle x={0.28} y={-0.48} thruster={m.thruster} nozzle={m.nozzle} />
          <EngineNozzle x={0} y={-0.5} scale={0.9} thruster={m.thruster} nozzle={m.nozzle} />
          <Box pos={[0, -0.4, 0]} scale={[0.7, 0.14, 0.24]} mat={m.panel} />
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

function PhantomKit({ detail }: { detail: DetailLevel }) {
  const m = useKitMats('phantom')
  const show = (p: Parameters<typeof hasKitPart>[2]) => hasKitPart('phantom', detail, p)

  return (
    <group>
      <Box pos={[0, 0.08, 0]} scale={[0.22, 1.05, 0.16]} mat={m.hull} />
      <Box pos={[0, 0.65, 0]} scale={[0.16, 0.32, 0.13]} mat={m.hull} />
      <Box pos={[0, 0.92, 0]} scale={[0.1, 0.22, 0.1]} mat={m.panel} />
      <Box pos={[0, 0.1, -0.06]} scale={[0.14, 0.8, 0.06]} mat={m.panel} />
      <Box pos={[0, 0.15, 0.08]} scale={[0.08, 0.75, 0.04]} mat={m.panel} />

      {show('wings') && (
        <>
          <Box pos={[-0.3, 0.05, 0]} scale={[0.42, 0.14, 0.05]} rot={[0, 0, 0.08]} mat={m.hull} />
          <Box pos={[0.3, 0.05, 0]} scale={[0.42, 0.14, 0.05]} rot={[0, 0, -0.08]} mat={m.hull} />
          <Box pos={[-0.28, -0.32, 0]} scale={[0.22, 0.38, 0.04]} rot={[0, 0, 0.4]} mat={m.panel} />
          <Box pos={[0.28, -0.32, 0]} scale={[0.22, 0.38, 0.04]} rot={[0, 0, -0.4]} mat={m.panel} />
          <Box pos={[-0.42, 0.05, 0.03]} scale={[0.2, 0.03, 0.02]} mat={m.accent} />
          <Box pos={[0.42, 0.05, 0.03]} scale={[0.2, 0.03, 0.02]} mat={m.accent} />
        </>
      )}

      {show('thruster') && (
        <>
          <EngineNozzle x={0} y={-0.58} scale={0.95} thruster={m.thruster} nozzle={m.nozzle} />
          <Box pos={[0, -0.48, 0]} scale={[0.2, 0.12, 0.14]} mat={m.panel} />
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
}: {
  shipId: ShipId
  detail: DetailLevel
  mutableMaterials: boolean
}) {
  switch (shipId) {
    case 'striker':
      return <StrikerKit detail={detail} />
    case 'aegis':
      return <AegisKit detail={detail} />
    case 'phantom':
      return <PhantomKit detail={detail} />
    case 'vanguard':
      return <VanguardFactory detail={detail} mutableMaterials={mutableMaterials} />
    default:
      return <VanguardFactory detail={detail} mutableMaterials={mutableMaterials} />
  }
}

/** Catalog id → bespoke procedural kit graph (Hangar + Run). */
export function ShipKitVisual({ shipId, detail, liveFlash = false, flash = 0 }: Props) {
  const group = useFlashDriver(liveFlash, flash, `${shipId}-${detail}`)
  return (
    <group ref={group}>
      <KitBody shipId={shipId} detail={detail} mutableMaterials={liveFlash} />
    </group>
  )
}
