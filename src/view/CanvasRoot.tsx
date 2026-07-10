import { Canvas } from '@react-three/fiber'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import { ACESFilmicToneMapping, SRGBColorSpace } from 'three'
import { CAMERA_FOV, CAMERA_LOOK_AT, CAMERA_POS } from '../sim/constants'
import { useSessionStore } from '../app/sessionStore'
import { Playfield } from './Playfield'
import { PresentationDriver } from './PresentationDriver'
import { applyStudioEnvironment } from './procedural/setupEnvironment'
import { SimDriver } from './SimDriver'

export function CanvasRoot() {
  const quality = useSessionStore((s) => s.settings.quality)
  const bloom = quality !== 'low'
  const fogOn = quality !== 'low'

  return (
    <Canvas
      className="canvas-layer"
      dpr={quality === 'high' ? 1.5 : quality === 'medium' ? 1 : 0.85}
      camera={{
        position: [CAMERA_POS.x, CAMERA_POS.y, CAMERA_POS.z],
        fov: CAMERA_FOV,
        near: 0.1,
        far: 80,
      }}
      onCreated={({ camera, gl, scene }) => {
        camera.lookAt(CAMERA_LOOK_AT.x, CAMERA_LOOK_AT.y, CAMERA_LOOK_AT.z)
        applyStudioEnvironment(gl, scene)
      }}
      gl={{
        antialias: quality !== 'low',
        toneMapping: ACESFilmicToneMapping,
        outputColorSpace: SRGBColorSpace,
      }}
    >
      <color attach="background" args={['#03070B']} />
      {fogOn ? <fog attach="fog" args={['#03070B', 18, 48]} /> : null}
      <ambientLight intensity={0.12} />
      <hemisphereLight args={['#4a6a80', '#050810', 0.28]} />
      <directionalLight position={[4, 8, 10]} intensity={0.95} color="#d0e8ff" />
      <directionalLight position={[-6, 2, 4]} intensity={0.28} color="#2a4060" />
      <directionalLight position={[0, -2, 8]} intensity={0.22} color="#3a90b8" />

      <SimDriver />
      <Playfield />
      <PresentationDriver />

      {bloom && (
        <EffectComposer multisampling={0}>
          <Bloom luminanceThreshold={0.62} intensity={0.55} mipmapBlur luminanceSmoothing={0.18} />
          <Vignette eskil={false} offset={0.22} darkness={0.55} />
        </EffectComposer>
      )}
    </Canvas>
  )
}
