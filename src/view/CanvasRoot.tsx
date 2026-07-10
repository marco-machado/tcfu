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
      <color attach="background" args={['#020508']} />
      {fogOn ? <fog attach="fog" args={['#020508', 14, 42]} /> : null}
      <ambientLight intensity={0.06} />
      <hemisphereLight args={['#3a5568', '#020508', 0.18]} />
      <directionalLight position={[3, 10, 8]} intensity={0.72} color="#c8e4ff" />
      <directionalLight position={[-5, 1, 3]} intensity={0.18} color="#1a3048" />
      <directionalLight position={[0, -4, 6]} intensity={0.35} color="#40b0e0" />

      <SimDriver />
      <Playfield />
      <PresentationDriver />

      {bloom && (
        <EffectComposer multisampling={0}>
          <Bloom luminanceThreshold={0.55} intensity={0.72} mipmapBlur luminanceSmoothing={0.15} />
          <Vignette eskil={false} offset={0.18} darkness={0.62} />
        </EffectComposer>
      )}
    </Canvas>
  )
}
