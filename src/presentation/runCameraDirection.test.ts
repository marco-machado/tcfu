import { describe, expect, it } from 'vitest'
import { CAMERA_LOOK_AT, CAMERA_POS } from '../sim/constants'
import { runCameraDirection, runCameraSway } from './runCameraDirection'

describe('run camera direction', () => {
  it('settles into the fixed corridor frame after launch', () => {
    const shot = runCameraDirection({
      elapsed: 2,
      wave: 1,
      wavePhase: 'spawning',
      setPieceX: null,
      reducedMotion: false,
    })

    expect(shot.position).toEqual(CAMERA_POS)
    expect(shot.lookAt).toEqual(CAMERA_LOOK_AT)
    expect(shot.fovOffset).toBe(0)
  })

  it('uses no launch handoff with reduced motion', () => {
    const shot = runCameraDirection({
      elapsed: 0,
      wave: 1,
      wavePhase: 'spawning',
      setPieceX: null,
      reducedMotion: true,
    })

    expect(shot.position).toEqual(CAMERA_POS)
    expect(shot.lookAt).toEqual(CAMERA_LOOK_AT)
  })

  it('tightens and biases toward an active set-piece without abandoning the corridor frame', () => {
    const shot = runCameraDirection({
      elapsed: 5,
      wave: 10,
      wavePhase: 'await_clear',
      setPieceX: 3,
      reducedMotion: false,
    })

    expect(shot.setPieceWeight).toBe(1)
    expect(shot.position.x).toBeCloseTo(0.105)
    expect(shot.lookAt.x).toBeCloseTo(0.135)
    expect(shot.lookAt.y).toBeCloseTo(CAMERA_LOOK_AT.y + 0.62)
    expect(shot.fovOffset).toBe(-2.2)
  })

  it('keeps sway inside its subtle framing envelope', () => {
    for (let i = 0; i < 240; i++) {
      const sway = runCameraSway(i * 0.25)
      expect(Math.abs(sway.position.x)).toBeLessThanOrEqual(0.0381)
      expect(Math.abs(sway.position.y)).toBeLessThanOrEqual(0.0161)
      expect(Math.abs(sway.position.z)).toBeLessThanOrEqual(0.0121)
      expect(Math.abs(sway.roll)).toBeLessThanOrEqual(0.00181)
    }
  })
})
