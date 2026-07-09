import { describe, expect, it } from 'vitest'
import { emptyCommands, type Commands } from '../input/commands'
import { FIXED_DT } from './constants'
import { stepWorld } from './step'
import { createWorld, getWorld, resetWorld, setWorld } from './world'
import type { World } from './types'

function fireOnly(partial: Partial<Commands> = {}): Commands {
  return { ...emptyCommands(), fire: true, ...partial }
}

function idle(): Commands {
  return emptyCommands()
}

function activeBullets(world: World) {
  return world.playerBullets.filter((b) => b.active)
}

function activeEnemies(world: World) {
  return world.enemies.filter((e) => e.active)
}

function steps(world: World, n: number, commands: Commands, dt = FIXED_DT): void {
  for (let i = 0; i < n; i++) stepWorld(world, dt, commands)
}

function placeDrone(world: World, x: number, y: number): World['enemies'][number] {
  const slot = world.enemies[0]
  slot.active = true
  slot.kind = 'drone'
  slot.x = x
  slot.y = y
  slot.vy = -world.streamSpeed
  slot.r = 0.4
  slot.hp = 1
  slot.points = 100
  return slot
}

describe('sim world step combat offense', () => {
  it('starts a Run with empty combat pools and zero score', () => {
    const world = createWorld('vanguard')
    expect(activeBullets(world)).toHaveLength(0)
    expect(activeEnemies(world)).toHaveLength(0)
    expect(world.session.score).toBe(0)
    expect(world.session.kills).toBe(0)
    expect(world.player.fireCooldown).toBe(0)
  })

  it('hold fire spawns a +Y pulse bullet on cooldown 0.18s', () => {
    const world = createWorld('vanguard')
    const y0 = world.player.y

    stepWorld(world, FIXED_DT, fireOnly())
    const first = activeBullets(world)
    expect(first).toHaveLength(1)
    expect(first[0].x).toBeCloseTo(world.player.x)
    expect(first[0].y).toBeCloseTo(y0)
    expect(first[0].vy).toBe(18)
    expect(first[0].damage).toBe(1)
    expect(first[0].r).toBeCloseTo(0.12)

    steps(world, 10, fireOnly())
    expect(activeBullets(world)).toHaveLength(1)

    steps(world, 2, fireOnly())
    expect(activeBullets(world).length).toBeGreaterThanOrEqual(2)
  })

  it('release fire stops new spawns; existing bullets keep moving', () => {
    const world = createWorld('vanguard')
    stepWorld(world, FIXED_DT, fireOnly())
    const yAfterSpawn = activeBullets(world)[0].y

    steps(world, 5, idle())
    expect(activeBullets(world)).toHaveLength(1)
    expect(activeBullets(world)[0].y).toBeGreaterThan(yAfterSpawn)
  })

  it('culls player bullets that leave the corridor', () => {
    const world = createWorld('vanguard')
    stepWorld(world, FIXED_DT, fireOnly())
    steps(world, 120, idle())
    expect(activeBullets(world)).toHaveLength(0)
  })

  it('spawns streaming drones that drift with the world stream', () => {
    const world = createWorld('vanguard')
    steps(world, Math.ceil(1.25 / FIXED_DT), idle())
    const enemies = activeEnemies(world)
    expect(enemies.length).toBeGreaterThanOrEqual(1)
    const drone = enemies[0]
    expect(drone.kind).toBe('drone')
    expect(drone.y).toBeLessThanOrEqual(18)
    expect(drone.hp).toBe(1)
    expect(drone.points).toBe(100)

    const yBefore = drone.y
    steps(world, 60, idle())
    const still = activeEnemies(world).find((e) => e === drone) ?? activeEnemies(world)[0]
    expect(still.y).toBeLessThan(yBefore)
  })

  it('player bullet kills a drone and awards 100 score at wave 1', () => {
    const world = createWorld('vanguard')
    const slot = placeDrone(world, world.player.x, world.player.y + 1)

    stepWorld(world, FIXED_DT, fireOnly())
    steps(world, 10, idle())

    expect(slot.active).toBe(false)
    expect(world.session.kills).toBe(1)
    expect(world.session.score).toBe(100)
  })

  it('resetWorld clears bullets, enemies, score, and kills on the module world', () => {
    const dirty = createWorld('vanguard')
    setWorld(dirty)
    stepWorld(dirty, FIXED_DT, fireOnly())
    dirty.session.score = 500
    dirty.session.kills = 3
    dirty.enemies[0].active = true

    const fresh = resetWorld('vanguard')
    expect(fresh).toBe(getWorld())
    expect(activeBullets(fresh)).toHaveLength(0)
    expect(activeEnemies(fresh)).toHaveLength(0)
    expect(fresh.session.score).toBe(0)
    expect(fresh.session.kills).toBe(0)
  })

  it('contact with enemy does not destroy the enemy (no ram-kill)', () => {
    const world = createWorld('vanguard')
    const slot = placeDrone(world, world.player.x, world.player.y)
    slot.vy = 0

    steps(world, 5, idle())
    expect(slot.active).toBe(true)
    expect(world.session.kills).toBe(0)
  })
})
