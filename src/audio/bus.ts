import { musicGain, sfxGain } from '../sim/presentation'
import type { PresentationEventType } from '../sim/presentation'
import menuMusicUrl from '../../assets/audio/music/corridor-signal-loop.mp3'
import combatMusicUrl from '../../assets/audio/music/hard-lock-target.mp3'

export type AudioSettings = {
  master: number
  music: number
  sfx: number
}

let ctx: AudioContext | null = null
let unlocked = false
let noiseBuffer: AudioBuffer | null = null

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

function getNoiseBuffer(c: AudioContext): AudioBuffer {
  if (noiseBuffer) return noiseBuffer
  const length = c.sampleRate * 0.6
  const buffer = c.createBuffer(1, length, c.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1
  noiseBuffer = buffer
  return buffer
}

/** Small pitch variance so repeats never sound machine-gunned. */
function vary(freq: number, cents = 40): number {
  return freq * Math.pow(2, ((Math.random() - 0.5) * cents) / 1200)
}

function tone(
  c: AudioContext,
  freq: number,
  duration: number,
  gain: number,
  type: OscillatorType = 'square',
  opts: { attack?: number; glideTo?: number; delay?: number } = {},
): void {
  if (gain <= 0) return
  const t0 = c.currentTime + (opts.delay ?? 0)
  const osc = c.createOscillator()
  const g = c.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t0)
  if (opts.glideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(20, opts.glideTo), t0 + duration)
  g.gain.setValueAtTime(0.0001, t0)
  g.gain.exponentialRampToValueAtTime(Math.max(0.0001, 0.12 * gain), t0 + (opts.attack ?? 0.01))
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration)
  osc.connect(g)
  g.connect(c.destination)
  osc.start(t0)
  osc.stop(t0 + duration + 0.02)
}

function noise(
  c: AudioContext,
  duration: number,
  gain: number,
  opts: { freq?: number; q?: number; type?: BiquadFilterType; delay?: number } = {},
): void {
  if (gain <= 0) return
  const t0 = c.currentTime + (opts.delay ?? 0)
  const src = c.createBufferSource()
  src.buffer = getNoiseBuffer(c)
  src.playbackRate.value = 0.8 + Math.random() * 0.4
  const filter = c.createBiquadFilter()
  filter.type = opts.type ?? 'bandpass'
  filter.frequency.value = opts.freq ?? 800
  filter.Q.value = opts.q ?? 0.9
  const g = c.createGain()
  g.gain.setValueAtTime(0.0001, t0)
  g.gain.exponentialRampToValueAtTime(Math.max(0.0001, 0.16 * gain), t0 + 0.008)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration)
  src.connect(filter)
  filter.connect(g)
  g.connect(c.destination)
  src.start(t0)
  src.stop(t0 + duration + 0.02)
}

export function playSfx(type: PresentationEventType | 'ui_confirm' | 'ui_move', settings: AudioSettings): void {
  const gain = sfxGain(settings.master, settings.sfx)
  if (gain <= 0) return
  const c = getCtx()
  if (!c || c.state === 'suspended') return

  switch (type) {
    case 'player_hit':
      tone(c, vary(170), 0.1, gain, 'sawtooth', { glideTo: 90 })
      noise(c, 0.12, gain * 0.8, { freq: 500, type: 'lowpass' })
      break
    case 'shield_break':
      tone(c, vary(540), 0.08, gain, 'triangle', { glideTo: 320 })
      noise(c, 0.14, gain * 0.6, { freq: 2400, q: 2 })
      break
    case 'life_loss':
      tone(c, vary(130), 0.22, gain, 'sawtooth', { glideTo: 55 })
      noise(c, 0.3, gain, { freq: 320, type: 'lowpass' })
      break
    case 'death':
      tone(c, 90, 0.5, gain, 'sawtooth', { glideTo: 32 })
      noise(c, 0.55, gain, { freq: 220, type: 'lowpass' })
      noise(c, 0.3, gain * 0.7, { freq: 1600, q: 1.4, delay: 0.05 })
      break
    case 'kill':
      tone(c, vary(430), 0.06, gain * 0.9, 'square', { glideTo: 220 })
      noise(c, 0.09, gain * 0.7, { freq: 1100, q: 1.2 })
      break
    case 'bomb':
      tone(c, 70, 0.4, gain, 'sine', { glideTo: 30 })
      noise(c, 0.45, gain, { freq: 240, type: 'lowpass' })
      noise(c, 0.2, gain * 0.8, { freq: 2000, q: 0.8, delay: 0.02 })
      break
    case 'pickup':
      tone(c, vary(620), 0.06, gain, 'triangle')
      tone(c, vary(930), 0.08, gain * 0.9, 'triangle', { delay: 0.05 })
      break
    case 'graze':
      tone(c, vary(1500, 90), 0.03, gain * 0.45, 'sine')
      break
    case 'combo_break':
      tone(c, 320, 0.09, gain * 0.7, 'square')
      tone(c, 240, 0.14, gain * 0.7, 'square', { delay: 0.08 })
      break
    case 'tier_up':
      tone(c, 440, 0.09, gain, 'triangle')
      tone(c, 660, 0.1, gain, 'triangle', { delay: 0.08 })
      tone(c, 880, 0.16, gain, 'triangle', { delay: 0.17 })
      break
    case 'wave_clear':
      tone(c, 523, 0.09, gain * 0.9, 'triangle')
      tone(c, 659, 0.09, gain * 0.9, 'triangle', { delay: 0.09 })
      tone(c, 784, 0.14, gain * 0.9, 'triangle', { delay: 0.18 })
      break
    case 'ui_confirm':
      tone(c, 520, 0.05, gain, 'sine')
      tone(c, 780, 0.06, gain * 0.8, 'sine', { delay: 0.04 })
      break
    case 'ui_move':
      tone(c, 400, 0.03, gain * 0.5, 'sine')
      break
    default:
      break
  }
}

export type MusicTrack = 'menu' | 'combat'

const musicUrls: Record<MusicTrack, string> = {
  menu: menuMusicUrl,
  combat: combatMusicUrl,
}

const musicEls: Partial<Record<MusicTrack, HTMLAudioElement>> = {}
let currentTrack: MusicTrack = 'menu'

export function syncMusic(settings: AudioSettings, track: MusicTrack = currentTrack): void {
  if (track !== currentTrack) {
    const previous = musicEls[currentTrack]
    if (previous) {
      previous.pause()
      previous.currentTime = 0
    }
    currentTrack = track
  }
  const gain = musicGain(settings.master, settings.music)
  let el = musicEls[track]
  if (!el) {
    if (!unlocked || gain <= 0) return
    el = new Audio(musicUrls[track])
    el.loop = true
    musicEls[track] = el
  }
  el.volume = Math.min(1, gain)
  if (gain <= 0) {
    el.pause()
  } else if (el.paused && unlocked) {
    void el.play()
  }
}
