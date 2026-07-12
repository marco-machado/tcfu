/** Debug camera tuning side-channel: overrides read by the camera rig, live values read by the debug panel. */
type CameraOverride = {
  fov: number | null
  posX: number | null
  posY: number | null
  posZ: number | null
  lookX: number | null
  lookY: number | null
  lookZ: number | null
}

export const debugCameraOverride: CameraOverride = {
  fov: null,
  posX: null,
  posY: null,
  posZ: null,
  lookX: null,
  lookY: null,
  lookZ: null,
}

export const debugCameraLive = {
  baseFov: 0,
  fov: 0,
  posX: 0,
  posY: 0,
  posZ: 0,
  lookX: 0,
  lookY: 0,
  lookZ: 0,
}

export function resetDebugCameraOverride(): void {
  debugCameraOverride.fov = null
  debugCameraOverride.posX = null
  debugCameraOverride.posY = null
  debugCameraOverride.posZ = null
  debugCameraOverride.lookX = null
  debugCameraOverride.lookY = null
  debugCameraOverride.lookZ = null
}
