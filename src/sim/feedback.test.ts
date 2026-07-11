import { describe, expect, it } from 'vitest'
import { emptyCommands, type Commands } from '../input/commands'
import {
  COMBO_WINDOW,
  FIXED_DT,
  GRAZE_COMBO_TOPUP,
  GRAZE_RADIUS_BONUS,
  GRAZE_SCORE,
  MAGNET_RADIUS,
  comboMultiplier,
  waveMultiplier,
} from './constants'
import { DEFAULT_META_MODIFIERS, type MetaModifiers } from './metaModifiers'
import { presentationEventCount, drainPresentation } from './presentation'
import { stepWorld } from './step'
import { createWorld as createWorldBase } from './world'
import type { World } from './types'

function createWorld(
  shipId: Parameters<typeof createWorldBase>[0] = 'vanguard',
  meta: MetaModifiers = DEFAULT_META_MODIFIERS,
): World {
  const world = createWorldBase(shipId, meta)
  world.rng = () => 0.99
  world.waves.suspended = true
  return world
}

function idle(): Commands {
  return emptyCommands()
}

function steps(world: World, n: number, commands: Commands = idle(), dt = FIXED_DT): void {
  for (let i = 0; i < n; i++) stepWorld(world, dt, commands)
}

function placeEnemyBullet(world: World, x: number, y: number, vx = 0, vy = 0) {
  const slot = world.enemyBullets.find((b) => !b.active)!
  slot.active = true
  slot.x = x
  slot.y = y
  slot.vx = vx
  slot.vy = vy
  slot.r = 0.15
  slot.damage = 1
  slot.grazed = false
  return slot
}

function killDroneAt(world: World, x: number, y: number): void {
  const slot = world.enemies.find((e) => !e.active)!
  slot.active = true
  slot.kind = 'drone'
  slot.class = 'fodder'
  slot.x = x
  slot.y = y
  slot.vy = 0
  slot.r = 0.4
  slot.halfW = 0
  slot.halfH = 0
  slot.hp = 1
  slot.maxHp = 1
  slot.points = 100
  slot.contactDamage = 1
  slot.fireInterval = 0
  slot.path = 'drift_down'
  slot.waveId = world.session.wave
  slot.shotStyle = 'none'
  slot.age = 0
  const bullet = world.playerBullets.find((b) => !b.active)!
  bullet.active = true
  bullet.x = x
  bullet.y = y
  bullet.vx = 0
  bullet.vy = 0
  bullet.r = 0.12
  bullet.damage = 5
  bullet.pierce = 0
  bullet.hitEnemyIds = []
  stepWorld(world, FIXED_DT, idle())
}

describe('graze', () => {
  it('awards score and one graze per bullet passing the graze ring', () => {
    const world = createWorld()
    const p = world.player
    const bullet = placeEnemyBullet(world, p.x + p.hitboxR + GRAZE_RADIUS_BONUS - 0.05, p.y)
    const before = world.session.score
    steps(world, 1)
    expect(world.session.grazes).toBe(1)
    expect(world.session.score).toBe(before + GRAZE_SCORE)
    expect(bullet.grazed).toBe(true)
    steps(world, 1)
    expect(world.session.grazes).toBe(1)
  })

  it('does not graze a bullet that is inside the hitbox (that is a hit)', () => {
    const world = createWorld()
    const p = world.player
    placeEnemyBullet(world, p.x, p.y)
    steps(world, 1)
    expect(world.session.grazes).toBe(0)
    expect(p.hp).toBe(p.maxHp - 1)
  })

  it('does not graze while invulnerable', () => {
    const world = createWorld()
    const p = world.player
    p.iFrames = 1
    placeEnemyBullet(world, p.x + p.hitboxR + 0.2, p.y)
    steps(world, 1)
    expect(world.session.grazes).toBe(0)
  })

  it('pushes a graze presentation event', () => {
    const world = createWorld()
    const p = world.player
    placeEnemyBullet(world, p.x + p.hitboxR + 0.2, p.y)
    steps(world, 1)
    const events = drainPresentation(world.presentation)
    expect(events.some((e) => e.type === 'graze')).toBe(true)
  })

  it('tops the combo timer up to the graze floor when a chain is live', () => {
    const world = createWorld()
    killDroneAt(world, world.player.x, world.player.y + 4)
    world.session.comboTimer = 0.1
    placeEnemyBullet(world, world.player.x + world.player.hitboxR + 0.2, world.player.y)
    steps(world, 1)
    expect(world.session.comboTimer).toBeCloseTo(GRAZE_COMBO_TOPUP, 5)
  })
})

describe('combo', () => {
  it('chains kills and applies the combo multiplier to kill score', () => {
    const world = createWorld()
    killDroneAt(world, 0, 7.5)
    expect(world.session.combo).toBe(1)
    const before = world.session.score
    killDroneAt(world, 0, 7.5)
    expect(world.session.combo).toBe(2)
    const gained = world.session.score - before
    expect(gained).toBe(Math.floor(100 * waveMultiplier(1) * comboMultiplier(2)))
  })

  it('breaks the combo when the window expires', () => {
    const world = createWorld()
    killDroneAt(world, 0, 7.5)
    steps(world, Math.ceil(COMBO_WINDOW / FIXED_DT) + 1)
    expect(world.session.combo).toBe(0)
  })

  it('tracks the best combo across the run', () => {
    const world = createWorld()
    killDroneAt(world, 0, 7.5)
    killDroneAt(world, 0, 7.5)
    steps(world, Math.ceil(COMBO_WINDOW / FIXED_DT) + 1)
    killDroneAt(world, 0, 7.5)
    expect(world.session.bestCombo).toBe(2)
  })

  it('resets the combo when the hull takes damage', () => {
    const world = createWorld()
    killDroneAt(world, 0, 7.5)
    expect(world.session.combo).toBe(1)
    placeEnemyBullet(world, world.player.x, world.player.y)
    steps(world, 1)
    expect(world.session.combo).toBe(0)
  })

  it('emits combo_break only for chains of at least five', () => {
    const world = createWorld()
    for (let i = 0; i < 5; i++) killDroneAt(world, 0, 7.5)
    drainPresentation(world.presentation)
    steps(world, Math.ceil(COMBO_WINDOW / FIXED_DT) + 1)
    const events = drainPresentation(world.presentation)
    expect(events.some((e) => e.type === 'combo_break')).toBe(true)

    killDroneAt(world, 0, 7.5)
    drainPresentation(world.presentation)
    steps(world, Math.ceil(COMBO_WINDOW / FIXED_DT) + 1)
    const events2 = drainPresentation(world.presentation)
    expect(events2.some((e) => e.type === 'combo_break')).toBe(false)
  })
})

describe('magnet', () => {
  it('pulls a powerup inside the magnet radius toward the player', () => {
    const world = createWorld()
    const p = world.player
    const powerup = world.powerups[0]!
    powerup.active = true
    powerup.type = 'repair'
    powerup.x = p.x + MAGNET_RADIUS - 0.4
    powerup.y = p.y
    const startDx = Math.abs(powerup.x - p.x)
    steps(world, 6)
    expect(Math.abs(powerup.x - p.x)).toBeLessThan(startDx)
  })

  it('leaves powerups outside the radius on stream drift only', () => {
    const world = createWorld()
    const p = world.player
    const powerup = world.powerups[0]!
    powerup.active = true
    powerup.type = 'repair'
    powerup.x = p.x + MAGNET_RADIUS + 2
    powerup.y = p.y + 3
    const startX = powerup.x
    steps(world, 6)
    expect(powerup.x).toBe(startX)
  })
})

describe('tier and wave events', () => {
  it('emits tier_up when a kill crosses a weapon tier threshold', () => {
    const world = createWorld()
    world.player.wCells = 19
    drainPresentation(world.presentation)
    killDroneAt(world, 0, 7.5)
    const events = drainPresentation(world.presentation)
    expect(events.some((e) => e.type === 'tier_up')).toBe(true)
  })

  it('keeps the presentation buffer bounded', () => {
    const world = createWorld()
    for (let i = 0; i < 120; i++) {
      placeEnemyBullet(world, world.player.x + world.player.hitboxR + 0.2, world.player.y + 2)
    }
    steps(world, 40)
    expect(presentationEventCount(world.presentation)).toBeLessThanOrEqual(
      world.presentation.capacity,
    )
  })
})
