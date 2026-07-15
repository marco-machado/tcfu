import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import { useEffect, useRef, useState } from 'react'
import { ACESFilmicToneMapping, type Group, PerspectiveCamera, SRGBColorSpace } from 'three'
import { useSessionStore } from '../../app/sessionStore'
import type { ShipId } from '../../sim/types'
import { getRoleMaterial } from './MaterialLibrary'
import { detailFromQuality } from './registry'
import { applyStudioEnvironment } from './setupEnvironment'
import { ShipKitVisual } from './ShipKitVisual'

type Props = {
  shipId: ShipId
}

function PreviewCamera() {
  const { camera, size } = useThree()

  useEffect(() => {
    if (!(camera instanceof PerspectiveCamera)) return
    const compact = size.width / size.height < 1.15
    const position = compact ? [2.08, 1.46, 3.08] : [1.72, 1.22, 2.5]
    camera.position.set(position[0]!, position[1]!, position[2]!)
    camera.fov = compact ? 31 : 29
    camera.lookAt(0, -0.1, 0)
    camera.updateProjectionMatrix()
  }, [camera, size.height, size.width])

  return null
}

function PreviewStage({
  shipId,
  detail,
  reducedMotion,
}: {
  shipId: ShipId
  detail: ReturnType<typeof detailFromQuality>
  reducedMotion: boolean
}) {
  const incoming = useRef<Group>(null)
  const outgoingGroup = useRef<Group>(null)
  const [displayedShip, setDisplayedShip] = useState(shipId)
  const [outgoingShip, setOutgoingShip] = useState<ShipId | null>(null)
  const transition = useRef(1)

  useEffect(() => {
    if (shipId === displayedShip) return
    setOutgoingShip(displayedShip)
    setDisplayedShip(shipId)
    transition.current = reducedMotion ? 1 : 0
  }, [displayedShip, reducedMotion, shipId])

  useFrame((state, delta) => {
    const next = incoming.current
    if (!next) return

    transition.current = Math.min(1, transition.current + delta / 0.42)
    const t = transition.current
    const eased = 1 - (1 - t) * (1 - t) * (1 - t)
    const idleYaw = reducedMotion ? 0 : Math.sin(state.clock.elapsedTime * 0.32) * 0.055

    next.position.set((1 - eased) * 0.72, -0.16, 0)
    next.scale.setScalar(0.92 + eased * 0.08)
    next.rotation.set(0.5, 0.5 + idleYaw + (1 - eased) * 0.24, 0.045 - (1 - eased) * 0.08)

    const previous = outgoingGroup.current
    if (previous) {
      previous.position.set(-eased * 0.68, -0.16, 0)
      previous.scale.setScalar(1 - eased * 0.08)
      previous.rotation.set(0.5, 0.5 + idleYaw - eased * 0.2, 0.045 + eased * 0.06)
    }

    if (t >= 1 && outgoingShip) setOutgoingShip(null)
  })

  return (
    <group>
      <group position={[0, -0.76, 0]}>
        <mesh position={[-1.12, 0.04, 0]}>
          <boxGeometry args={[0.08, 0.08, 1.65]} />
          <meshStandardMaterial color="#102838" emissive="#184a64" emissiveIntensity={0.35} metalness={0.8} roughness={0.38} />
        </mesh>
        <mesh position={[1.12, 0.04, 0]}>
          <boxGeometry args={[0.08, 0.08, 1.65]} />
          <meshStandardMaterial color="#102838" emissive="#184a64" emissiveIntensity={0.35} metalness={0.8} roughness={0.38} />
        </mesh>
        {[-0.72, -0.36, 0, 0.36, 0.72].map((z) => (
          <group key={z}>
            <mesh position={[-1.12, 0.09, z]} rotation={[0, Math.PI / 4, 0]}>
              <boxGeometry args={[0.14, 0.025, 0.035]} />
              <meshBasicMaterial color="#5ee7ff" toneMapped={false} />
            </mesh>
            <mesh position={[1.12, 0.09, z]} rotation={[0, -Math.PI / 4, 0]}>
              <boxGeometry args={[0.14, 0.025, 0.035]} />
              <meshBasicMaterial color="#5ee7ff" toneMapped={false} />
            </mesh>
          </group>
        ))}
      </group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.72, 0]}>
        <circleGeometry args={[0.9, 32]} />
        <primitive object={getRoleMaterial('groundContact')} attach="material" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.715, 0]}>
        <ringGeometry args={[0.38, 0.78, 32]} />
        <meshStandardMaterial
          color="#061018"
          emissive="#123048"
          emissiveIntensity={0.22}
          metalness={0.5}
          roughness={0.75}
          transparent
          opacity={0.45}
        />
      </mesh>

      {outgoingShip ? (
        <group ref={outgoingGroup} position={[0, -0.16, 0]}>
          <group scale={1.14}>
            <ShipKitVisual shipId={outgoingShip} detail={detail} />
          </group>
        </group>
      ) : null}
      <group ref={incoming} rotation={[0.5, 0.5, 0.045]} position={[0, -0.16, 0]}>
        <group scale={1.14}>
          <ShipKitVisual key={`${displayedShip}-${detail}`} shipId={displayedShip} detail={detail} />
        </group>
      </group>
    </group>
  )
}

/** Mini R3F scene using the same kit builders as the Run. */
export function ShipKitPreview({ shipId }: Props) {
  const quality = useSessionStore((s) => s.settings.quality)
  const reducedMotion = useSessionStore((s) => s.settings.reducedMotion)
  const detail = detailFromQuality(quality)
  const bloom = quality !== 'low'

  return (
    <div className="kit-preview-canvas">
      <Canvas
        className="kit-preview-r3f"
        dpr={quality === 'high' ? 1.75 : quality === 'medium' ? 1.35 : 1}
        camera={{ position: [1.72, 1.22, 2.5], fov: 29, near: 0.1, far: 40 }}
        gl={{
          antialias: quality !== 'low',
          alpha: false,
          toneMapping: ACESFilmicToneMapping,
          outputColorSpace: SRGBColorSpace,
        }}
        onCreated={({ camera, gl, scene }) => {
          camera.lookAt(0, -0.1, 0)
          applyStudioEnvironment(gl, scene)
        }}
      >
        <PreviewCamera />
        <color attach="background" args={['#071120']} />
        <fog attach="fog" args={['#071120', 5.5, 11]} />

        <ambientLight intensity={0.3} />
        <hemisphereLight args={['#9cc2de', '#0a1018', 0.75]} />
        <directionalLight position={[3.2, 3.8, 4.5]} intensity={2.3} color="#f0f7ff" />
        <directionalLight position={[1.2, 0.4, 5]} intensity={0.9} color="#b9dcf5" />
        <directionalLight position={[-3.2, 1.2, 1.5]} intensity={0.42} color="#3a6a98" />
        <directionalLight position={[0.2, -2.5, 2.5]} intensity={0.48} color="#58c8ff" />
        <pointLight position={[1.9, 1.35, 2.75]} intensity={4.5} color="#d8edff" distance={8} />
        <pointLight position={[0, -0.7, 0.15]} intensity={0.45} color="#40c0ff" distance={2.2} />

        <PreviewStage shipId={shipId} detail={detail} reducedMotion={reducedMotion} />

        {bloom && (
          <EffectComposer multisampling={0}>
            <Bloom luminanceThreshold={0.74} intensity={0.48} mipmapBlur luminanceSmoothing={0.22} />
            <Vignette eskil={false} offset={0.22} darkness={0.6} />
          </EffectComposer>
        )}
      </Canvas>
    </div>
  )
}
