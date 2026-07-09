import type { Commands } from '../input/commands'
import { circleCircle } from './collision'
import {
  BAND,
  BOMB_DAMAGE,
  CULL_X_MAX,
  CULL_Y_MIN,
  DART,
  DRONE,
  DRONE_SPAWN_INTERVAL,
  ENEMY_BULLET_DAMAGE,
  ENEMY_BULLET_R,
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
  SPAWN_LANES,
  SPAWN_Y,
  waveMultiplier,
} from './constants'
import type { Enemy, EnemyBullet, PlayerBullet, World } from './types'

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

function awardKill(world: World, points: number): void {
  world.session.kills += 1
  const mult = waveMultiplier(world.session.wave)
  world.session.score += Math.floor(points * mult)
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

function stepPlayer(world: World, dt: number, commands: Commands): void {
  const p = world.player
  const maxSpeed = PLAYER_MAX_SPEED

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

  p.x = clamp(p.x, BAND.minX, BAND.maxX)
  p.y = clamp(p.y, BAND.minY, BAND.maxY)
  if (p.x <= BAND.minX || p.x >= BAND.maxX) p.vx = 0
  if (p.y <= BAND.minY || p.y >= BAND.maxY) p.vy = 0

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
      awardKill(world, e.points)
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
    b.y += b.vy * dt
    if (b.y < CULL_Y_MIN || b.y > SPAWN_Y + 2 || Math.abs(b.x) > CULL_X_MAX) {
      b.active = false
    }
  }
}

function stepSpawn(world: World, dt: number): void {
  world.spawnTimer -= dt
  if (world.spawnTimer > 0) return

  const slot = acquireEnemy(world)
  if (!slot) {
    world.spawnTimer = DRONE_SPAWN_INTERVAL
    return
  }

  const x = SPAWN_LANES[world.spawnLane % SPAWN_LANES.length]!
  const asDart = world.spawnLane % 2 === 1
  world.spawnLane += 1

  slot.active = true
  slot.x = x
  slot.y = SPAWN_Y
  slot.vy = -world.streamSpeed

  if (asDart) {
    slot.kind = 'dart'
    slot.r = DART.r
    slot.hp = DART.hp
    slot.points = DART.points
    slot.contactDamage = DART.contactDamage
    slot.fireInterval = DART.fireInterval
    slot.fireCooldown = DART.fireInterval * 0.5
    slot.bulletSpeed = DART.bulletSpeed
  } else {
    slot.kind = 'drone'
    slot.r = DRONE.r
    slot.hp = DRONE.hp
    slot.points = DRONE.points
    slot.contactDamage = DRONE.contactDamage
    slot.fireInterval = 0
    slot.fireCooldown = 0
    slot.bulletSpeed = 0
  }

  world.spawnTimer = DRONE_SPAWN_INTERVAL
}

function stepEnemies(world: World, dt: number): void {
  for (const e of world.enemies) {
    if (!e.active) continue
    e.y += e.vy * dt

    if (e.fireInterval > 0) {
      e.fireCooldown -= dt
      if (e.fireCooldown <= 0) {
        const bullet = acquireEnemyBullet(world)
        if (bullet) {
          bullet.active = true
          bullet.x = e.x
          bullet.y = e.y
          bullet.vy = -e.bulletSpeed
          bullet.r = ENEMY_BULLET_R
          bullet.damage = ENEMY_BULLET_DAMAGE
        }
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
        awardKill(world, e.points)
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

export function stepWorld(world: World, dt: number, commands: Commands): void {
  if (world.session.paused || world.session.runOver) return

  stepPlayer(world, dt, commands)
  stepBomb(world, commands)
  stepPlayerBullets(world, dt)
  stepEnemyBullets(world, dt)
  stepFire(world, commands)
  stepSpawn(world, dt)
  stepEnemies(world, dt)
  stepPlayerBulletHits(world)
  stepPlayerHazards(world)

  world.session.elapsed += dt
}
