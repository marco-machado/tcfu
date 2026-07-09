import type { ShipId } from './types'

export type WeaponShot = {
  offsetX: number
  vx: number
  vy: number
  damage: number
  r: number
  pierce: number
}

export type WeaponStats = {
  cooldown: number
  shots: WeaponShot[]
}

export type WeaponTier = 0 | 1 | 2 | 3

export const WEAPON_TIER_MAX: WeaponTier = 3
const tierThresholds = [20, 50, 100] as const

const straight = (offsetX: number, damage: number, vy: number, r = 0.12, pierce = 0): WeaponShot => ({
  offsetX,
  vx: 0,
  vy,
  damage,
  r,
  pierce,
})

const fan = (angle: number, damage: number, speed: number, r = 0.12): WeaponShot => ({
  offsetX: 0,
  vx: Math.sin(angle) * speed,
  vy: Math.cos(angle) * speed,
  damage,
  r,
  pierce: 0,
})

const weaponTiers: Record<ShipId, WeaponStats[]> = {
  vanguard: [
    { cooldown: 0.18, shots: [straight(0, 1, 18)] },
    { cooldown: 0.15, shots: [straight(0, 1, 18)] },
    { cooldown: 0.15, shots: [straight(-0.25, 1, 18), straight(0.25, 1, 18)] },
    { cooldown: 0.14, shots: [fan(-0.2094, 1, 18), fan(0, 1, 18), fan(0.2094, 1, 18)] },
  ],
  striker: [
    { cooldown: 0.14, shots: [straight(-0.3, 1, 20), straight(0.3, 1, 20)] },
    { cooldown: 0.12, shots: [straight(-0.3, 1, 20), straight(0.3, 1, 20)] },
    { cooldown: 0.12, shots: [straight(-0.3, 1.5, 22), straight(0.3, 1.5, 22)] },
    { cooldown: 0.11, shots: [straight(-0.3, 1.5, 22), straight(0, 1.5, 22), straight(0.3, 1.5, 22)] },
  ],
  aegis: [
    { cooldown: 0.22, shots: [fan(-0.2618, 1, 16), fan(0.2618, 1, 16)] },
    { cooldown: 0.2, shots: [fan(-0.3142, 1, 16), fan(0, 1, 16), fan(0.3142, 1, 16)] },
    { cooldown: 0.18, shots: [fan(-0.3142, 1, 17), fan(0, 1, 17), fan(0.3142, 1, 17)] },
    {
      cooldown: 0.18,
      shots: [fan(-0.4189, 1, 17), fan(-0.2094, 1, 17), fan(0, 1, 17), fan(0.2094, 1, 17), fan(0.4189, 1, 17)],
    },
  ],
  phantom: [
    { cooldown: 0.1, shots: [straight(0, 1, 26, 0.08)] },
    { cooldown: 0.08, shots: [straight(0, 1, 26, 0.08)] },
    { cooldown: 0.08, shots: [straight(-0.15, 1, 28, 0.08), straight(0.15, 1, 28, 0.08)] },
    { cooldown: 0.07, shots: [straight(-0.15, 1, 28, 0.08, 1), straight(0.15, 1, 28, 0.08, 1)] },
  ],
}

export function weaponTierForWCells(wCells: number): WeaponTier {
  for (let tier = WEAPON_TIER_MAX; tier > 0; tier -= 1) {
    if (wCells >= tierThresholds[tier - 1]!) return tier as WeaponTier
  }
  return 0
}

export function nextWeaponTierThreshold(wCells: number): number | null {
  return tierThresholds.find((threshold) => wCells < threshold) ?? null
}

export function weaponFor(shipId: ShipId, tier: WeaponTier): WeaponStats {
  const base = weaponTiers[shipId][tier]!
  if (shipId !== 'striker') return base
  return {
    ...base,
    shots: base.shots.map((shot) => ({ ...shot, damage: shot.damage * 1.1 })),
  }
}
