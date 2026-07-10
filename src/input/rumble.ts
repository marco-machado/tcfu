import type { PresentationEventType } from '../sim/presentation'

type RumbleSpec = { durationMs: number; weak: number; strong: number }

const SPECS: Partial<Record<PresentationEventType, RumbleSpec>> = {
  player_hit: { durationMs: 100, weak: 0.45, strong: 0.15 },
  life_loss: { durationMs: 200, weak: 0.7, strong: 0.45 },
  bomb: { durationMs: 150, weak: 0.55, strong: 0.35 },
  death: { durationMs: 220, weak: 0.8, strong: 0.6 },
}

export function rumbleForEvent(type: PresentationEventType): void {
  const spec = SPECS[type]
  if (!spec) return
  if (typeof navigator === 'undefined' || !navigator.getGamepads) return

  const pads = navigator.getGamepads()
  for (const pad of pads) {
    if (!pad) continue
    const actuator = (
      pad as Gamepad & {
        vibrationActuator?: { playEffect: (type: string, params: object) => Promise<unknown> }
      }
    ).vibrationActuator
    if (!actuator?.playEffect) continue
    void actuator.playEffect('dual-rumble', {
      startDelay: 0,
      duration: spec.durationMs,
      weakMagnitude: spec.weak,
      strongMagnitude: spec.strong,
    })
  }
}
