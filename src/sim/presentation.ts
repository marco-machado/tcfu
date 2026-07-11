export type PresentationEventType =
  | 'fire'
  | 'player_hit'
  | 'shield_break'
  | 'life_loss'
  | 'death'
  | 'kill'
  | 'bomb'
  | 'pickup'
  | 'graze'
  | 'combo_break'
  | 'tier_up'
  | 'wave_clear'

export type PresentationEvent = {
  type: PresentationEventType
  x: number
  y: number
}

export const PRESENTATION_BUFFER_CAPACITY = 64

export type PresentationBuffer = {
  events: PresentationEvent[]
  capacity: number
}

export function createPresentationBuffer(
  capacity = PRESENTATION_BUFFER_CAPACITY,
): PresentationBuffer {
  return { events: [], capacity }
}

export function pushPresentation(buffer: PresentationBuffer, event: PresentationEvent): void {
  buffer.events.push(event)
  while (buffer.events.length > buffer.capacity) {
    buffer.events.shift()
  }
}

/** Drain all pending events (copy) and clear the buffer. */
export function drainPresentation(buffer: PresentationBuffer): PresentationEvent[] {
  if (buffer.events.length === 0) return []
  const out = buffer.events.slice()
  buffer.events.length = 0
  return out
}

export function presentationEventCount(buffer: PresentationBuffer): number {
  return buffer.events.length
}

/** Linear 0–100 setting → 0–1 gain. */
export function settingToGain(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 0
  if (value >= 100) return 1
  return value / 100
}

/** Final SFX gain = master × sfx. */
export function sfxGain(master: number, sfx: number): number {
  return settingToGain(master) * settingToGain(sfx)
}

/** Final music gain = master × music. */
export function musicGain(master: number, music: number): number {
  return settingToGain(master) * settingToGain(music)
}
