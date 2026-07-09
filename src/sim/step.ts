import type { Commands } from '../input/commands'
import { circleCircle } from './collision'
import {
  BOMB_DAMAGE,
  CONTACT_ARM_TIME,
  CULL_X_MAX,
  CULL_Y_MIN,
  DART,
  DEATH_HOLD,
  DRONE,
  ENEMY_BULLET_DAMAGE,
  ENEMY_BULLET_R,
  GUNNER,
  HOLD_Y,
  IFRAMES_BOMB,
  IFRAMES_HIT,
  IFRAMES_RESPAWN,
  IFRAMES_SHIELD,
  MERCY_CLEAR_R,
  PLAYER_ACCEL,
  PLAYER_DECEL,
  PLAYER_MAX_SPEED,
  PULSE_T0,
  RESPAWN,
  SPAWN_Y,
  WAVE_CLEAR_WINDOW,
  WAVE_GAP,
  enemyFireCooldownScale,
  enemyHpScale,
  enemyShotSpeedScale,
  eventTimeScale,
  playerMoveBounds,
  streamSpeedForWave,
  waveClearBonus,
  waveMultiplier,
} from './constants'
import { patternForWave, type PathId, type SpawnEvent } from './patterns'
import type { Enemy, EnemyBullet, EnemyKind, PlayerBullet, World } from './types'

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v))
}

function acquirePlayerBullet(world: World): PlayerBullet | null {
  for (const b of world.playerBullets) {
    if (!b.active) return b
  }
  return null
}

function acquireEnemyBullet(world: World): EnemyBullet | null {
  for (const b of world.enemyBullets) {
    if (!b.active) return b
  }
  return null
}

function acquireEnemy(world: World): Enemy | null {
  for (const e of world.enemies) {
    if (!e.active) return e
  }
  return null
}

function onPlayfield(x: number, y: number): boolean {
  return y >= CULL_Y_MIN && y <= SPAWN_Y && Math.abs(x) <= CULL_X_MAX
}

function awardKill(world: World, points: number, waveId: number): void {
  world.session.kills += 1
  const mult = waveMultiplier(waveId > 0 ? waveId : world.session.wave)
  world.session.score += Math.floor(points * mult)
  if (waveId === world.session.wave) {
    world.waves.waveKilled += 1
  }
}

function mercyClearEnemyBullets(world: World): void {
  const p = world.player
  for (const b of world.enemyBullets) {
    if (!b.active) continue
    if (circleCircle({ x: p.x, y: p.y, r: MERCY_CLEAR_R }, { x: b.x, y: b.y, r: b.r })) {
      b.active = false
    }
  }
}

function applyPlayerDamage(world: World, amount: number): void {
  if (amount <= 0 || world.session.runOver) return
  const p = world.player
  if (p.iFrames > 0) return

  if (p.shield) {
    p.shield = false
    p.iFrames = IFRAMES_SHIELD
    return
  }

  p.hp -= amount
  if (p.hp > 0) {
    p.iFrames = IFRAMES_HIT
    return
  }

  p.hp = 0
  p.lives -= 1
  p.shield = false

  if (p.lives <= 0) {
    world.session.runOver = true
    world.session.endHold = DEATH_HOLD
    world.session.deathFlash = DEATH_HOLD
    p.vx = 0
    p.vy = 0
    p.iFrames = 0
    return
  }

  p.hp = p.maxHp
  p.x = RESPAWN.x
  p.y = RESPAWN.y
  p.vx = 0
  p.vy = 0
  p.iFrames = IFRAMES_RESPAWN
  mercyClearEnemyBullets(world)
}

function kindStats(kind: EnemyKind) {
  if (kind === 'gunner') return GUNNER
  if (kind === 'dart') return DART
  return DRONE
}

function configureEnemy(e: Enemy, event: SpawnEvent, wave: number, streamSpeed: number): void {
  const stats = kindStats(event.kind)
  const hpScale = enemyHpScale(wave)
  const shotScale = enemyShotSpeedScale(wave)
  const cdScale = enemyFireCooldownScale(wave)

  e.active = true
  e.kind = event.kind
  e.x = event.x
  e.y = event.y
  e.r = stats.r
  e.hp = Math.max(1, Math.round(stats.hp * hpScale))
  e.points = stats.points
  e.contactDamage = stats.contactDamage
  e.path = event.path
  e.pathPhase = 0
  e.waveId = wave
  e.age = 0
  e.vy = -streamSpeed

  if (event.kind === 'drone') {
    e.fireInterval = 0
    e.fireCooldown = 0
    e.bulletSpeed = 0
    e.shotStyle = 'none'
  } else if (event.kind === 'dart') {
    e.fireInterval = DART.fireInterval * cdScale
    e.fireCooldown = e.fireInterval * 0.4
    e.bulletSpeed = DART.bulletSpeed * shotScale
    e.shotStyle = 'down'
  } else {
    e.fireInterval = GUNNER.fireInterval * cdScale
    e.fireCooldown = e.fireInterval * 0.5
    e.bulletSpeed = GUNNER.bulletSpeed * shotScale
    e.shotStyle = 'spread3'
  }

  if (event.path === 'dive') {
    e.vy = -streamSpeed * 1.6
  } else if (event.path === 'hold_and_shot') {
    e.vy = -streamSpeed * 0.85
  }
}

function beginWave(world: World, waveIndex: number): void {
  world.session.wave = waveIndex
  world.streamSpeed = streamSpeedForWave(waveIndex)
  world.waves.phase = 'spawning'
  world.waves.patternElapsed = 0
  world.waves.nextEventIndex = 0
  world.waves.clearElapsed = 0
  world.waves.gapElapsed = 0
  world.waves.clearAwarded = false
  world.waves.waveSpawned = 0
  world.waves.waveKilled = 0
}

function enterGap(world: World): void {
  world.waves.phase = 'gap'
  world.waves.gapElapsed = 0
}

function tryAwardClear(world: World): void {
  const w = world.waves
  if (w.clearAwarded) return
  if (w.waveSpawned <= 0) return
  if (w.waveKilled < w.waveSpawned) return
  if (w.clearElapsed > WAVE_CLEAR_WINDOW) return
  w.clearAwarded = true
  world.session.score += waveClearBonus(world.session.wave)
}

function stepWaves(world: World, dt: number): void {
  if (world.waves.suspended) return
  const w = world.waves

  if (w.phase === 'gap') {
    w.gapElapsed += dt
    if (w.gapElapsed >= WAVE_GAP) {
      beginWave(world, world.session.wave + 1)
    }
    return
  }

  if (w.phase === 'spawning') {
    const pattern = patternForWave(world.session.wave)
    const scale = eventTimeScale(world.session.wave)
    w.patternElapsed += dt / scale

    while (w.nextEventIndex < pattern.events.length) {
      const event = pattern.events[w.nextEventIndex]!
      if (w.patternElapsed < event.t) break
      const slot = acquireEnemy(world)
      if (!slot) break
      configureEnemy(slot, event, world.session.wave, world.streamSpeed)
      w.waveSpawned += 1
      w.nextEventIndex += 1
    }

    if (w.nextEventIndex >= pattern.events.length) {
      w.phase = 'await_clear'
      w.clearElapsed = 0
      tryAwardClear(world)
      if (w.clearAwarded) enterGap(world)
    }
    return
  }

  w.clearElapsed += dt
  tryAwardClear(world)
  if (w.clearAwarded || w.clearElapsed >= WAVE_CLEAR_WINDOW) {
    enterGap(world)
  }
}

function stepPlayer(world: World, dt: number, commands: Commands): void {
  const p = world.player
  const maxSpeed = PLAYER_MAX_SPEED
  const bounds = playerMoveBounds()

  let desiredX = commands.moveX * maxSpeed
  let desiredY = commands.moveY * maxSpeed
  const len = Math.hypot(desiredX, desiredY)
  if (len > maxSpeed && len > 0) {
    desiredX = (desiredX / len) * maxSpeed
    desiredY = (desiredY / len) * maxSpeed
  }

  const approach = (current: number, target: number): number => {
    const rate =
      Math.abs(target) > Math.abs(current) || Math.sign(target) === Math.sign(current)
        ? PLAYER_ACCEL
        : PLAYER_DECEL
    if (current < target) return Math.min(current + rate * dt, target)
    if (current > target) return Math.max(current - rate * dt, target)
    return current
  }

  p.vx = approach(p.vx, desiredX)
  p.vy = approach(p.vy, desiredY)

  p.x += p.vx * dt
  p.y += p.vy * dt

  p.x = clamp(p.x, bounds.minX, bounds.maxX)
  p.y = clamp(p.y, bounds.minY, bounds.maxY)
  if (p.x <= bounds.minX || p.x >= bounds.maxX) p.vx = 0
  if (p.y <= bounds.minY || p.y >= bounds.maxY) p.vy = 0

  if (p.iFrames > 0) p.iFrames = Math.max(0, p.iFrames - dt)
  if (p.fireCooldown > 0) p.fireCooldown = Math.max(0, p.fireCooldown - dt)
}

function stepFire(world: World, commands: Commands): void {
  const p = world.player
  if (!commands.fire || p.fireCooldown > 0) return

  const slot = acquirePlayerBullet(world)
  if (!slot) return

  slot.active = true
  slot.x = p.x
  slot.y = p.y
  slot.vy = PULSE_T0.bulletSpeed
  slot.r = PULSE_T0.bulletR
  slot.damage = PULSE_T0.damage
  p.fireCooldown = PULSE_T0.cooldown
}

function stepBomb(world: World, commands: Commands): void {
  if (!commands.bomb) return
  const p = world.player
  if (p.bombs <= 0) return

  p.bombs -= 1
  p.iFrames = Math.max(p.iFrames, IFRAMES_BOMB)

  for (const b of world.enemyBullets) {
    if (b.active && onPlayfield(b.x, b.y)) b.active = false
  }

  for (const e of world.enemies) {
    if (!e.active || !onPlayfield(e.x, e.y)) continue
    e.hp -= BOMB_DAMAGE
    if (e.hp <= 0) {
      e.active = false
      awardKill(world, e.points, e.waveId)
    }
  }
}

function stepPlayerBullets(world: World, dt: number): void {
  for (const b of world.playerBullets) {
    if (!b.active) continue
    b.y += b.vy * dt
    if (b.y > SPAWN_Y + 2 || b.y < CULL_Y_MIN || Math.abs(b.x) > CULL_X_MAX) {
      b.active = false
    }
  }
}

function stepEnemyBullets(world: World, dt: number): void {
  for (const b of world.enemyBullets) {
    if (!b.active) continue
    b.x += b.vx * dt
    b.y += b.vy * dt
    if (b.y < CULL_Y_MIN || b.y > SPAWN_Y + 2 || Math.abs(b.x) > CULL_X_MAX) {
      b.active = false
    }
  }
}

function fireEnemyShot(world: World, e: Enemy): void {
  if (e.shotStyle === 'none') return

  if (e.shotStyle === 'down') {
    const bullet = acquireEnemyBullet(world)
    if (!bullet) return
    bullet.active = true
    bullet.x = e.x
    bullet.y = e.y
    bullet.vx = 0
    bullet.vy = -e.bulletSpeed
    bullet.r = ENEMY_BULLET_R
    bullet.damage = ENEMY_BULLET_DAMAGE
    return
  }

  const angles = [-0.35, 0, 0.35]
  for (const a of angles) {
    const bullet = acquireEnemyBullet(world)
    if (!bullet) break
    bullet.active = true
    bullet.x = e.x
    bullet.y = e.y
    bullet.vx = Math.sin(a) * e.bulletSpeed
    bullet.vy = -Math.cos(a) * e.bulletSpeed
    bullet.r = ENEMY_BULLET_R
    bullet.damage = ENEMY_BULLET_DAMAGE
  }
}

function advancePath(e: Enemy, dt: number, streamSpeed: number): void {
  const path: PathId = e.path
  e.pathPhase += dt

  if (path === 'drift_down') {
    e.vy = -streamSpeed
    e.y += e.vy * dt
    return
  }

  if (path === 'dive') {
    e.vy = -streamSpeed * 1.6
    e.y += e.vy * dt
    return
  }

  if (path === 'sine_x') {
    e.vy = -streamSpeed
    e.y += e.vy * dt
    e.x += Math.sin(e.pathPhase * 3) * 2.2 * dt
    return
  }

  if (e.y > HOLD_Y) {
    e.vy = -streamSpeed * 0.85
    e.y += e.vy * dt
  } else {
    e.vy = 0
    e.y = HOLD_Y
  }
}

function stepEnemies(world: World, dt: number): void {
  for (const e of world.enemies) {
    if (!e.active) continue
    e.age += dt
    advancePath(e, dt, world.streamSpeed)

    if (e.fireInterval > 0) {
      e.fireCooldown -= dt
      if (e.fireCooldown <= 0) {
        fireEnemyShot(world, e)
        e.fireCooldown = e.fireInterval
      }
    }

    if (e.y < CULL_Y_MIN || Math.abs(e.x) > CULL_X_MAX) {
      e.active = false
    }
  }
}

function stepPlayerBulletHits(world: World): void {
  for (const b of world.playerBullets) {
    if (!b.active) continue
    for (const e of world.enemies) {
      if (!e.active) continue
      if (!circleCircle({ x: b.x, y: b.y, r: b.r }, { x: e.x, y: e.y, r: e.r })) continue

      e.hp -= b.damage
      b.active = false
      if (e.hp <= 0) {
        e.active = false
        awardKill(world, e.points, e.waveId)
      }
      break
    }
  }
}

function stepPlayerHazards(world: World): void {
  const p = world.player
  if (p.iFrames > 0 || world.session.runOver) return

  let damage = 0

  for (const e of world.enemies) {
    if (!e.active) continue
    if (e.age < CONTACT_ARM_TIME) continue
    if (!circleCircle({ x: p.x, y: p.y, r: p.hitboxR }, { x: e.x, y: e.y, r: e.r })) continue
    damage = Math.max(damage, e.contactDamage)
  }

  for (const b of world.enemyBullets) {
    if (!b.active) continue
    if (!circleCircle({ x: p.x, y: p.y, r: p.hitboxR }, { x: b.x, y: b.y, r: b.r })) continue
    damage = Math.max(damage, b.damage)
    b.active = false
  }

  if (damage > 0) applyPlayerDamage(world, damage)
}

function stepDeathHold(world: World, dt: number): void {
  if (world.session.endHold > 0) {
    world.session.endHold = Math.max(0, world.session.endHold - dt)
  }
  if (world.session.deathFlash > 0) {
    world.session.deathFlash = Math.max(0, world.session.deathFlash - dt)
  }
}

export function stepWorld(world: World, dt: number, commands: Commands): void {
  if (world.session.paused) return

  if (world.session.runOver) {
    stepDeathHold(world, dt)
    return
  }

  stepPlayer(world, dt, commands)
  stepBomb(world, commands)
  stepPlayerBullets(world, dt)
  stepEnemyBullets(world, dt)
  stepFire(world, commands)
  stepWaves(world, dt)
  stepEnemies(world, dt)
  stepPlayerBulletHits(world)
  stepPlayerHazards(world)

  world.session.elapsed += dt
}

/** True when the Run is over and the death beat has finished. */
export function isRunReadyForResults(world: World): boolean {
  return world.session.runOver && world.session.endHold <= 0
}
