import { describe, expect, it } from 'vitest'
import { emptyCommands, type Commands } from '../input/commands'
import {
  FIXED_DT,
  IFRAMES_HIT,
  IFRAMES_RESPAWN,
  IFRAMES_SHIELD,
  MERCY_CLEAR_R,
  RESPAWN,
} from './constants'
import { stepWorld } from './step'
import { createWorld, getWorld, resetWorld, setWorld } from './world'
import type { World } from './types'

function fireOnly(partial: Partial<Commands> = {}): Commands {
  return { ...emptyCommands(), fire: true, ...partial }
}

function bombOnly(): Commands {
  return { ...emptyCommands(), bomb: true }
}

function idle(): Commands {
  return emptyCommands()
}

function activeBullets(world: World) {
  return world.playerBullets.filter((b) => b.active)
}

function activeEnemyBullets(world: World) {
  return world.enemyBullets.filter((b) => b.active)
}

function activeEnemies(world: World) {
  return world.enemies.filter((e) => e.active)
}

function steps(world: World, n: number, commands: Commands, dt = FIXED_DT): void {
  for (let i = 0; i < n; i++) stepWorld(world, dt, commands)
}

function placeDrone(world: World, x: number, y: number): World['enemies'][number] {
  const slot = world.enemies.find((e) => !e.active) ?? world.enemies[0]
  slot.active = true
  slot.kind = 'drone'
  slot.x = x
  slot.y = y
  slot.vy = 0
  slot.r = 0.4
  slot.hp = 1
  slot.points = 100
  slot.contactDamage = 1
  slot.fireCooldown = 0
  slot.fireInterval = 0
  slot.bulletSpeed = 0
  return slot
}

function placeEnemyBullet(world: World, x: number, y: number, damage = 1): World['enemyBullets'][number] {
  const slot = world.enemyBullets.find((b) => !b.active) ?? world.enemyBullets[0]
  slot.active = true
  slot.x = x
  slot.y = y
  slot.vy = 0
  slot.r = 0.15
  slot.damage = damage
  return slot
}

describe('sim world step combat offense', () => {
  it('starts a Run with empty combat pools and zero score', () => {
    const world = createWorld('vanguard')
    expect(activeBullets(world)).toHaveLength(0)
    expect(activeEnemies(world)).toHaveLength(0)
    expect(activeEnemyBullets(world)).toHaveLength(0)
    expect(world.session.score).toBe(0)
    expect(world.session.kills).toBe(0)
    expect(world.session.runOver).toBe(false)
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
    expect(drone.kind === 'drone' || drone.kind === 'dart').toBe(true)
    expect(drone.y).toBeLessThanOrEqual(18)
    expect(drone.hp).toBe(1)

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
    expect(activeEnemyBullets(fresh)).toHaveLength(0)
    expect(fresh.session.score).toBe(0)
    expect(fresh.session.kills).toBe(0)
    expect(fresh.session.runOver).toBe(false)
  })

  it('contact with enemy does not destroy the enemy (no ram-kill)', () => {
    const world = createWorld('vanguard')
    const slot = placeDrone(world, world.player.x, world.player.y)

    stepWorld(world, FIXED_DT, idle())
    expect(slot.active).toBe(true)
    expect(world.session.kills).toBe(0)
  })
})

describe('sim world step combat defense and terminal', () => {
  it('contact deals 1 HP and grants 1.0s i-frames; player still moves and fires', () => {
    const world = createWorld('vanguard')
    world.spawnTimer = 99
    placeDrone(world, world.player.x, world.player.y)
    const hp0 = world.player.hp

    stepWorld(world, FIXED_DT, idle())
    expect(world.player.hp).toBe(hp0 - 1)
    expect(world.player.iFrames).toBeCloseTo(IFRAMES_HIT, 5)

    world.enemies[0].active = false
    const x0 = world.player.x
    stepWorld(world, FIXED_DT, { ...emptyCommands(), moveX: 1, fire: true })
    expect(world.player.x).toBeGreaterThan(x0)
    expect(activeBullets(world).length).toBeGreaterThanOrEqual(1)
  })

  it('i-frames block further hazard damage until they expire', () => {
    const world = createWorld('vanguard')
    placeDrone(world, world.player.x, world.player.y)

    stepWorld(world, FIXED_DT, idle())
    expect(world.player.hp).toBe(2)

    steps(world, 30, idle())
    expect(world.player.hp).toBe(2)
  })

  it('shield absorbs one hit then grants 0.5s i-frames without HP loss', () => {
    const world = createWorld('vanguard')
    world.spawnTimer = 99
    world.player.shield = true
    placeDrone(world, world.player.x, world.player.y)

    stepWorld(world, FIXED_DT, idle())
    expect(world.player.shield).toBe(false)
    expect(world.player.hp).toBe(3)
    expect(world.player.iFrames).toBeCloseTo(IFRAMES_SHIELD, 5)
  })

  it('one damage event per step takes the highest amount only', () => {
    const world = createWorld('vanguard')
    placeDrone(world, world.player.x, world.player.y)
    world.enemies[0].contactDamage = 1
    placeEnemyBullet(world, world.player.x, world.player.y, 2)

    stepWorld(world, FIXED_DT, idle())
    expect(world.player.hp).toBe(1)
    expect(world.player.iFrames).toBeCloseTo(IFRAMES_HIT, 5)
  })

  it('enemy bullet damages player and is consumed on hit', () => {
    const world = createWorld('vanguard')
    const bullet = placeEnemyBullet(world, world.player.x, world.player.y, 1)

    stepWorld(world, FIXED_DT, idle())
    expect(world.player.hp).toBe(2)
    expect(bullet.active).toBe(false)
  })

  it('HP to 0 with lives remaining respawns at band center with mercy clear', () => {
    const world = createWorld('vanguard')
    world.spawnTimer = 99
    world.player.hp = 1
    world.player.lives = 2
    world.player.x = 4
    world.player.y = 6
    placeDrone(world, 4, 6)
    const near = placeEnemyBullet(world, 4.1, 6.1, 1)
    const far = placeEnemyBullet(world, 4 + MERCY_CLEAR_R + 2, 6, 1)

    stepWorld(world, FIXED_DT, idle())
    expect(world.player.lives).toBe(1)
    expect(world.player.hp).toBe(world.player.maxHp)
    expect(world.player.x).toBeCloseTo(RESPAWN.x)
    expect(world.player.y).toBeCloseTo(RESPAWN.y)
    expect(world.player.iFrames).toBeCloseTo(IFRAMES_RESPAWN, 5)
    expect(near.active).toBe(false)
    expect(far.active).toBe(true)
    expect(world.enemies[0].active).toBe(true)
    expect(world.session.runOver).toBe(false)
  })

  it('final life loss sets runOver and freezes further sim progress', () => {
    const world = createWorld('vanguard')
    world.player.hp = 1
    world.player.lives = 1
    placeDrone(world, world.player.x, world.player.y)

    stepWorld(world, FIXED_DT, idle())
    expect(world.session.runOver).toBe(true)
    expect(world.player.lives).toBe(0)

    const elapsed = world.session.elapsed
    const score = world.session.score
    steps(world, 30, fireOnly())
    expect(world.session.elapsed).toBe(elapsed)
    expect(world.session.score).toBe(score)
  })

  it('bomb spends stock, clears enemy bullets, damages enemies, scores kills', () => {
    const world = createWorld('vanguard')
    world.spawnTimer = 99
    expect(world.player.bombs).toBe(2)
    const foe = placeDrone(world, 0, 8)
    foe.hp = 3
    const bullet = placeEnemyBullet(world, 1, 5, 1)

    stepWorld(world, FIXED_DT, bombOnly())
    expect(world.player.bombs).toBe(1)
    expect(world.player.iFrames).toBeGreaterThanOrEqual(0.75 - FIXED_DT)
    expect(bullet.active).toBe(false)
    expect(foe.active).toBe(false)
    expect(world.session.kills).toBe(1)
    expect(world.session.score).toBe(100)
  })

  it('bomb with empty stock is a no-op', () => {
    const world = createWorld('vanguard')
    world.player.bombs = 0
    const foe = placeDrone(world, 0, 8)
    stepWorld(world, FIXED_DT, bombOnly())
    expect(foe.active).toBe(true)
    expect(world.player.bombs).toBe(0)
  })

  it('pause freezes combat and elapsed time', () => {
    const world = createWorld('vanguard')
    world.session.paused = true
    placeDrone(world, world.player.x, world.player.y)
    const hp = world.player.hp
    const elapsed = world.session.elapsed

    steps(world, 20, fireOnly())
    expect(world.player.hp).toBe(hp)
    expect(world.session.elapsed).toBe(elapsed)
    expect(activeBullets(world)).toHaveLength(0)
  })
})
