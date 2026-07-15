import { CAMERA_LOOK_AT, CAMERA_POS } from '../sim/constants'
import type { WavePhase } from '../sim/types'

type RunCameraDirectionInput = {
  elapsed: number
  wave: number
  wavePhase: WavePhase
  setPieceX: number | null
  reducedMotion: boolean
}

export type RunCameraDirection = {
  position: { x: number; y: number; z: number }
  lookAt: { x: number; y: number; z: number }
  fovOffset: number
  setPieceWeight: number
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value))
}

function smoothstep01(value: number): number {
  const t = clamp01(value)
  return t * t * (3 - 2 * t)
}

/**
 * Authored targets for the Run camera. The rig remains corridor-locked: these
 * offsets are deliberately small enough that gameplay bounds do not drift out
 * of frame, even while a set-piece is being established.
 */
export function runCameraDirection({
  elapsed,
  wave,
  wavePhase,
  setPieceX,
  reducedMotion,
}: RunCameraDirectionInput): RunCameraDirection {
  const setPieceWave = wave >= 10 && wave % 10 === 0
  const setPieceActive = setPieceWave && wavePhase !== 'gap'
  const setPieceWeight = setPieceActive ? 1 : 0
  const bossX = Math.max(-4, Math.min(4, setPieceX ?? 0))

  // A short launch handoff echoes the Hangar's rear three-quarter preview,
  // then resolves into the fixed down-corridor gameplay frame.
  const launchWeight = reducedMotion ? 0 : 1 - smoothstep01(elapsed / 1.15)

  return {
    position: {
      x: launchWeight * 0.34 + setPieceWeight * bossX * 0.035,
      y: CAMERA_POS.y + launchWeight * 0.24 + setPieceWeight * 0.1,
      z: CAMERA_POS.z - launchWeight * 0.42 - setPieceWeight * 0.28,
    },
    lookAt: {
      x: -launchWeight * 0.08 + setPieceWeight * bossX * 0.045,
      y: CAMERA_LOOK_AT.y - launchWeight * 0.42 + setPieceWeight * 0.62,
      z: CAMERA_LOOK_AT.z + launchWeight * 0.12,
    },
    fovOffset: setPieceWeight > 0 ? -2.2 : 0,
    setPieceWeight,
  }
}

/** Low-amplitude, deterministic camera drift; never changes gameplay framing materially. */
export function runCameraSway(elapsed: number): {
  position: { x: number; y: number; z: number }
  lookX: number
  roll: number
} {
  return {
    position: {
      x: Math.sin(elapsed * 0.53) * 0.026 + Math.sin(elapsed * 0.19 + 0.8) * 0.012,
      y: Math.cos(elapsed * 0.41 + 0.3) * 0.016,
      z: Math.sin(elapsed * 0.29 + 1.4) * 0.012,
    },
    lookX: Math.sin(elapsed * 0.37 + 2.1) * 0.012,
    roll: Math.sin(elapsed * 0.31 + 0.4) * 0.0018,
  }
}
