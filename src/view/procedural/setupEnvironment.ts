import {
  ACESFilmicToneMapping,
  type Scene,
  type WebGLRenderer,
  SRGBColorSpace,
} from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { PMREMGenerator } from 'three'

let baked: ReturnType<PMREMGenerator['fromScene']>['texture'] | null = null

/** Neutral studio IBL so metal/clearcoat read (shader-cookbook RoomEnvironment recipe). */
export function applyStudioEnvironment(renderer: WebGLRenderer, scene: Scene): void {
  renderer.outputColorSpace = SRGBColorSpace
  renderer.toneMapping = ACESFilmicToneMapping
  // Deep void: low exposure; IBL only enough for metal edge read
  renderer.toneMappingExposure = 0.82

  if (!baked) {
    const pmrem = new PMREMGenerator(renderer)
    baked = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    pmrem.dispose()
  }
  scene.environment = baked
  scene.environmentIntensity = 0.28
}
