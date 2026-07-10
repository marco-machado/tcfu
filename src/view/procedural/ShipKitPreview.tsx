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

      <group ref={pivot} rotation={[0.42, 0.55, 0.06]} position={[0, -0.05, 0]}>
        <group scale={1.22}>
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
        camera={{ position: [1.85, -1.15, 2.45], fov: 26, near: 0.1, far: 40 }}
        gl={{
          antialias: quality !== 'low',
          alpha: false,
          toneMapping: ACESFilmicToneMapping,
          outputColorSpace: SRGBColorSpace,
        }}
        onCreated={({ camera, gl, scene }) => {
          camera.lookAt(0, 0.05, 0)
          applyStudioEnvironment(gl, scene)
        }}
      >
        <color attach="background" args={['#03070e']} />
        <fog attach="fog" args={['#03070e', 5, 10]} />

        <ambientLight intensity={0.16} />
        <hemisphereLight args={['#90b8d8', '#060a10', 0.48]} />
        <directionalLight position={[3.2, 3.8, 4.5]} intensity={1.55} color="#f0f7ff" />
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
