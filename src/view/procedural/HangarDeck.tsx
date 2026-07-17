import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Bloom, EffectComposer } from '@react-three/postprocessing'
import { useEffect, useMemo, useRef } from 'react'
import {
  ACESFilmicToneMapping,
  type Group,
  type Material,
  type Mesh,
  PerspectiveCamera,
  SRGBColorSpace,
} from 'three'
import { useSessionStore } from '../../app/sessionStore'
import type { ShipId } from '../../sim/types'
import { detailFromQuality } from './registry'
import { applyStudioEnvironment } from './setupEnvironment'
import { ShipKitVisual } from './ShipKitVisual'

type Props = {
  kitIds: readonly ShipId[]
  index: number
  lockedIds: readonly ShipId[]
}

export const PAD_SPACING = 3.2

const SHIP_HOVER = 0.48
const FOG_COLOR = '#05090f'

function DeckCamera() {
  const { camera, size } = useThree()

  useEffect(() => {
    if (!(camera instanceof PerspectiveCamera)) return
    const compact = size.width / size.height < 1.15
    camera.fov = compact ? 52 : 44
    if (compact) camera.position.set(0.7, 4.65, 4.15)
    else camera.position.set(0.85, 3.55, 4.25)
    camera.lookAt(0, compact ? 0.06 : 0.2, compact ? -0.3 : -0.52)
    camera.updateProjectionMatrix()
  }, [camera, size.height, size.width])

  return null
}

/** Glide the parked ships across the fixed authored service pit. */
function ShipRail({
  targetX,
  reducedMotion,
  children,
}: {
  targetX: number
  reducedMotion: boolean
  children: React.ReactNode
}) {
  const { size } = useThree()
  const rail = useRef<Group>(null)
  const initialX = useRef(-targetX)
  const compact = size.width / size.height < 1.15

  useFrame((_, delta) => {
    const group = rail.current
    if (!group) return
    const destination = -targetX
    if (reducedMotion) {
      group.position.x = destination
      return
    }
    const ease = 1 - Math.exp(-Math.min(delta, 1 / 30) * 6.4)
    group.position.x += (destination - group.position.x) * ease
    if (Math.abs(destination - group.position.x) < 0.001) group.position.x = destination
  })

  return (
    <group ref={rail} position={[initialX.current, 0, compact ? 0.75 : 0.22]}>
      {children}
    </group>
  )
}

type TintableMaterial = Material & {
  color?: { multiplyScalar: (value: number) => unknown }
  emissive?: { multiplyScalar: (value: number) => unknown }
  emissiveIntensity?: number
  metalness?: number
  roughness?: number
}

/** Preserve locked-hull surface detail while applying a restrained dark tint. */
function LockedShroud({ children }: { children: React.ReactNode }) {
  const group = useRef<Group>(null)
  const materialCache = useMemo(() => new Map<Material, Material>(), [])

  useEffect(
    () => () => {
      for (const [source, material] of materialCache) {
        if (source !== material) material.dispose()
      }
      materialCache.clear()
    },
    [materialCache],
  )

  useFrame(() => {
    group.current?.traverse((obj) => {
      const mesh = obj as Mesh
      if (!mesh.isMesh) return
      const tint = (source: Material): Material => {
        const cached = materialCache.get(source)
        if (cached) return cached
        const material = source.clone() as TintableMaterial
        material.color?.multiplyScalar(0.42)
        material.emissive?.multiplyScalar(0.12)
        if (typeof material.emissiveIntensity === 'number') material.emissiveIntensity *= 0.24
        if (typeof material.metalness === 'number') material.metalness = Math.min(0.82, material.metalness)
        if (typeof material.roughness === 'number') material.roughness = Math.max(0.48, material.roughness)
        materialCache.set(source, material)
        materialCache.set(material, material)
        return material
      }
      mesh.material = Array.isArray(mesh.material)
        ? mesh.material.map(tint)
        : tint(mesh.material)
    })
  })

  return <group ref={group}>{children}</group>
}

function ParkedShip({
  shipId,
  slot,
  locked,
  detail,
  reducedMotion,
}: {
  shipId: ShipId
  slot: number
  locked: boolean
  detail: ReturnType<typeof detailFromQuality>
  reducedMotion: boolean
}) {
  const rig = useRef<Group>(null)

  useFrame((state) => {
    const g = rig.current
    if (!g) return
    if (reducedMotion) {
      g.position.y = SHIP_HOVER
      return
    }
    const t = state.clock.elapsedTime
    g.position.y = SHIP_HOVER + Math.sin(t * 0.85 + slot * 1.7) * 0.035
    g.rotation.z = Math.sin(t * 0.6 + slot * 2.3) * 0.012
  })

  const hull = (
    <group scale={1.14} rotation={[-Math.PI / 2, 0, 0]}>
      <ShipKitVisual
        key={`${shipId}-${detail}`}
        shipId={shipId}
        detail={detail}
        showThrusterPlumes={false}
        hideBakedThrusterCones
      />
    </group>
  )

  return (
    <group position={[slot * PAD_SPACING, 0, 0]}>
      <group ref={rig} position={[0, SHIP_HOVER, 0]}>
        {locked ? <LockedShroud>{hull}</LockedShroud> : hull}
      </group>
    </group>
  )
}

/** Full-bleed hangar deck: every kit parked on a smoothly translating rail. */
export function HangarDeck({ kitIds, index, lockedIds }: Props) {
  const quality = useSessionStore((s) => s.settings.quality)
  const reducedMotion = useSessionStore((s) => s.settings.reducedMotion)
  const detail = detailFromQuality(quality)
  const bloom = quality !== 'low'
  const targetX = index * PAD_SPACING

  const visible = (slot: number) => quality !== 'low' || Math.abs(slot - index) <= 1

  return (
    <Canvas
      className="hangar-deck-r3f"
      dpr={quality === 'high' ? 1.75 : quality === 'medium' ? 1.35 : 1}
      camera={{ position: [0.85, 3.55, 4.25], fov: 44, near: 0.1, far: 60 }}
      gl={{
        antialias: quality !== 'low',
        alpha: true,
        toneMapping: ACESFilmicToneMapping,
        outputColorSpace: SRGBColorSpace,
      }}
      onCreated={({ camera, gl, scene }) => {
        camera.lookAt(0, 0.2, -0.52)
        gl.setClearAlpha(0)
        applyStudioEnvironment(gl, scene)
      }}
    >
      <DeckCamera />
      <fog attach="fog" args={[FOG_COLOR, 6.5, 15.5]} />

      <ambientLight intensity={0.24} />
      <hemisphereLight args={['#8fb8d8', '#050a10', 0.6]} />
      <directionalLight position={[4, 6.4, 4.8]} intensity={1.75} color="#eef6ff" />
      <directionalLight position={[-3.4, 2.2, -2.4]} intensity={0.4} color="#3a6a98" />
      <directionalLight position={[0.6, -1.8, 3.4]} intensity={0.34} color="#58c8ff" />

      <ShipRail targetX={targetX} reducedMotion={reducedMotion}>
        {kitIds.map((id, slot) => (
          <group key={id}>
            {visible(slot) && (
              <ParkedShip
                shipId={id}
                slot={slot}
                locked={lockedIds.includes(id)}
                detail={detail}
                reducedMotion={reducedMotion}
              />
            )}
          </group>
        ))}
      </ShipRail>

      {bloom && (
        <EffectComposer multisampling={0}>
          <Bloom luminanceThreshold={0.72} intensity={0.55} mipmapBlur luminanceSmoothing={0.22} />
        </EffectComposer>
      )}
    </Canvas>
  )
}
