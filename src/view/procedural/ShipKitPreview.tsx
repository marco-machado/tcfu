import { Canvas, useFrame } from '@react-three/fiber'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import { useRef } from 'react'
import { ACESFilmicToneMapping, type Group, SRGBColorSpace } from 'three'
import { useSessionStore } from '../../app/sessionStore'
import type { ShipId } from '../../sim/types'
import { getRoleMaterial } from './MaterialLibrary'
import { detailFromQuality } from './registry'
import { applyStudioEnvironment } from './setupEnvironment'
import { ShipKitVisual } from './ShipKitVisual'

type Props = {
  shipId: ShipId
}

function PreviewStage({
  shipId,
  detail,
}: {
  shipId: ShipId
  detail: ReturnType<typeof detailFromQuality>
}) {
  const pivot = useRef<Group>(null)
  useFrame((state) => {
    if (!pivot.current) return
    pivot.current.rotation.y = 0.55 + Math.sin(state.clock.elapsedTime * 0.35) * 0.12
  })

  return (
    <group>
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

      <group ref={pivot} rotation={[0.42, 0.55, 0.06]} position={[0, -0.16, 0]}>
        <group scale={1.05}>
          <ShipKitVisual key={`${shipId}-${detail}`} shipId={shipId} detail={detail} />
        </group>
      </group>
    </group>
  )
}

/** Mini R3F scene using the same kit builders as the Run. */
export function ShipKitPreview({ shipId }: Props) {
  const quality = useSessionStore((s) => s.settings.quality)
  const detail = detailFromQuality(quality)
  const bloom = quality !== 'low'

  return (
    <div className="kit-preview-canvas">
      <Canvas
        className="kit-preview-r3f"
        dpr={quality === 'high' ? 1.75 : quality === 'medium' ? 1.35 : 1}
        camera={{ position: [1.9, 1.35, 2.75], fov: 30, near: 0.1, far: 40 }}
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
        <color attach="background" args={['#071120']} />
        <fog attach="fog" args={['#071120', 5.5, 11]} />

        <ambientLight intensity={0.3} />
        <hemisphereLight args={['#9cc2de', '#0a1018', 0.75]} />
        <directionalLight position={[3.2, 3.8, 4.5]} intensity={2.3} color="#f0f7ff" />
        <directionalLight position={[-3.2, 1.2, 1.5]} intensity={0.42} color="#3a6a98" />
        <directionalLight position={[0.2, -2.5, 2.5]} intensity={0.48} color="#58c8ff" />
        <pointLight position={[0, -0.7, 0.15]} intensity={0.45} color="#40c0ff" distance={2.2} />

        <PreviewStage shipId={shipId} detail={detail} />

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
