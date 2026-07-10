import type { ShipId } from './types'

export type ShipPassiveId = 'none' | 'dmg_10' | 'start_shield' | 'iframe_bonus'

export type ShipKit = {
  id: ShipId
  name: string
  blurb: string
  unlockScore: number
  moveMult: number
  hitboxR: number
  maxHp: number
  startBombs: number
  maxBombs: number
  weaponId: string
  weaponName: string
  passiveId: ShipPassiveId
  passiveLine: string
  /** Grant shield at Run start and every respawn. */
  startShieldEachLife: boolean
  /** Base hit i-frames duration (seconds). */
  hitIFrames: number
  /** Multiplier on weapon tier damage (Striker dmg_10). */
  damageMult: number
}

const kits: Record<ShipId, ShipKit> = {
  vanguard: {
    id: 'vanguard',
    name: 'Vanguard',
    blurb: 'Reliable frontline interceptor. Tuning baseline.',
    unlockScore: 0,
    moveMult: 1,
    hitboxR: 0.35,
    maxHp: 3,
    startBombs: 2,
    maxBombs: 5,
    weaponId: 'pulse_cannon',
    weaponName: 'Pulse Cannon',
    passiveId: 'none',
    passiveLine: 'No passive',
    startShieldEachLife: false,
    hitIFrames: 1,
    damageMult: 1,
  },
  striker: {
    id: 'striker',
    name: 'Striker',
    blurb: 'Hot rod gunship. Higher DPS, glass hull.',
    unlockScore: 25_000,
    moveMult: 1.15,
    hitboxR: 0.32,
    maxHp: 2,
    startBombs: 2,
    maxBombs: 5,
    weaponId: 'twin_lance',
    weaponName: 'Twin Lance',
    passiveId: 'dmg_10',
    passiveLine: 'Weapon damage +10%',
    startShieldEachLife: false,
    hitIFrames: 1,
    damageMult: 1.1,
  },
  aegis: {
    id: 'aegis',
    name: 'Aegis',
    blurb: 'Armored wing. Survives messy patterns.',
    unlockScore: 75_000,
    moveMult: 0.9,
    hitboxR: 0.38,
    maxHp: 3,
    startBombs: 3,
    maxBombs: 5,
    weaponId: 'wide_pulse',
    weaponName: 'Wide Pulse',
    passiveId: 'start_shield',
    passiveLine: 'Shield at start of each life',
    startShieldEachLife: true,
    hitIFrames: 1,
    damageMult: 1,
  },
  phantom: {
    id: 'phantom',
    name: 'Phantom',
    blurb: 'Ghost interceptor. Dance the band.',
    unlockScore: 150_000,
    moveMult: 1.25,
    hitboxR: 0.28,
    maxHp: 3,
    startBombs: 2,
    maxBombs: 5,
    weaponId: 'needle',
    weaponName: 'Needle',
    passiveId: 'iframe_bonus',
    passiveLine: 'Hit i-frames 1.25 s',
    startShieldEachLife: false,
    hitIFrames: 1.25,
    damageMult: 1,
  },
}

export const SHIP_KIT_IDS: ShipId[] = ['vanguard', 'striker', 'aegis', 'phantom']

export function shipKit(shipId: ShipId): ShipKit {
  return kits[shipId] ?? kits.vanguard
}

export function isShipUnlocked(shipId: ShipId, careerBestScore: number): boolean {
  return careerBestScore >= shipKit(shipId).unlockScore
}

/** Kits that become available when career best moves from previous to next score. */
export function kitsNewlyUnlocked(previousBest: number, nextBest: number): ShipKit[] {
  if (nextBest <= previousBest) return []
  return SHIP_KIT_IDS.map(shipKit).filter(
    (kit) => kit.unlockScore > previousBest && kit.unlockScore <= nextBest,
  )
}

export function resolveSelectedShip(shipId: ShipId, careerBestScore: number): ShipId {
  if (isShipUnlocked(shipId, careerBestScore)) return shipId
  return 'vanguard'
}
