import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import { useEffect, useMemo, useRef } from 'react'
import {
  ACESFilmicToneMapping,
  type Group,
  type Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  type PointLight,
  SRGBColorSpace,
} from 'three'
import { useSessionStore } from '../../app/sessionStore'
import type { ShipId } from '../../sim/types'
import { getRoleMaterial } from './MaterialLibrary'
import { materialToken } from './materialTokens'
import { detailFromQuality, kitRecipe } from './registry'
import { applyStudioEnvironment } from './setupEnvironment'
import { ShipKitVisual } from './ShipKitVisual'

type Props = {
  kitIds: readonly ShipId[]
  index: number
  lockedIds: readonly ShipId[]
}

export const PAD_SPACING = 3.2

const SHIP_HOVER = 0.56
const FOG_COLOR = '#05090f'

function DeckCamera({ targetX, reducedMotion }: { targetX: number; reducedMotion: boolean }) {
  const { camera, size } = useThree()
  const x = useRef(targetX)

  useEffect(() => {
    if (!(camera instanceof PerspectiveCamera)) return
    const compact = size.width / size.height < 1.15
    camera.fov = compact ? 52 : 44
    camera.updateProjectionMatrix()
  }, [camera, size.height, size.width])

  useFrame((_, delta) => {
    const ease = reducedMotion ? 1 : 1 - Math.exp(-delta * 5.4)
    x.current += (targetX - x.current) * ease
    const compact = size.width / size.height < 1.15
    if (compact) camera.position.set(x.current + 0.7, 4.65, 4.15)
    else camera.position.set(x.current + 0.95, 4.3, 3.55)
    camera.lookAt(x.current, 0.06, -0.3)
  })

  return null
}

function LandingPad({
  x,
  accent,
  active,
  locked,
  reducedMotion,
}: {
  x: number
  accent: string
  active: boolean
  locked: boolean
  reducedMotion: boolean
}) {
  const glowMat = useMemo(
    () =>
      new MeshStandardMaterial({
        color: '#071420',
        emissive: locked ? '#31465a' : accent,
        emissiveIntensity: 0.2,
        metalness: 0.4,
        roughness: 0.4,
        toneMapped: false,
      }),
    [accent, locked],
  )

  useFrame((state, delta) => {
    const pulse = reducedMotion ? 0 : Math.sin(state.clock.elapsedTime * 1.7 + x) * 0.14
    const target = active ? (locked ? 0.75 : 1.5) + pulse : 0.16
    const ease = reducedMotion ? 1 : 1 - Math.exp(-delta * 6)
    glowMat.emissiveIntensity += (target - glowMat.emissiveIntensity) * ease
  })

  return (
    <group position={[x, 0, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]}>
        <circleGeometry args={[1.16, 48]} />
        <primitive object={getRoleMaterial('groundContact')} attach="material" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[0.88, 0.98, 64]} />
        <primitive object={glowMat} attach="material" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.016, 0]}>
        <ringGeometry args={[1.06, 1.1, 64]} />
        <meshStandardMaterial
          color="#050d15"
          emissive="#12283a"
          emissiveIntensity={0.3}
          metalness={0.55}
          roughness={0.6}
        />
      </mesh>
      {[Math.PI * 0.25, Math.PI * 0.75, Math.PI * 1.25, Math.PI * 1.75].map((angle) => (
        <mesh
          key={angle}
          position={[Math.cos(angle) * 1.24, 0.03, Math.sin(angle) * 1.24]}
          rotation={[-Math.PI / 2, 0, -angle + Math.PI / 4]}
        >
          <planeGeometry args={[0.15, 0.045]} />
          <meshBasicMaterial color={locked ? '#3d5468' : '#5ee7ff'} toneMapped={false} />
        </mesh>
      ))}
    </group>
  )
}

/** Force every mesh of a locked hull onto one dark unlit-looking material. */
function LockedShroud({ children }: { children: React.ReactNode }) {
  const group = useRef<Group>(null)
  const mat = useMemo(
    () =>
      new MeshStandardMaterial({
        color: '#101c29',
        emissive: '#16344c',
        emissiveIntensity: 0.46,
        metalness: 0.85,
        roughness: 0.32,
      }),
    [],
  )

  useFrame(() => {
    group.current?.traverse((obj) => {
      const mesh = obj as Mesh
      if (mesh.isMesh) mesh.material = mat
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
    <group scale={1.06} rotation={[-Math.PI / 2, 0, 0]}>
      <ShipKitVisual key={`${shipId}-${detail}`} shipId={shipId} detail={detail} />
    </group>
  )

  return (
    <group position={[slot * PAD_SPACING, 0, 0]}>
      <group ref={rig} position={[0, SHIP_HOVER, 0]} rotation={[0, 0.66, 0]}>
        {locked ? <LockedShroud>{hull}</LockedShroud> : hull}
      </group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.028, 0]}>
        <circleGeometry args={[0.85, 32]} />
        <meshBasicMaterial color="#000000" transparent opacity={locked ? 0.5 : 0.34} />
      </mesh>
    </group>
  )
}

function DeckDressing({ count, detail }: { count: number; detail: ReturnType<typeof detailFromQuality> }) {
  const width = (count + 1.5) * PAD_SPACING
  const centerX = ((count - 1) * PAD_SPACING) / 2
  const dashes = useMemo(() => {
    const step = detail === 'low' ? 1.8 : 0.9
    const xs: number[] = []
    for (let x = -PAD_SPACING; x <= (count - 1) * PAD_SPACING + PAD_SPACING; x += step) xs.push(x)
    return xs
  }, [count, detail])

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[centerX, 0, 0]}>
        <planeGeometry args={[width + 8, 16]} />
        <meshStandardMaterial color="#101b28" emissive="#071019" emissiveIntensity={0.28} metalness={0.5} roughness={0.74} />
      </mesh>
      <gridHelper args={[width + 8, Math.round((width + 8) / 0.8), '#1c3e5c', '#11273c']} position={[centerX, 0.006, 0]} />

      {[-2.55, 2.55].map((z) => (
        <group key={z}>
          <mesh position={[centerX, 0.05, z]}>
            <boxGeometry args={[width, 0.07, 0.09]} />
            <meshStandardMaterial color="#0f2231" emissive="#16405a" emissiveIntensity={0.5} metalness={0.8} roughness={0.35} />
          </mesh>
          {dashes.map((x) => (
            <mesh key={x} position={[x, 0.095, z]} rotation={[0, z > 0 ? -Math.PI / 4 : Math.PI / 4, 0]}>
              <boxGeometry args={[0.15, 0.024, 0.036]} />
              <meshBasicMaterial color="#5ee7ff" toneMapped={false} />
            </mesh>
          ))}
        </group>
      ))}

      {detail !== 'low' && (
        <group>
          {Array.from({ length: count + 2 }, (_, i) => {
            const x = (i - 1.5) * PAD_SPACING + PAD_SPACING / 2
            return (
              <group key={i} position={[x, 0, -6.4]}>
                <mesh position={[0, 1.7, 0]}>
                  <boxGeometry args={[0.85, 3.4, 0.7]} />
                  <meshStandardMaterial color="#0a1420" emissive="#081420" emissiveIntensity={0.24} metalness={0.6} roughness={0.6} />
                </mesh>
                <mesh position={[0, 2.1, 0.38]}>
                  <boxGeometry args={[0.08, 1.9, 0.02]} />
                  <meshBasicMaterial color="#1d5a7d" toneMapped={false} />
                </mesh>
              </group>
            )
          })}
          <mesh position={[centerX, 3.4, -7.6]}>
            <planeGeometry args={[width + 14, 8]} />
            <meshStandardMaterial color="#04070c" emissive="#050b14" emissiveIntensity={0.3} metalness={0.2} roughness={0.9} />
          </mesh>
        </group>
      )}
    </group>
  )
}

function SelectionLight({ targetX, reducedMotion }: { targetX: number; reducedMotion: boolean }) {
  const light = useRef<PointLight>(null)

  useFrame((_, delta) => {
    const l = light.current
    if (!l) return
    const ease = reducedMotion ? 1 : 1 - Math.exp(-delta * 5.4)
    l.position.x += (targetX - l.position.x) * ease
  })

  return (
    <pointLight
      ref={light}
      position={[targetX, 1.9, 1.35]}
      intensity={4.2}
      color="#bfe9ff"
      distance={6.5}
    />
  )
}

/** Full-bleed hangar deck: every kit parked on its pad, camera slides between them. */
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
      camera={{ position: [targetX + 1.3, 2.08, 3.62], fov: 30, near: 0.1, far: 60 }}
      gl={{
        antialias: quality !== 'low',
        alpha: false,
        toneMapping: ACESFilmicToneMapping,
        outputColorSpace: SRGBColorSpace,
      }}
      onCreated={({ camera, gl, scene }) => {
        camera.lookAt(targetX + 0.1, 0.34, -0.1)
        applyStudioEnvironment(gl, scene)
      }}
    >
      <DeckCamera targetX={targetX} reducedMotion={reducedMotion} />
      <color attach="background" args={[FOG_COLOR]} />
      <fog attach="fog" args={[FOG_COLOR, 6.5, 15.5]} />

      <ambientLight intensity={0.24} />
      <hemisphereLight args={['#8fb8d8', '#050a10', 0.6]} />
      <directionalLight position={[4, 6.4, 4.8]} intensity={1.75} color="#eef6ff" />
      <directionalLight position={[-3.4, 2.2, -2.4]} intensity={0.4} color="#3a6a98" />
      <directionalLight position={[0.6, -1.8, 3.4]} intensity={0.34} color="#58c8ff" />
      <SelectionLight targetX={targetX} reducedMotion={reducedMotion} />

      <DeckDressing count={kitIds.length} detail={detail} />
      {kitIds.map((id, slot) => (
        <group key={id}>
          <LandingPad
            x={slot * PAD_SPACING}
            accent={materialToken(kitRecipe(id).thrusterToken).emissive}
            active={slot === index}
            locked={lockedIds.includes(id)}
            reducedMotion={reducedMotion}
          />
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

      {bloom && (
        <EffectComposer multisampling={0}>
          <Bloom luminanceThreshold={0.72} intensity={0.55} mipmapBlur luminanceSmoothing={0.22} />
          <Vignette eskil={false} offset={0.24} darkness={0.66} />
        </EffectComposer>
      )}
    </Canvas>
  )
}
