import { musicGain, sfxGain } from '../sim/presentation'
import type { PresentationEventType } from '../sim/presentation'
import menuMusicUrl from '../../assets/audio/music/corridor-signal-loop.mp3'
import combatMusicUrl from '../../assets/audio/music/hard-lock-target.mp3'
import lanceFireUrl from '../../assets/audio/sfx/lance-fire.mp3'
import playerHitUrl from '../../assets/audio/sfx/player-hit.mp3'
import shieldBreakUrl from '../../assets/audio/sfx/shield-break.mp3'
import lifeLossUrl from '../../assets/audio/sfx/life-loss.mp3'
import deathUrl from '../../assets/audio/sfx/death.mp3'
import killUrl from '../../assets/audio/sfx/kill.mp3'
import bombUrl from '../../assets/audio/sfx/bomb.mp3'
import pickupUrl from '../../assets/audio/sfx/pickup.mp3'
import grazeUrl from '../../assets/audio/sfx/graze.mp3'
import comboBreakUrl from '../../assets/audio/sfx/combo-break.mp3'
import tierUpUrl from '../../assets/audio/sfx/tier-up.mp3'
import waveClearUrl from '../../assets/audio/sfx/wave-clear.mp3'
import uiConfirmUrl from '../../assets/audio/sfx/ui-confirm.mp3'
import uiMoveUrl from '../../assets/audio/sfx/ui-move.mp3'

export type SfxType = PresentationEventType | 'ui_confirm' | 'ui_move'

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
  loadAllSamples(c)
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

/**
 * Generated sample per event. `gain` scales the normalized file against the
 * SFX bus; `vary` is the +/- playbackRate jitter that keeps rapid repeats from
 * sounding machine-gunned (0 for melodic cues so their pitch stays true).
 */
type SampleSpec = { url: string; gain: number; vary: number }

const SAMPLE_SPECS: Partial<Record<SfxType, SampleSpec>> = {
  fire: { url: lanceFireUrl, gain: 0.2, vary: 0.06 },
  player_hit: { url: playerHitUrl, gain: 0.4, vary: 0.05 },
  shield_break: { url: shieldBreakUrl, gain: 0.35, vary: 0.04 },
  life_loss: { url: lifeLossUrl, gain: 0.45, vary: 0.03 },
  death: { url: deathUrl, gain: 0.5, vary: 0.03 },
  kill: { url: killUrl, gain: 0.25, vary: 0.08 },
  bomb: { url: bombUrl, gain: 0.55, vary: 0.02 },
  pickup: { url: pickupUrl, gain: 0.3, vary: 0 },
  graze: { url: grazeUrl, gain: 0.15, vary: 0.06 },
  combo_break: { url: comboBreakUrl, gain: 0.3, vary: 0 },
  tier_up: { url: tierUpUrl, gain: 0.4, vary: 0 },
  wave_clear: { url: waveClearUrl, gain: 0.45, vary: 0 },
  ui_confirm: { url: uiConfirmUrl, gain: 0.35, vary: 0 },
  ui_move: { url: uiMoveUrl, gain: 0.25, vary: 0 },
}

const sampleBuffers = new Map<SfxType, AudioBuffer>()
const sampleLoading = new Set<SfxType>()

function loadSample(c: AudioContext, type: SfxType): void {
  const spec = SAMPLE_SPECS[type]
  if (!spec || sampleBuffers.has(type) || sampleLoading.has(type)) return
  sampleLoading.add(type)
  void fetch(spec.url)
    .then((r) => r.arrayBuffer())
    .then((data) => c.decodeAudioData(data))
    .then((buffer) => {
      sampleBuffers.set(type, buffer)
    })
    .catch(() => {
      sampleLoading.delete(type)
    })
}

function loadAllSamples(c: AudioContext): void {
  for (const type of Object.keys(SAMPLE_SPECS) as SfxType[]) loadSample(c, type)
}

/** Plays the generated sample if decoded; returns false to fall back to synth. */
function playSample(c: AudioContext, type: SfxType, gain: number): boolean {
  const spec = SAMPLE_SPECS[type]
  if (!spec) return false
  const buffer = sampleBuffers.get(type)
  if (!buffer) {
    loadSample(c, type)
    return false
  }
  const src = c.createBufferSource()
  src.buffer = buffer
  src.playbackRate.value = 1 - spec.vary + Math.random() * spec.vary * 2
  const g = c.createGain()
  g.gain.value = spec.gain * gain
  src.connect(g)
  g.connect(c.destination)
  src.start()
  return true
}

export function playSfx(type: SfxType, settings: AudioSettings): void {
  const gain = sfxGain(settings.master, settings.sfx)
  if (gain <= 0) return
  const c = getCtx()
  if (!c || c.state === 'suspended') return

  if (playSample(c, type, gain)) return

  switch (type) {
    case 'fire':
      break
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
let hiddenSuspend = false
let pauseSuspend = false

function musicSuspended(): boolean {
  return hiddenSuspend || pauseSuspend
}

function applyMusicSuspend(): void {
  const el = musicEls[currentTrack]
  if (!el) return
  if (musicSuspended()) {
    el.pause()
  } else if (el.paused && el.volume > 0 && unlocked) {
    void el.play()
  }
}

export function setMusicGamePaused(paused: boolean): void {
  if (paused === pauseSuspend) return
  pauseSuspend = paused
  applyMusicSuspend()
}

if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    hiddenSuspend = document.hidden
    applyMusicSuspend()
  })
  window.addEventListener('blur', () => {
    hiddenSuspend = true
    applyMusicSuspend()
  })
  window.addEventListener('focus', () => {
    hiddenSuspend = document.hidden
    applyMusicSuspend()
  })
}

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
  if (gain <= 0 || musicSuspended()) {
    el.pause()
  } else if (el.paused && unlocked) {
    void el.play()
  }
}
