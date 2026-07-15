import { describe, expect, it } from 'vitest'
import { emptyCommands } from '../input/commands'
import { CONTACT_ARM_TIME, FIXED_DT, POWERUP_SCORE } from './constants'
import {
  createPresentationBuffer,
  drainPresentation,
  musicGain,
  PRESENTATION_BUFFER_CAPACITY,
  presentationEventCount,
  pushPresentation,
  settingToGain,
  sfxGain,
} from './presentation'
import { stepWorld } from './step'
import { createWorld } from './world'
import type { World } from './types'

function idle() {
  return emptyCommands()
}

function bombOnly() {
  return { ...emptyCommands(), bomb: true }
}

function placeDrone(world: World, x: number, y: number) {
  const slot = world.enemies.find((e) => !e.active) ?? world.enemies[0]!
  slot.active = true
  slot.id = world.enemies.indexOf(slot)
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
  slot.fireCooldown = 0
  slot.fireInterval = 0
  slot.bulletSpeed = 0
  slot.path = 'drift_down'
  slot.pathPhase = 0
  slot.laneX = x
  slot.waveId = world.session.wave
  slot.shotStyle = 'none'
  slot.phase = 'none'
  slot.phaseElapsed = 0
  slot.age = CONTACT_ARM_TIME
  return slot
}

function placeBullet(world: World, x: number, y: number) {
  const slot = world.enemyBullets.find((b) => !b.active) ?? world.enemyBullets[0]!
  slot.active = true
  slot.x = x
  slot.y = y
  slot.vx = 0
  slot.vy = 0
  slot.r = 0.15
  slot.damage = 1
  return slot
}

function placePlayerBullet(world: World, x: number, y: number) {
  const slot = world.playerBullets.find((b) => !b.active) ?? world.playerBullets[0]!
  slot.active = true
  slot.x = x
  slot.y = y
  slot.vx = 0
  slot.vy = 0
  slot.r = 0.12
  slot.damage = 1
  slot.pierce = 0
  slot.hitEnemyIds = []
  return slot
}

describe('presentation buffer', () => {
  it('drains and clears events in order', () => {
    const buf = createPresentationBuffer()
    pushPresentation(buf, { type: 'kill', x: 1, y: 2 })
    pushPresentation(buf, { type: 'bomb', x: 0, y: 0 })
    expect(presentationEventCount(buf)).toBe(2)
    const drained = drainPresentation(buf)
    expect(drained.map((e) => e.type)).toEqual(['kill', 'bomb'])
    expect(presentationEventCount(buf)).toBe(0)
    expect(drainPresentation(buf)).toEqual([])
  })

  it('drops oldest events when over capacity', () => {
    const buf = createPresentationBuffer(3)
    pushPresentation(buf, { type: 'kill', x: 0, y: 0 })
    pushPresentation(buf, { type: 'bomb', x: 0, y: 0 })
    pushPresentation(buf, { type: 'pickup', x: 0, y: 0 })
    pushPresentation(buf, { type: 'death', x: 0, y: 0 })
    expect(presentationEventCount(buf)).toBe(3)
    expect(drainPresentation(buf).map((e) => e.type)).toEqual(['bomb', 'pickup', 'death'])
  })

  it('uses the design capacity by default', () => {
    expect(PRESENTATION_BUFFER_CAPACITY).toBe(64)
  })
})

describe('audio gain mapping', () => {
  it('maps settings 0–100 to 0–1', () => {
    expect(settingToGain(0)).toBe(0)
    expect(settingToGain(50)).toBe(0.5)
    expect(settingToGain(100)).toBe(1)
    expect(settingToGain(-10)).toBe(0)
    expect(settingToGain(200)).toBe(1)
  })

  it('multiplies master and channel gains', () => {
    expect(sfxGain(100, 80)).toBeCloseTo(0.8)
    expect(sfxGain(50, 100)).toBeCloseTo(0.5)
    expect(sfxGain(0, 100)).toBe(0)
    expect(sfxGain(100, 0)).toBe(0)
    expect(musicGain(100, 0)).toBe(0)
  })
})

describe('presentation events from combat', () => {
  it('emits kill on bomb destroy', () => {
    const world = createWorld('vanguard')
    world.waves.suspended = true
    placeDrone(world, 0, 8)
    stepWorld(world, FIXED_DT, bombOnly())
    const events = drainPresentation(world.presentation)
    expect(events.some((e) => e.type === 'bomb')).toBe(true)
    expect(events.some((e) => e.type === 'kill')).toBe(true)
  })

  it('emits an impact before a weapon kill with authored magnitude', () => {
    const world = createWorld('vanguard')
    world.waves.suspended = true
    placeDrone(world, 0, 8)
    placePlayerBullet(world, 0, 8)

    stepWorld(world, FIXED_DT, idle())

    const events = drainPresentation(world.presentation)
    expect(events.find((e) => e.type === 'impact')?.magnitude).toBeGreaterThan(0)
    expect(events.find((e) => e.type === 'kill')?.magnitude).toBe(1)
  })

  it('emits shield_break then player_hit paths', () => {
    const world = createWorld('vanguard')
    world.waves.suspended = true
    world.player.shield = true
    placeBullet(world, world.player.x, world.player.y)
    stepWorld(world, FIXED_DT, idle())
    expect(drainPresentation(world.presentation).some((e) => e.type === 'shield_break')).toBe(true)

    const world2 = createWorld('vanguard')
    world2.waves.suspended = true
    world2.player.shield = false
    placeBullet(world2, world2.player.x, world2.player.y)
    stepWorld(world2, FIXED_DT, idle())
    expect(drainPresentation(world2.presentation).some((e) => e.type === 'player_hit')).toBe(true)
  })

  it('emits pickup on collect', () => {
    const world = createWorld('vanguard')
    world.waves.suspended = true
    const slot = world.powerups.find((p) => !p.active) ?? world.powerups[0]!
    slot.active = true
    slot.type = 'repair'
    slot.x = world.player.x
    slot.y = world.player.y
    const score0 = world.session.score
    stepWorld(world, FIXED_DT, idle())
    expect(world.session.score).toBe(score0 + POWERUP_SCORE)
    expect(drainPresentation(world.presentation).find((e) => e.type === 'pickup')?.variant).toBe('repair')
  })

  it('emits life_loss and death on final life', () => {
    const world = createWorld('vanguard')
    world.waves.suspended = true
    world.player.hp = 1
    world.player.lives = 1
    world.player.shield = false
    placeBullet(world, world.player.x, world.player.y)
    stepWorld(world, FIXED_DT, idle())
    const types = drainPresentation(world.presentation).map((e) => e.type)
    expect(types).toContain('player_hit')
    expect(types).toContain('life_loss')
    expect(types).toContain('death')
    expect(world.session.runOver).toBe(true)
  })
})
