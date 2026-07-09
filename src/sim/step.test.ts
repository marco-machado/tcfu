import { describe, expect, it } from 'vitest'
import { emptyCommands, type Commands } from '../input/commands'
import {
  CONTACT_ARM_TIME,
  DEATH_HOLD,
  DROP_WEIGHTS,
  FIXED_DT,
  IFRAMES_HIT,
  IFRAMES_RESPAWN,
  IFRAMES_SHIELD,
  MERCY_CLEAR_R,
  POWERUP_PITY_SECONDS,
  RESPAWN,
  STREAM_BASE_SPEED,
  WAVE_CLEAR_WINDOW,
  WAVE_GAP,
  playerMoveBounds,
  streamSpeedForWave,
  waveClearBonus,
  waveMultiplier,
} from './constants'
import { INTRO_01, INTRO_03 } from './patterns'
import { isRunReadyForResults, stepWorld } from './step'
import { weaponTierForWCells } from './weapons'
import { createWorld as createWorldBase, getWorld, resetWorld, setWorld } from './world'
import type { PowerupType, World } from './types'

/** Default test RNG fails normal drop chance rolls (value always >= 0.04..0.25). */
function createWorld(shipId: Parameters<typeof createWorldBase>[0] = 'vanguard'): World {
  const world = createWorldBase(shipId)
  world.rng = () => 0.99
  return world
}

function sequenceRng(values: number[]): () => number {
  let i = 0
  return () => {
    const v = values[i] ?? 0.99
    i += 1
    return v
  }
}

function activePowerups(world: World) {
  return world.powerups.filter((p) => p.active)
}

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

function suspendWaves(world: World): void {
  world.waves.suspended = true
}

function placeDrone(world: World, x: number, y: number): World['enemies'][number] {
  const slot = world.enemies.find((e) => !e.active) ?? world.enemies[0]
  slot.active = true
  slot.id = world.enemies.indexOf(slot)
  slot.kind = 'drone'
  slot.class = 'fodder'
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
  slot.path = 'drift_down'
  slot.pathPhase = 0
  slot.waveId = world.session.wave
  slot.shotStyle = 'none'
  slot.age = CONTACT_ARM_TIME
  return slot
}

function placeEnemyBullet(world: World, x: number, y: number, damage = 1): World['enemyBullets'][number] {
  const slot = world.enemyBullets.find((b) => !b.active) ?? world.enemyBullets[0]
  slot.active = true
  slot.x = x
  slot.y = y
  slot.vx = 0
  slot.vy = 0
  slot.r = 0.15
  slot.damage = damage
  return slot
}

function placePowerup(world: World, type: World['powerups'][number]['type'], x: number, y: number) {
  const slot = world.powerups.find((powerup) => !powerup.active) ?? world.powerups[0]
  slot.active = true
  slot.type = type
  slot.x = x
  slot.y = y
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
    expect(world.session.wave).toBe(1)
    expect(world.waves.phase).toBe('spawning')
    expect(world.player.fireCooldown).toBe(0)
  })

  it('hold fire spawns a +Y pulse bullet on cooldown 0.18s', () => {
    const world = createWorld('vanguard')
    suspendWaves(world)
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
    suspendWaves(world)
    stepWorld(world, FIXED_DT, fireOnly())
    const yAfterSpawn = activeBullets(world)[0].y

    steps(world, 5, idle())
    expect(activeBullets(world)).toHaveLength(1)
    expect(activeBullets(world)[0].y).toBeGreaterThan(yAfterSpawn)
  })

  it('culls player bullets that leave the corridor', () => {
    const world = createWorld('vanguard')
    suspendWaves(world)
    stepWorld(world, FIXED_DT, fireOnly())
    steps(world, 120, idle())
    expect(activeBullets(world)).toHaveLength(0)
  })

  it('intro_01 spawns drones that drift with the world stream', () => {
    const world = createWorld('vanguard')
    stepWorld(world, FIXED_DT, idle())
    const enemies = activeEnemies(world)
    expect(enemies.length).toBe(4)
    expect(enemies.every((e) => e.kind === 'drone')).toBe(true)
    expect(enemies[0].y).toBeLessThanOrEqual(18)

    const yBefore = enemies[0].y
    steps(world, 60, idle())
    const still = activeEnemies(world)[0]
    expect(still.y).toBeLessThan(yBefore)
  })

  it('player bullet kills a drone and awards 100 score at wave 1', () => {
    const world = createWorld('vanguard')
    suspendWaves(world)
    const slot = placeDrone(world, world.player.x, world.player.y + 1)

    stepWorld(world, FIXED_DT, fireOnly())
    steps(world, 10, idle())

    expect(slot.active).toBe(false)
    expect(world.session.kills).toBe(1)
    expect(world.session.score).toBe(100)
    expect(world.player.wCells).toBe(1)
  })

  it('awards W-cells from the defeated enemy class', () => {
    const world = createWorld('vanguard')
    suspendWaves(world)
    const elite = placeDrone(world, world.player.x, world.player.y + 1)
    elite.class = 'elite'

    stepWorld(world, FIXED_DT, fireOnly())
    steps(world, 10, idle())

    expect(world.player.wCells).toBe(5)
  })

  it.each([
    ['fodder', 1],
    ['grunt', 2],
    ['elite', 5],
    ['set_piece', 15],
  ] as const)('awards %s W-cells for a %i bomb kill', (enemyClass, expectedWCells) => {
    const world = createWorld('vanguard')
    suspendWaves(world)
    const enemy = placeDrone(world, 0, 8)
    enemy.class = enemyClass
    enemy.hp = 3

    stepWorld(world, FIXED_DT, bombOnly())

    expect(world.player.wCells).toBe(expectedWCells)
    expect(world.session.kills).toBe(1)
  })

  it.each([
    ['fodder', 1],
    ['grunt', 2],
    ['elite', 5],
    ['set_piece', 15],
  ] as const)('awards %s W-cells exactly once for a %i bullet kill', (enemyClass, expectedWCells) => {
    const world = createWorld('vanguard')
    suspendWaves(world)
    const enemy = placeDrone(world, world.player.x, world.player.y + 1)
    enemy.class = enemyClass

    stepWorld(world, FIXED_DT, fireOnly())
    steps(world, 10, idle())
    expect(world.player.wCells).toBe(expectedWCells)

    steps(world, 10, idle())
    expect(world.player.wCells).toBe(expectedWCells)
    expect(world.session.kills).toBe(1)
  })

  it('reaches Vanguard tier 1 at 20 W-cells and fires on its faster cooldown', () => {
    const world = createWorld('vanguard')
    suspendWaves(world)
    world.player.wCells = 19
    placeDrone(world, world.player.x, world.player.y + 1)

    stepWorld(world, FIXED_DT, fireOnly())
    steps(world, 10, idle())
    expect(weaponTierForWCells(world.player.wCells)).toBe(1)

    stepWorld(world, FIXED_DT, fireOnly())
    expect(world.player.fireCooldown).toBeCloseTo(0.15)
  })

  it('reaches Vanguard tier 2 at 50 W-cells and fires two parallel shots', () => {
    const world = createWorld('vanguard')
    suspendWaves(world)
    world.player.wCells = 49
    placeDrone(world, world.player.x, world.player.y + 1)

    stepWorld(world, FIXED_DT, fireOnly())
    steps(world, 10, idle())
    expect(weaponTierForWCells(world.player.wCells)).toBe(2)

    stepWorld(world, FIXED_DT, fireOnly())
    const bullets = activeBullets(world)
    expect(bullets).toHaveLength(2)
    expect(bullets.map((b) => b.x).sort((a, b) => a - b)).toEqual([-0.25, 0.25])
  })

  it('derives the firing tier from cumulative W-cells', () => {
    const world = createWorld('vanguard')
    suspendWaves(world)
    world.player.wCells = 50
    stepWorld(world, FIXED_DT, fireOnly())

    expect(activeBullets(world)).toHaveLength(2)
  })

  it('caps Run upgrades at tier 3 after 100 W-cells', () => {
    const world = createWorld('vanguard')
    suspendWaves(world)
    world.player.wCells = 99
    const enemy = placeDrone(world, world.player.x, world.player.y + 1)
    enemy.class = 'set_piece'

    stepWorld(world, FIXED_DT, fireOnly())
    steps(world, 10, idle())

    expect(world.player.wCells).toBe(114)
    expect(weaponTierForWCells(world.player.wCells)).toBe(3)
  })

  it('starts each ship kit with its documented tier-0 shot pattern', () => {
    const striker = createWorld('striker')
    const aegis = createWorld('aegis')
    const phantom = createWorld('phantom')
    suspendWaves(striker)
    suspendWaves(aegis)
    suspendWaves(phantom)

    stepWorld(striker, FIXED_DT, fireOnly())
    stepWorld(aegis, FIXED_DT, fireOnly())
    stepWorld(phantom, FIXED_DT, fireOnly())

    expect(activeBullets(striker).map((b) => b.x).sort((a, b) => a - b)).toEqual([-0.3, 0.3])
    expect(activeBullets(striker).every((b) => b.damage === 1.1)).toBe(true)
    expect(activeBullets(aegis)).toHaveLength(2)
    expect(activeBullets(phantom)[0]).toMatchObject({ r: 0.08, vy: 26 })
  })

  it.each([
    ['vanguard', 0, 0, 1, 0.18, 18, 1, 0.12],
    ['vanguard', 1, 20, 1, 0.15, 18, 1, 0.12],
    ['vanguard', 2, 50, 2, 0.15, 18, 1, 0.12],
    ['vanguard', 3, 100, 3, 0.14, 18, 1, 0.12],
    ['striker', 0, 0, 2, 0.14, 20, 1.1, 0.12],
    ['striker', 1, 20, 2, 0.12, 20, 1.1, 0.12],
    ['striker', 2, 50, 2, 0.12, 22, 1.65, 0.12],
    ['striker', 3, 100, 3, 0.11, 22, 1.65, 0.12],
    ['aegis', 0, 0, 2, 0.22, 16, 1, 0.12],
    ['aegis', 1, 20, 3, 0.2, 16, 1, 0.12],
    ['aegis', 2, 50, 3, 0.18, 17, 1, 0.12],
    ['aegis', 3, 100, 5, 0.18, 17, 1, 0.12],
    ['phantom', 0, 0, 1, 0.1, 26, 1, 0.08],
    ['phantom', 1, 20, 1, 0.08, 26, 1, 0.08],
    ['phantom', 2, 50, 2, 0.08, 28, 1, 0.08],
    ['phantom', 3, 100, 2, 0.07, 28, 1, 0.08],
  ] as const)(
    '%s tier %i resolves its catalog shot count and projectile statistics',
    (shipId, tier, wCells, shotCount, cooldown, speed, damage, radius) => {
      const world = createWorld(shipId)
      suspendWaves(world)
      world.player.wCells = wCells

      stepWorld(world, FIXED_DT, fireOnly())

      const bullets = activeBullets(world)
      expect(weaponTierForWCells(world.player.wCells)).toBe(tier)
      expect(world.player.fireCooldown).toBeCloseTo(cooldown)
      expect(bullets).toHaveLength(shotCount)
      for (const bullet of bullets) {
        expect(Math.hypot(bullet.vx, bullet.vy)).toBeCloseTo(speed)
        expect(bullet.damage).toBeCloseTo(damage)
        expect(bullet.r).toBeCloseTo(radius)
      }
    },
  )

  it('lets a Phantom tier-3 bullet pierce a surviving enemy to hit a second enemy', () => {
    const world = createWorld('phantom')
    suspendWaves(world)
    world.player.wCells = 100
    const first = placeDrone(world, world.player.x - 0.15, world.player.y + 1)
    const second = placeDrone(world, world.player.x - 0.15, world.player.y + 1.6)
    first.hp = 3

    stepWorld(world, FIXED_DT, fireOnly())
    steps(world, 6, idle())

    expect(first.hp).toBe(1)
    expect(second.active).toBe(false)
  })

  it('resetWorld clears bullets, enemies, score, and kills on the module world', () => {
    const dirty = createWorld('vanguard')
    setWorld(dirty)
    stepWorld(dirty, FIXED_DT, fireOnly())
    dirty.session.score = 500
    dirty.session.kills = 3
    dirty.player.wCells = 50
    dirty.enemies[0].active = true

    const fresh = resetWorld('vanguard')
    expect(fresh).toBe(getWorld())
    expect(activeBullets(fresh)).toHaveLength(0)
    expect(activeEnemies(fresh)).toHaveLength(0)
    expect(activeEnemyBullets(fresh)).toHaveLength(0)
    expect(fresh.session.score).toBe(0)
    expect(fresh.session.kills).toBe(0)
    expect(fresh.player.wCells).toBe(0)
    expect(weaponTierForWCells(fresh.player.wCells)).toBe(0)
    expect(fresh.session.runOver).toBe(false)
    expect(fresh.session.wave).toBe(1)
  })

  it('contact with enemy does not destroy the enemy (no ram-kill)', () => {
    const world = createWorld('vanguard')
    suspendWaves(world)
    const slot = placeDrone(world, world.player.x, world.player.y)

    stepWorld(world, FIXED_DT, idle())
    expect(slot.active).toBe(true)
    expect(world.session.kills).toBe(0)
  })
})

describe('sim world step combat defense and terminal', () => {
  it('collects a Shield powerup for its next-hit buffer and pickup score', () => {
    const world = createWorld('vanguard')
    suspendWaves(world)
    const pickup = placePowerup(world, 'shield', world.player.x, world.player.y)

    stepWorld(world, FIXED_DT, idle())

    expect(pickup.active).toBe(false)
    expect(world.player.shield).toBe(true)
    expect(world.session.score).toBe(50)
  })

  it.each([
    ['bomb_stock', 'bombs', 5],
    ['repair', 'hp', 3],
  ] as const)('collects %s without exceeding its player maximum', (type, field, expected) => {
    const world = createWorld('vanguard')
    suspendWaves(world)
    world.player.bombs = 4
    world.player.hp = 2
    placePowerup(world, type, world.player.x, world.player.y)

    stepWorld(world, FIXED_DT, idle())

    expect(world.player[field]).toBe(expected)
    expect(world.session.score).toBe(50)
  })

  it.each([
    ['shield', 'shield', true],
    ['bomb_stock', 'bombs', 5],
    ['repair', 'hp', 3],
  ] as const)('refreshes or clamps %s when the player is already at its maximum', (type, field, expected) => {
    const world = createWorld('vanguard')
    suspendWaves(world)
    world.player.shield = true
    world.player.bombs = world.player.maxBombs
    world.player.hp = world.player.maxHp
    placePowerup(world, type, world.player.x, world.player.y)

    stepWorld(world, FIXED_DT, idle())

    expect(world.player[field]).toBe(expected)
    expect(world.session.score).toBe(50)
  })

  it('bounds the pickup pool at three and culls a pickup that leaves the playfield', () => {
    const world = createWorld('vanguard')
    suspendWaves(world)
    expect(world.powerups).toHaveLength(3)
    const pickup = placePowerup(world, 'shield', 0, -1.99)

    stepWorld(world, FIXED_DT, idle())

    expect(pickup.active).toBe(false)
  })

  it('contact deals 1 HP and grants 1.0s i-frames; player still moves and fires', () => {
    const world = createWorld('vanguard')
    suspendWaves(world)
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
    suspendWaves(world)
    placeDrone(world, world.player.x, world.player.y)

    stepWorld(world, FIXED_DT, idle())
    expect(world.player.hp).toBe(2)

    steps(world, 30, idle())
    expect(world.player.hp).toBe(2)
  })

  it('shield absorbs one hit then grants 0.5s i-frames without HP loss', () => {
    const world = createWorld('vanguard')
    suspendWaves(world)
    world.player.shield = true
    placeDrone(world, world.player.x, world.player.y)

    stepWorld(world, FIXED_DT, idle())
    expect(world.player.shield).toBe(false)
    expect(world.player.hp).toBe(3)
    expect(world.player.iFrames).toBeCloseTo(IFRAMES_SHIELD, 5)
  })

  it('one damage event per step takes the highest amount only', () => {
    const world = createWorld('vanguard')
    suspendWaves(world)
    placeDrone(world, world.player.x, world.player.y)
    world.enemies[0].contactDamage = 1
    placeEnemyBullet(world, world.player.x, world.player.y, 2)

    stepWorld(world, FIXED_DT, idle())
    expect(world.player.hp).toBe(1)
    expect(world.player.iFrames).toBeCloseTo(IFRAMES_HIT, 5)
  })

  it('enemy bullet damages player and is consumed on hit', () => {
    const world = createWorld('vanguard')
    suspendWaves(world)
    const bullet = placeEnemyBullet(world, world.player.x, world.player.y, 1)

    stepWorld(world, FIXED_DT, idle())
    expect(world.player.hp).toBe(2)
    expect(bullet.active).toBe(false)
  })

  it('HP to 0 with lives remaining respawns at band center with mercy clear', () => {
    const world = createWorld('vanguard')
    suspendWaves(world)
    world.player.hp = 1
    world.player.lives = 2
    world.player.wCells = 50
    world.player.x = 4
    world.player.y = 5
    placeDrone(world, 4, 5)
    // Mercy clear is around the respawn point, not the death point.
    const near = placeEnemyBullet(world, RESPAWN.x + 0.5, RESPAWN.y + 0.5, 1)
    const far = placeEnemyBullet(world, RESPAWN.x + MERCY_CLEAR_R + 2, RESPAWN.y, 1)

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
    expect(world.player.wCells).toBe(50)
    expect(weaponTierForWCells(world.player.wCells)).toBe(2)
  })

  it('final life loss sets runOver, holds before Results, freezes combat', () => {
    const world = createWorld('vanguard')
    suspendWaves(world)
    world.player.hp = 1
    world.player.lives = 1
    placeDrone(world, world.player.x, world.player.y)

    stepWorld(world, FIXED_DT, idle())
    expect(world.session.runOver).toBe(true)
    expect(world.player.lives).toBe(0)
    expect(world.session.endHold).toBeCloseTo(DEATH_HOLD, 5)
    expect(isRunReadyForResults(world)).toBe(false)

    const elapsed = world.session.elapsed
    const score = world.session.score
    steps(world, 30, fireOnly())
    expect(world.session.elapsed).toBe(elapsed)
    expect(world.session.score).toBe(score)
    expect(world.session.endHold).toBeLessThan(DEATH_HOLD)
    expect(isRunReadyForResults(world)).toBe(false)

    steps(world, Math.ceil(DEATH_HOLD / FIXED_DT) + 2, idle())
    expect(world.session.endHold).toBe(0)
    expect(isRunReadyForResults(world)).toBe(true)
  })

  it('player hull stays inside band with top safe margin', () => {
    const world = createWorld('vanguard')
    suspendWaves(world)
    const bounds = playerMoveBounds()
    steps(world, 120, { ...emptyCommands(), moveY: 1 })
    expect(world.player.y).toBeLessThanOrEqual(bounds.maxY + 1e-6)
    expect(world.player.y).toBeLessThan(7 - 0.5)
    steps(world, 120, { ...emptyCommands(), moveY: -1 })
    expect(world.player.y).toBeGreaterThanOrEqual(bounds.minY - 1e-6)
  })

  it('fresh enemies deal no contact damage until armed', () => {
    const world = createWorld('vanguard')
    suspendWaves(world)
    const foe = placeDrone(world, world.player.x, world.player.y)
    foe.age = 0
    const hp0 = world.player.hp

    stepWorld(world, FIXED_DT, idle())
    expect(world.player.hp).toBe(hp0)

    foe.age = CONTACT_ARM_TIME
    stepWorld(world, FIXED_DT, idle())
    expect(world.player.hp).toBe(hp0 - 1)
  })

  it('bomb spends stock, clears enemy bullets, damages enemies, scores kills', () => {
    const world = createWorld('vanguard')
    suspendWaves(world)
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
    expect(world.player.wCells).toBe(1)
  })

  it('bomb with empty stock is a no-op', () => {
    const world = createWorld('vanguard')
    suspendWaves(world)
    world.player.bombs = 0
    const foe = placeDrone(world, 0, 8)
    stepWorld(world, FIXED_DT, bombOnly())
    expect(foe.active).toBe(true)
    expect(world.player.bombs).toBe(0)
  })

  it('pause freezes combat and elapsed time', () => {
    const world = createWorld('vanguard')
    suspendWaves(world)
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

describe('sim world step wave director', () => {
  it('fires intro_01 first line immediately then second line at 2.5s', () => {
    const world = createWorld('vanguard')
    stepWorld(world, FIXED_DT, idle())
    expect(activeEnemies(world)).toHaveLength(4)

    steps(world, Math.floor(2.4 / FIXED_DT), idle())
    expect(activeEnemies(world).length).toBeLessThanOrEqual(8)

    steps(world, Math.ceil(0.2 / FIXED_DT), idle())
    expect(world.waves.waveSpawned).toBe(INTRO_01.events.length)
  })

  it('enters await_clear after spawn window then gap after clear window timeout', () => {
    const world = createWorld('vanguard')
    steps(world, Math.ceil(3 / FIXED_DT), idle())
    expect(world.waves.phase).toBe('await_clear')
    expect(world.session.wave).toBe(1)

    const scoreAtClearWindow = world.session.score
    steps(world, Math.ceil(WAVE_CLEAR_WINDOW / FIXED_DT) + 2, idle())
    expect(world.waves.phase).toBe('gap')
    expect(world.waves.clearAwarded).toBe(false)
    expect(world.session.score).toBe(scoreAtClearWindow)

    steps(world, Math.ceil(WAVE_GAP / FIXED_DT) + 2, idle())
    expect(world.session.wave).toBe(2)
    expect(world.waves.phase).toBe('spawning')
  })

  it('awards wave clear bonus when all wave enemies are killed before timeout', () => {
    const world = createWorld('vanguard')
    const scoreBefore = world.session.score

    const maxSteps = Math.ceil(6 / FIXED_DT)
    for (let i = 0; i < maxSteps; i++) {
      for (const e of world.enemies) {
        if (e.active && e.waveId === world.session.wave) {
          e.active = false
          world.waves.waveKilled += 1
        }
      }
      stepWorld(world, FIXED_DT, idle())
      if (world.waves.clearAwarded) break
    }

    expect(world.waves.clearAwarded).toBe(true)
    expect(world.session.score).toBe(scoreBefore + waveClearBonus(1))
    expect(world.waves.phase).toBe('gap')
  })

  it('kill score uses wave multiplier at higher waves', () => {
    const world = createWorld('vanguard')
    suspendWaves(world)
    world.session.wave = 5
    const slot = placeDrone(world, world.player.x, world.player.y + 1)
    slot.points = 100

    stepWorld(world, FIXED_DT, fireOnly())
    steps(world, 10, idle())

    expect(world.session.score).toBe(Math.floor(100 * waveMultiplier(5)))
  })

  it('stream speed ramps with wave index and never stops', () => {
    expect(streamSpeedForWave(1)).toBe(STREAM_BASE_SPEED)
    expect(streamSpeedForWave(10)).toBeGreaterThan(STREAM_BASE_SPEED)
    expect(streamSpeedForWave(100)).toBe(STREAM_BASE_SPEED * 1.5)

    const world = createWorld('vanguard')
    // Advance past wave 1 spawn + clear timeout + gap
    steps(world, Math.ceil((3 + WAVE_CLEAR_WINDOW + WAVE_GAP + 0.1) / FIXED_DT), idle())
    expect(world.session.wave).toBeGreaterThanOrEqual(2)
    expect(world.streamSpeed).toBe(streamSpeedForWave(world.session.wave))
    expect(world.streamSpeed).toBeGreaterThan(0)
  })

  it('continues past intro into easy waves without soft-lock', () => {
    const world = createWorld('vanguard')
    // Roughly enough time for waves 1-3 timeouts + gaps + start of wave 4
    const perWave = 3 + WAVE_CLEAR_WINDOW + WAVE_GAP
    steps(world, Math.ceil((perWave * 3 + 1) / FIXED_DT), idle())
    expect(world.session.wave).toBeGreaterThanOrEqual(4)
    expect(world.waves.phase === 'spawning' || world.waves.phase === 'await_clear' || world.waves.phase === 'gap').toBe(
      true,
    )
  })
})

describe('sim world step timed powerups', () => {
  it('Overclock multiplies the current tier cooldown by 0.75 for eight seconds', () => {
    const world = createWorld('vanguard')
    suspendWaves(world)
    placePowerup(world, 'rate_up', world.player.x, world.player.y)

    stepWorld(world, FIXED_DT, idle())
    expect(world.player.rateUp).toBeCloseTo(8, 5)
    expect(world.session.score).toBe(50)

    stepWorld(world, FIXED_DT, fireOnly())
    expect(world.player.fireCooldown).toBeCloseTo(0.135, 5)
  })

  it('Overclock applies after the resolved weapon tier cooldown', () => {
    const world = createWorld('vanguard')
    suspendWaves(world)
    world.player.wCells = 20
    placePowerup(world, 'rate_up', world.player.x, world.player.y)

    stepWorld(world, FIXED_DT, idle())
    stepWorld(world, FIXED_DT, fireOnly())
    expect(world.player.fireCooldown).toBeCloseTo(0.1125, 5)
  })

  it('a second Overclock refreshes duration rather than stacking the multiplier', () => {
    const world = createWorld('vanguard')
    suspendWaves(world)
    placePowerup(world, 'rate_up', world.player.x, world.player.y)
    stepWorld(world, FIXED_DT, idle())
    steps(world, Math.floor(3 / FIXED_DT), idle())
    expect(world.player.rateUp).toBeLessThan(5.1)

    placePowerup(world, 'rate_up', world.player.x, world.player.y)
    stepWorld(world, FIXED_DT, idle())
    expect(world.player.rateUp).toBeCloseTo(8, 5)

    stepWorld(world, FIXED_DT, fireOnly())
    expect(world.player.fireCooldown).toBeCloseTo(0.135, 5)
  })

  it('Overclock expires and restores the base tier cooldown', () => {
    const world = createWorld('vanguard')
    suspendWaves(world)
    placePowerup(world, 'rate_up', world.player.x, world.player.y)
    stepWorld(world, FIXED_DT, idle())
    steps(world, Math.ceil(8 / FIXED_DT), idle())
    expect(world.player.rateUp).toBe(0)

    stepWorld(world, FIXED_DT, fireOnly())
    expect(world.player.fireCooldown).toBeCloseTo(0.18, 5)
  })

  it('Options adds exactly two damage-1 side shots on the normal weapon cooldown', () => {
    const world = createWorld('vanguard')
    suspendWaves(world)
    placePowerup(world, 'spread_up', world.player.x, world.player.y)

    stepWorld(world, FIXED_DT, idle())
    expect(world.player.spreadUp).toBeCloseTo(8, 5)

    stepWorld(world, FIXED_DT, fireOnly())
    const bullets = activeBullets(world)
    expect(bullets).toHaveLength(3)
    const side = bullets.filter((b) => b.x !== world.player.x)
    expect(side).toHaveLength(2)
    expect(side.every((b) => b.damage === 1)).toBe(true)
    expect(side.every((b) => b.vy > 0)).toBe(true)
    expect(world.player.fireCooldown).toBeCloseTo(0.18, 5)
  })

  it('Options is additive to a multi-shot weapon tier pattern', () => {
    const world = createWorld('vanguard')
    suspendWaves(world)
    world.player.wCells = 50
    placePowerup(world, 'spread_up', world.player.x, world.player.y)

    stepWorld(world, FIXED_DT, idle())
    stepWorld(world, FIXED_DT, fireOnly())
    expect(activeBullets(world)).toHaveLength(4)
  })

  it('a second Options refreshes duration rather than adding further side shots', () => {
    const world = createWorld('vanguard')
    suspendWaves(world)
    placePowerup(world, 'spread_up', world.player.x, world.player.y)
    stepWorld(world, FIXED_DT, idle())
    steps(world, Math.floor(2 / FIXED_DT), idle())

    placePowerup(world, 'spread_up', world.player.x, world.player.y)
    stepWorld(world, FIXED_DT, idle())
    expect(world.player.spreadUp).toBeCloseTo(8, 5)

    stepWorld(world, FIXED_DT, fireOnly())
    expect(activeBullets(world)).toHaveLength(3)
  })

  it('Options expires and stops spawning side shots', () => {
    const world = createWorld('vanguard')
    suspendWaves(world)
    placePowerup(world, 'spread_up', world.player.x, world.player.y)
    stepWorld(world, FIXED_DT, idle())
    steps(world, Math.ceil(8 / FIXED_DT), idle())
    expect(world.player.spreadUp).toBe(0)

    stepWorld(world, FIXED_DT, fireOnly())
    expect(activeBullets(world)).toHaveLength(1)
  })

  it('Bounty doubles kill score for ten seconds and refreshes without stacking to 4x', () => {
    const world = createWorld('vanguard')
    suspendWaves(world)
    placePowerup(world, 'score_mult', world.player.x, world.player.y)

    stepWorld(world, FIXED_DT, idle())
    expect(world.player.scoreMult).toBeCloseTo(10, 5)
    expect(world.session.score).toBe(50)

    placeDrone(world, world.player.x, world.player.y + 1)
    stepWorld(world, FIXED_DT, fireOnly())
    steps(world, 10, idle())
    expect(world.session.score).toBe(250)
    expect(world.player.wCells).toBe(1)

    steps(world, Math.floor(4 / FIXED_DT), idle())
    placePowerup(world, 'score_mult', world.player.x, world.player.y)
    stepWorld(world, FIXED_DT, idle())
    expect(world.player.scoreMult).toBeCloseTo(10, 5)

    const scoreBefore = world.session.score
    placeDrone(world, world.player.x, world.player.y + 1)
    stepWorld(world, FIXED_DT, fireOnly())
    steps(world, 12, idle())
    expect(world.session.score).toBe(scoreBefore + 200)
  })

  it('Bounty does not double pickup score, wave-clear bonus, or W-cells', () => {
    const world = createWorld('vanguard')
    suspendWaves(world)
    world.session.wave = 1
    world.waves.waveSpawned = 1
    world.waves.waveKilled = 0
    world.waves.phase = 'await_clear'
    world.waves.clearElapsed = 0
    world.waves.clearAwarded = false
    placePowerup(world, 'score_mult', world.player.x, world.player.y)

    stepWorld(world, FIXED_DT, idle())
    expect(world.session.score).toBe(50)

    const enemy = placeDrone(world, world.player.x, world.player.y + 1)
    enemy.waveId = 1
    stepWorld(world, FIXED_DT, fireOnly())
    steps(world, 10, idle())
    expect(world.player.wCells).toBe(1)
    expect(world.session.score).toBe(50 + 200)

    world.waves.suspended = false
    world.waves.phase = 'await_clear'
    world.waves.clearElapsed = 0
    stepWorld(world, FIXED_DT, idle())
    expect(world.session.score).toBe(50 + 200 + waveClearBonus(1))
  })

  it('Bounty expires and kill score returns to the wave multiplier only', () => {
    const world = createWorld('vanguard')
    suspendWaves(world)
    placePowerup(world, 'score_mult', world.player.x, world.player.y)
    stepWorld(world, FIXED_DT, idle())
    steps(world, Math.ceil(10 / FIXED_DT), idle())
    expect(world.player.scoreMult).toBe(0)

    const scoreBefore = world.session.score
    placeDrone(world, world.player.x, world.player.y + 1)
    stepWorld(world, FIXED_DT, fireOnly())
    steps(world, 10, idle())
    expect(world.session.score).toBe(scoreBefore + 100)
  })

  it('Overclock and Options can be active together', () => {
    const world = createWorld('vanguard')
    suspendWaves(world)
    placePowerup(world, 'rate_up', world.player.x, world.player.y)
    stepWorld(world, FIXED_DT, idle())
    placePowerup(world, 'spread_up', world.player.x, world.player.y)
    stepWorld(world, FIXED_DT, idle())

    expect(world.player.rateUp).toBeGreaterThan(7)
    expect(world.player.spreadUp).toBeCloseTo(8, 5)

    stepWorld(world, FIXED_DT, fireOnly())
    expect(activeBullets(world)).toHaveLength(3)
    expect(world.player.fireCooldown).toBeCloseTo(0.135, 5)
  })

  it('timed powerups reset on a new Run', () => {
    const dirty = createWorld('vanguard')
    dirty.player.rateUp = 4
    dirty.player.spreadUp = 3
    dirty.player.scoreMult = 5
    setWorld(dirty)

    const fresh = resetWorld('vanguard')
    fresh.rng = () => 0.99
    expect(fresh.player.rateUp).toBe(0)
    expect(fresh.player.spreadUp).toBe(0)
    expect(fresh.player.scoreMult).toBe(0)
  })
})

describe('sim world step powerup drop economy', () => {
  it.each([
    ['fodder', 0.04, true],
    ['fodder', 0.04, false],
    ['grunt', 0.08, true],
    ['grunt', 0.08, false],
    ['elite', 0.25, true],
    ['elite', 0.25, false],
  ] as const)('rolls %s drops at chance %f (success=%s)', (enemyClass, chance, success) => {
    const world = createWorld('vanguard')
    suspendWaves(world)
    world.rng = sequenceRng([success ? chance - 0.001 : chance, 0])
    const enemy = placeDrone(world, 1, 8)
    enemy.class = enemyClass

    stepWorld(world, FIXED_DT, bombOnly())

    expect(activePowerups(world)).toHaveLength(success ? 1 : 0)
    if (success) {
      expect(activePowerups(world)[0].type).toBe('shield')
      expect(activePowerups(world)[0].x).toBeCloseTo(1)
      expect(activePowerups(world)[0].y).toBeCloseTo(8 - world.streamSpeed * FIXED_DT)
    }
  })

  it('guarantees a weighted drop on set-piece kills', () => {
    const world = createWorld('vanguard')
    suspendWaves(world)
    world.rng = sequenceRng([0.5, 0])
    const enemy = placeDrone(world, 2, 9)
    enemy.class = 'set_piece'

    stepWorld(world, FIXED_DT, bombOnly())

    expect(activePowerups(world)).toHaveLength(1)
    expect(activePowerups(world)[0].type).toBe('shield')
  })

  it('selects powerup types by catalog weights', () => {
    const cumulative: { type: PowerupType; at: number }[] = []
    let sum = 0
    for (const entry of DROP_WEIGHTS) {
      cumulative.push({ type: entry.type, at: sum })
      sum += entry.weight
    }
    const total = sum

    for (const entry of cumulative) {
      const world = createWorld('vanguard')
      suspendWaves(world)
      world.rng = sequenceRng([0, (entry.at + 0.5) / total])
      const enemy = placeDrone(world, 0, 8)
      enemy.class = 'set_piece'
      stepWorld(world, FIXED_DT, bombOnly())
      expect(activePowerups(world)[0]?.type).toBe(entry.type)
    }
  })

  it('skips new drops when three pickups are already on the field', () => {
    const world = createWorld('vanguard')
    suspendWaves(world)
    placePowerup(world, 'shield', -2, 10)
    placePowerup(world, 'repair', 0, 10)
    placePowerup(world, 'bomb_stock', 2, 10)
    world.rng = sequenceRng([0, 0])
    const enemy = placeDrone(world, 0, 8)
    enemy.class = 'set_piece'

    stepWorld(world, FIXED_DT, bombOnly())

    expect(activePowerups(world)).toHaveLength(3)
  })

  it('forces a weighted drop on the next grunt-or-higher kill after 45s dry', () => {
    const world = createWorld('vanguard')
    suspendWaves(world)
    world.powerupDryElapsed = POWERUP_PITY_SECONDS
    world.rng = sequenceRng([0])
    const enemy = placeDrone(world, 0, 8)
    enemy.class = 'grunt'

    stepWorld(world, FIXED_DT, bombOnly())

    expect(activePowerups(world)).toHaveLength(1)
    expect(world.powerupDryElapsed).toBeLessThan(POWERUP_PITY_SECONDS)
  })

  it('fodder kills do not consume the pity guarantee', () => {
    const world = createWorld('vanguard')
    suspendWaves(world)
    world.powerupDryElapsed = POWERUP_PITY_SECONDS
    world.rng = sequenceRng([0.99])
    const fodder = placeDrone(world, 0, 8)
    fodder.class = 'fodder'
    stepWorld(world, FIXED_DT, bombOnly())
    expect(activePowerups(world)).toHaveLength(0)
    expect(world.powerupDryElapsed).toBeGreaterThanOrEqual(POWERUP_PITY_SECONDS)

    world.rng = sequenceRng([0])
    const grunt = placeDrone(world, 1, 8)
    grunt.class = 'grunt'
    stepWorld(world, FIXED_DT, bombOnly())
    expect(activePowerups(world)).toHaveLength(1)
  })

  it('pity force still respects the three-pickup cap and remains armed', () => {
    const world = createWorld('vanguard')
    suspendWaves(world)
    world.powerupDryElapsed = POWERUP_PITY_SECONDS
    placePowerup(world, 'shield', -2, 10)
    placePowerup(world, 'repair', 0, 10)
    placePowerup(world, 'bomb_stock', 2, 10)
    world.rng = sequenceRng([0])
    const enemy = placeDrone(world, 0, 8)
    enemy.class = 'elite'

    stepWorld(world, FIXED_DT, bombOnly())

    expect(activePowerups(world)).toHaveLength(3)
    expect(world.powerupDryElapsed).toBeGreaterThanOrEqual(POWERUP_PITY_SECONDS)
  })

  it('resets the dry timer when a powerup is collected', () => {
    const world = createWorld('vanguard')
    suspendWaves(world)
    world.powerupDryElapsed = 20
    placePowerup(world, 'shield', world.player.x, world.player.y)

    stepWorld(world, FIXED_DT, idle())

    expect(world.powerupDryElapsed).toBeLessThan(1)
  })

  it.each([
    [0, 'rate_up'],
    [0.6, 'shield'],
  ] as const)('intro_03 authors forced Shield-or-Overclock (rng %f -> %s)', (roll, expected) => {
    const world = createWorld('vanguard')
    const event = INTRO_03.powerupEvents![0]!
    world.session.wave = 3
    world.streamSpeed = streamSpeedForWave(3)
    world.waves.phase = 'spawning'
    world.waves.patternElapsed = event.t - FIXED_DT
    world.waves.nextEventIndex = INTRO_03.events.length
    world.waves.nextPowerupEventIndex = 0
    world.waves.waveSpawned = INTRO_03.events.length
    world.rng = sequenceRng([roll])

    stepWorld(world, FIXED_DT, idle())

    const drops = activePowerups(world)
    expect(drops).toHaveLength(1)
    expect(drops[0].type).toBe(expected)
    expect(drops[0].x).toBeCloseTo(event.x)
    expect(drops[0].y).toBeCloseTo(event.y - world.streamSpeed * FIXED_DT)
  })

  it('intro_03 forced pickup respects the on-field cap', () => {
    const world = createWorld('vanguard')
    const event = INTRO_03.powerupEvents![0]!
    world.session.wave = 3
    world.streamSpeed = streamSpeedForWave(3)
    world.waves.phase = 'spawning'
    world.waves.patternElapsed = event.t - FIXED_DT
    world.waves.nextEventIndex = INTRO_03.events.length
    world.waves.nextPowerupEventIndex = 0
    world.waves.waveSpawned = INTRO_03.events.length
    placePowerup(world, 'repair', -2, 10)
    placePowerup(world, 'bomb_stock', 0, 10)
    placePowerup(world, 'score_mult', 2, 10)
    world.rng = sequenceRng([0])

    stepWorld(world, FIXED_DT, idle())

    expect(activePowerups(world)).toHaveLength(3)
    expect(activePowerups(world).map((p) => p.type).sort()).toEqual(
      ['bomb_stock', 'repair', 'score_mult'].sort(),
    )
  })
})
