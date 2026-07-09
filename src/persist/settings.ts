import { readJson, writeJson } from './storage'

export type Quality = 'low' | 'medium' | 'high'

export type Settings = {
  quality: Quality
  master: number
  music: number
  sfx: number
}

const KEY = 'tcfu.settings'

const defaults: Settings = {
  quality: 'medium',
  master: 100,
  music: 0,
  sfx: 80,
}

export function loadSettings(): Settings {
  return { ...defaults, ...readJson(KEY, defaults) }
}

export function saveSettings(settings: Settings): void {
  writeJson(KEY, settings)
}
