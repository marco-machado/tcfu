/** Shared transient feedback written by the presentation driver and read by visual consumers. */
export const presentationFxState = {
  playerFlash: 0,
  bombPulse: 0,
  hudDamage: 0,
  hudShieldBreak: 0,
  hudLifeLoss: 0,
  hudGraze: 0,
  hudComboBreak: 0,
  hudWaveClear: 0,
  hudTierUp: 0,
  /** Gameplay-delta scale window (seconds remaining, real time). */
  hitstopRemaining: 0,
  hitstopScale: 1,
}

export function triggerHitstop(durationSec: number, scale = 0.08): void {
  presentationFxState.hitstopRemaining = Math.max(
    presentationFxState.hitstopRemaining,
    durationSec,
  )
  presentationFxState.hitstopScale = scale
}

export function resetPresentationFx(): void {
  presentationFxState.playerFlash = 0
  presentationFxState.bombPulse = 0
  presentationFxState.hudDamage = 0
  presentationFxState.hudShieldBreak = 0
  presentationFxState.hudLifeLoss = 0
  presentationFxState.hudGraze = 0
  presentationFxState.hudComboBreak = 0
  presentationFxState.hudWaveClear = 0
  presentationFxState.hudTierUp = 0
  presentationFxState.hitstopRemaining = 0
  presentationFxState.hitstopScale = 1
}
