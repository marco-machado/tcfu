import { describe, expect, it } from 'vitest'
import { emptyCommands } from '../input/commands'
import {
  debugAddScore,
  debugAdjustBombs,
  debugAdjustHp,
  debugAdjustLives,
  debugAdjustWeaponTier,
  debugClearAll,
  debugIsGodMode,
  debugJumpToWave,
  debugKillPlayer,
  debugSetGodMode,
  debugSetShield,
  debugSpawnEnemy,
  debugSpawnPowerup,
  debugStepOneFrame,
  debugSuspendWaves,
  debugTriggerPattern,
} from './debugActions'
import { patternById } from './patterns'
import { applyPlayerDamage, bossBarFromWorld, stepWorld } from './step'
import { weaponTierForWCells } from './weapons'
import { ENEMY_KINDS } from './types'
import { createWorld } from './world'

const ALL_KINDS = ENEMY_KINDS

function activeEnemies(world: ReturnType<typeof createWorld>) {
  return world.enemies.filter((e) => e.active)
}

function suspendedWorld() {
  const world = createWorld()
  debugSuspendWaves(world, true)
  return world
}

describe('debugSpawnEnemy', () => {
  it('spawns one active enemy of the requested kind per call', () => {
    const world = suspendedWorld()
    for (const kind of ALL_KINDS) {
      const enemy = debugSpawnEnemy(world, kind)
      expect(enemy?.kind).toBe(kind)
      expect(enemy?.active).toBe(true)
    }
    expect(activeEnemies(world)).toHaveLength(ALL_KINDS.length)
  })

  it('spawns a colossus as a set-piece that drives the boss bar', () => {
    const world = suspendedWorld()
    const enemy = debugSpawnEnemy(world, 'colossus')
    expect(enemy?.class).toBe('set_piece')
    expect(bossBarFromWorld(world)).not.toBeNull()
  })

  it('spawns with positive hp and points from the canonical archetype', () => {
    const world = suspendedWorld()
    const enemy = debugSpawnEnemy(world, 'razor')
    expect(enemy!.hp).toBeGreaterThan(0)
    expect(enemy!.points).toBeGreaterThan(0)
    expect(enemy!.class).toBe('elite')
  })
})

describe('wave director control', () => {
  it('spawns nothing and holds the wave counter while suspended', () => {
    const world = suspendedWorld()
    for (let i = 0; i < 60 * 30; i++) stepWorld(world, 1 / 60, emptyCommands())
    expect(activeEnemies(world)).toHaveLength(0)
    expect(world.session.wave).toBe(1)
  })

  it('resumes normal choreography when unsuspended', () => {
    const world = suspendedWorld()
    debugSuspendWaves(world, false)
    for (let i = 0; i < 60 * 5; i++) stepWorld(world, 1 / 60, emptyCommands())
    expect(activeEnemies(world).length).toBeGreaterThan(0)
  })

  it('jumps the wave counter so resume lands in the chosen band', () => {
    const world = suspendedWorld()
    debugJumpToWave(world, 25)
    expect(world.session.wave).toBe(25)
    expect(world.waves.suspended).toBe(true)
  })
})

describe('debugTriggerPattern', () => {
  it('plays the requested pattern while suspended, then re-suspends', () => {
    const world = suspendedWorld()
    debugTriggerPattern(world, 'set_colossus')
    for (let i = 0; i < 60 * 20; i++) {
      world.player.iFrames = 1
      stepWorld(world, 1 / 60, emptyCommands())
    }
    expect(world.enemies.some((e) => e.active && e.kind === 'colossus')).toBe(true)
    expect(world.waves.suspended).toBe(true)
    expect(world.session.wave).toBe(1)
  })

  it('stays resumed after the pattern when waves were already running', () => {
    const world = createWorld()
    debugTriggerPattern(world, 'intro_01')
    for (let i = 0; i < 60 * 20; i++) {
      world.player.iFrames = 1
      stepWorld(world, 1 / 60, emptyCommands())
    }
    expect(world.waves.suspended).toBe(false)
    expect(world.session.wave).toBeGreaterThan(1)
  })

  it('rejects unknown pattern ids', () => {
    const world = suspendedWorld()
    expect(debugTriggerPattern(world, 'nope')).toBe(false)
    expect(world.waves.suspended).toBe(true)
  })
})

describe('patternById', () => {
  it('resolves an authored pattern by id', () => {
    expect(patternById('intro_01')?.id).toBe('intro_01')
    expect(patternById('nope')).toBeNull()
  })
})

describe('debugSpawnPowerup', () => {
  it('fields a live pickup upstream of the player', () => {
    const world = suspendedWorld()
    expect(debugSpawnPowerup(world, 'shield')).toBe(true)
    const active = world.powerups.filter((p) => p.active)
    expect(active).toHaveLength(1)
    expect(active[0]!.type).toBe('shield')
    expect(active[0]!.y).toBeGreaterThan(world.player.y)
  })
})

describe('debugClearAll', () => {
  it('deactivates every enemy and enemy bullet', () => {
    const world = suspendedWorld()
    debugSpawnEnemy(world, 'gunner')
    world.enemyBullets[0]!.active = true
    debugClearAll(world)
    expect(activeEnemies(world)).toHaveLength(0)
    expect(world.enemyBullets.some((b) => b.active)).toBe(false)
  })
})

describe('stat controls', () => {
  it('clamps hp between 1 and maxHp', () => {
    const world = suspendedWorld()
    debugAdjustHp(world, -99)
    expect(world.player.hp).toBe(1)
    debugAdjustHp(world, 99)
    expect(world.player.hp).toBe(world.player.maxHp)
  })

  it('never lets lives drop below 1', () => {
    const world = suspendedWorld()
    debugAdjustLives(world, -99)
    expect(world.player.lives).toBe(1)
    debugAdjustLives(world, 5)
    expect(world.player.lives).toBe(6)
  })

  it('clamps bombs between 0 and maxBombs', () => {
    const world = suspendedWorld()
    debugAdjustBombs(world, -99)
    expect(world.player.bombs).toBe(0)
    debugAdjustBombs(world, 99)
    expect(world.player.bombs).toBe(world.player.maxBombs)
  })

  it('steps the weapon run-upgrade tier via wCells', () => {
    const world = suspendedWorld()
    expect(weaponTierForWCells(world.player.wCells)).toBe(0)
    debugAdjustWeaponTier(world, 1)
    expect(weaponTierForWCells(world.player.wCells)).toBe(1)
    debugAdjustWeaponTier(world, 99)
    expect(weaponTierForWCells(world.player.wCells)).toBe(3)
    debugAdjustWeaponTier(world, -1)
    expect(weaponTierForWCells(world.player.wCells)).toBe(2)
  })

  it('toggles the shield', () => {
    const world = suspendedWorld()
    debugSetShield(world, true)
    expect(world.player.shield).toBe(true)
    debugSetShield(world, false)
    expect(world.player.shield).toBe(false)
  })

  it('adds score', () => {
    const world = suspendedWorld()
    debugAddScore(world, 10_000)
    expect(world.session.score).toBe(10_000)
  })
})

describe('god mode', () => {
  it('keeps the player unhittable across many steps', () => {
    const world = suspendedWorld()
    debugSetGodMode(world, true)
    for (let i = 0; i < 60 * 5; i++) stepWorld(world, 1 / 60, emptyCommands())
    expect(debugIsGodMode(world)).toBe(true)
    const hp = world.player.hp
    const shield = world.player.shield
    applyPlayerDamage(world, 1)
    expect(world.player.hp).toBe(hp)
    expect(world.player.shield).toBe(shield)
    debugSetGodMode(world, false)
    expect(debugIsGodMode(world)).toBe(false)
  })
})

describe('debugKillPlayer', () => {
  it('ends the run immediately', () => {
    const world = suspendedWorld()
    debugKillPlayer(world)
    expect(world.session.runOver).toBe(true)
  })

  it('ends the run even with shield and god mode active', () => {
    const world = suspendedWorld()
    debugSetShield(world, true)
    debugSetGodMode(world, true)
    debugKillPlayer(world)
    expect(world.session.runOver).toBe(true)
  })
})

describe('debugStepOneFrame', () => {
  it('advances exactly one fixed step while paused and stays paused', () => {
    const world = suspendedWorld()
    world.session.paused = true
    const before = world.session.elapsed
    debugStepOneFrame(world)
    expect(world.session.elapsed).toBeCloseTo(before + 1 / 60, 6)
    expect(world.session.paused).toBe(true)
  })

  it('does nothing while unpaused', () => {
    const world = suspendedWorld()
    const before = world.session.elapsed
    debugStepOneFrame(world)
    expect(world.session.elapsed).toBe(before)
  })
})
