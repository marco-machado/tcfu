import { Canvas } from '@react-three/fiber'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import { ACESFilmicToneMapping, SRGBColorSpace } from 'three'
import { CAMERA_FOV } from '../sim/constants'
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
        position: [0, 5, 17],
        fov: CAMERA_FOV,
        near: 0.1,
        far: 80,
      }}
      onCreated={({ camera, gl, scene }) => {
        camera.lookAt(0, 6.5, 0)
        applyStudioEnvironment(gl, scene)
      }}
      gl={{
        antialias: quality !== 'low',
        toneMapping: ACESFilmicToneMapping,
        outputColorSpace: SRGBColorSpace,
      }}
    >
      <color attach="background" args={['#050a12']} />
      {fogOn ? <fog attach="fog" args={['#050a12', 22, 55]} /> : null}
      <ambientLight intensity={0.22} />
      <hemisphereLight args={['#7aa8c8', '#0a1018', 0.38]} />
      <directionalLight position={[4, 8, 10]} intensity={1.15} color="#e0f0ff" />
      <directionalLight position={[-6, 2, 4]} intensity={0.4} color="#3a6088" />
      <directionalLight position={[0, -2, 8]} intensity={0.3} color="#50b0e0" />

      <SimDriver />
      <Playfield />
      <PresentationDriver />

      {bloom && (
        <EffectComposer multisampling={0}>
          <Bloom luminanceThreshold={0.68} intensity={0.5} mipmapBlur luminanceSmoothing={0.2} />
          <Vignette eskil={false} offset={0.25} darkness={0.45} />
        </EffectComposer>
      )}
    </Canvas>
  )
}
