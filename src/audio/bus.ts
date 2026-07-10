import { musicGain, sfxGain } from '../sim/presentation'
import type { PresentationEventType } from '../sim/presentation'

export type AudioSettings = {
  master: number
  music: number
  sfx: number
}

let ctx: AudioContext | null = null
let unlocked = false

function getCtx(): AudioContext | null {
  if (typeof AudioContext === 'undefined' && typeof window === 'undefined') return null
  const AC =
    typeof AudioContext !== 'undefined'
      ? AudioContext
      : (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AC) return null
  if (!ctx) ctx = new AC()
  return ctx
}

export function unlockAudio(): void {
  const c = getCtx()
  if (!c) return
  unlocked = true
  if (c.state === 'suspended') void c.resume()
}

export function isAudioUnlocked(): boolean {
  return unlocked
}

function beep(
  c: AudioContext,
  freq: number,
  duration: number,
  gain: number,
  type: OscillatorType = 'square',
): void {
  if (gain <= 0) return
  const t0 = c.currentTime
  const osc = c.createOscillator()
  const g = c.createGain()
  osc.type = type
  osc.frequency.value = freq
  g.gain.setValueAtTime(0.0001, t0)
  g.gain.exponentialRampToValueAtTime(Math.max(0.0001, 0.12 * gain), t0 + 0.01)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration)
  osc.connect(g)
  g.connect(c.destination)
  osc.start(t0)
  osc.stop(t0 + duration + 0.02)
}

export function playSfx(type: PresentationEventType | 'ui_confirm', settings: AudioSettings): void {
  const gain = sfxGain(settings.master, settings.sfx)
  if (gain <= 0) return
  const c = getCtx()
  if (!c || c.state === 'suspended') return

  switch (type) {
    case 'player_hit':
      beep(c, 180, 0.08, gain, 'sawtooth')
      break
    case 'shield_break':
      beep(c, 520, 0.07, gain, 'triangle')
      break
    case 'life_loss':
      beep(c, 120, 0.16, gain, 'sawtooth')
      break
    case 'death':
      beep(c, 90, 0.28, gain, 'sawtooth')
      break
    case 'kill':
      beep(c, 440, 0.05, gain, 'square')
      break
    case 'bomb':
      beep(c, 80, 0.2, gain, 'square')
      break
    case 'pickup':
      beep(c, 660, 0.06, gain, 'triangle')
      break
    case 'ui_confirm':
      beep(c, 520, 0.05, gain, 'sine')
      break
    default:
      break
  }
}

export function playMusicStub(_settings: AudioSettings): void {
  // Music channel reserved; default volume 0 and no track yet.
  void musicGain
}
