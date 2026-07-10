import { Canvas } from '@react-three/fiber'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import { CAMERA_FOV } from '../sim/constants'
import { useSessionStore } from '../app/sessionStore'
import { Playfield } from './Playfield'
import { PresentationDriver } from './PresentationDriver'
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
      onCreated={({ camera }) => {
        camera.lookAt(0, 6.5, 0)
      }}
      gl={{ antialias: quality !== 'low' }}
    >
      <color attach="background" args={['#050a12']} />
      {fogOn ? <fog attach="fog" args={['#050a12', 22, 55]} /> : null}
      <ambientLight intensity={0.35} />
      <directionalLight position={[4, 8, 10]} intensity={1.1} color="#cfe9ff" />
      <directionalLight position={[-6, 2, 4]} intensity={0.35} color="#446688" />

      <SimDriver />
      <Playfield />
      <PresentationDriver />

      {bloom && (
        <EffectComposer multisampling={0}>
          <Bloom luminanceThreshold={0.55} intensity={0.55} mipmapBlur />
          <Vignette eskil={false} offset={0.25} darkness={0.45} />
        </EffectComposer>
      )}
    </Canvas>
  )
}
