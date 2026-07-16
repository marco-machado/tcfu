import { PerspectiveCamera, Vector3 } from 'three'
import { BAND, CAMERA_FOV, CAMERA_FOV_MAX, CAMERA_LOOK_AT, CAMERA_POS } from '../sim/constants'

/**
 * Widen the vertical FOV on narrow viewports so the full band (designed for a
 * 4:3 frame) stays horizontally visible on portrait phones.
 */
export function baseFovForAspect(aspect: number): number {
  const designAspect = 4 / 3
  if (aspect >= designAspect) return CAMERA_FOV
  const t = (Math.tan((CAMERA_FOV * Math.PI) / 360) * designAspect) / aspect
  return Math.min((Math.atan(t) * 360) / Math.PI, CAMERA_FOV_MAX)
}

const framingCamera = new PerspectiveCamera()
const corner = new Vector3()

/**
 * CSS-pixel width the corridor's near (bottom) edge projects to at the resting
 * camera frame. Uses the static framing (no shake or FOV punch) so DOM chrome
 * anchored to the band mouth stays stable during play.
 */
export function corridorBottomWidthPx(viewportW: number, viewportH: number): number {
  if (viewportW <= 0 || viewportH <= 0) return viewportW
  const aspect = viewportW / viewportH
  framingCamera.fov = baseFovForAspect(aspect)
  framingCamera.aspect = aspect
  framingCamera.near = 0.1
  framingCamera.far = 80
  framingCamera.position.set(CAMERA_POS.x, CAMERA_POS.y, CAMERA_POS.z)
  framingCamera.up.set(0, 1, 0)
  framingCamera.lookAt(CAMERA_LOOK_AT.x, CAMERA_LOOK_AT.y, CAMERA_LOOK_AT.z)
  framingCamera.updateMatrixWorld(true)
  framingCamera.updateProjectionMatrix()
  const right = corner.set(BAND.maxX, BAND.minY, 0).project(framingCamera).x
  const left = corner.set(BAND.minX, BAND.minY, 0).project(framingCamera).x
  return (Math.abs(right - left) / 2) * viewportW
}
