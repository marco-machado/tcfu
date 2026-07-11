import { Canvas } from '@react-three/fiber'
import { ACESFilmicToneMapping, SRGBColorSpace } from 'three'
import { CAMERA_FOV, CAMERA_LOOK_AT, CAMERA_POS } from '../sim/constants'
import { applyStudioEnvironment } from '../view/procedural/setupEnvironment'
import { WorldCorridor } from '../view/procedural/WorldCorridor'

/**
 * Shared out-of-run backdrop: the same corridor the player flies, drifting
 * behind every menu so screens read as views inside the game world.
 */
export function MenuBackdrop() {
  return (
    <div className="menu-backdrop" aria-hidden="true">
      <Canvas
        dpr={1}
        camera={{
          position: [CAMERA_POS.x, CAMERA_POS.y, CAMERA_POS.z],
          fov: CAMERA_FOV,
          near: 0.1,
          far: 80,
        }}
        gl={{
          antialias: false,
          toneMapping: ACESFilmicToneMapping,
          outputColorSpace: SRGBColorSpace,
          powerPreference: 'low-power',
        }}
        onCreated={({ camera, gl, scene }) => {
          camera.lookAt(CAMERA_LOOK_AT.x, CAMERA_LOOK_AT.y, CAMERA_LOOK_AT.z)
          applyStudioEnvironment(gl, scene)
        }}
      >
        <color attach="background" args={['#030710']} />
        <fog attach="fog" args={['#040a14', 16, 48]} />
        <ambientLight intensity={0.08} />
        <hemisphereLight args={['#41607a', '#050910', 0.24]} />
        <directionalLight position={[3, 10, 8]} intensity={0.6} color="#c8e4ff" />
        <WorldCorridor detail="medium" />
      </Canvas>
      <div className="menu-backdrop-fade" />
    </div>
  )
}
