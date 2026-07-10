/** Shared transient feedback written by the presentation driver and read by visual consumers. */
export const presentationFxState = {
  playerFlash: 0,
  bombPulse: 0,
  hudDamage: 0,
  hudShieldBreak: 0,
  hudLifeLoss: 0,
}

export function resetPresentationFx(): void {
  presentationFxState.playerFlash = 0
  presentationFxState.bombPulse = 0
  presentationFxState.hudDamage = 0
  presentationFxState.hudShieldBreak = 0
  presentationFxState.hudLifeLoss = 0
}
