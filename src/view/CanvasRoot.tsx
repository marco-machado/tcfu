import { Canvas } from '@react-three/fiber'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import { ACESFilmicToneMapping, SRGBColorSpace } from 'three'
import { CAMERA_FOV, CAMERA_LOOK_AT, CAMERA_POS } from '../sim/constants'
import { useSessionStore } from '../app/sessionStore'
import { isDebugMode } from '../app/debugMode'
import { DebugHitboxes } from './DebugHitboxes'
import { Playfield } from './Playfield'
import { PresentationDriver } from './PresentationDriver'
import { applyStudioEnvironment } from './procedural/setupEnvironment'
import { QualityDiagnostics } from './QualityDiagnostics'
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
      <color attach="background" args={['#030710']} />
      {fogOn ? <fog attach="fog" args={['#040a14', 18, 52]} /> : null}
      <ambientLight intensity={0.15} />
      <hemisphereLight args={['#547693', '#070c14', 0.5]} />
      <directionalLight position={[3, 10, 8]} intensity={1.1} color="#c8e4ff" />
      <directionalLight position={[-6, 2, 4]} intensity={0.3} color="#2a4a68" />
      <directionalLight position={[0, -4, 6]} intensity={0.85} color="#7cc8e8" />

      <SimDriver />
      {isDebugMode() && <DebugHitboxes />}
      <Playfield />
      <PresentationDriver />
      <QualityDiagnostics />

      {bloom && (
        <EffectComposer multisampling={0}>
          <Bloom luminanceThreshold={0.62} intensity={0.85} mipmapBlur luminanceSmoothing={0.2} />
          <Vignette eskil={false} offset={0.16} darkness={0.55} />
        </EffectComposer>
      )}
    </Canvas>
  )
}
