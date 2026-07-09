import type { Commands } from '../input/commands'
import { circleCircle } from './collision'
import {
  BAND,
  CULL_X_MAX,
  CULL_Y_MIN,
  DRONE,
  DRONE_SPAWN_INTERVAL,
  PLAYER_ACCEL,
  PLAYER_DECEL,
  PLAYER_MAX_SPEED,
  PULSE_T0,
  SPAWN_LANES,
  SPAWN_Y,
  waveMultiplier,
} from './constants'
import type { Enemy, PlayerBullet, World } from './types'

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v))
}

function acquireBullet(world: World): PlayerBullet | null {
  for (const b of world.playerBullets) {
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

  const slot = acquireBullet(world)
  if (!slot) return

  slot.active = true
  slot.x = p.x
  slot.y = p.y
  slot.vy = PULSE_T0.bulletSpeed
  slot.r = PULSE_T0.bulletR
  slot.damage = PULSE_T0.damage
  p.fireCooldown = PULSE_T0.cooldown
}

function stepBullets(world: World, dt: number): void {
  for (const b of world.playerBullets) {
    if (!b.active) continue
    b.y += b.vy * dt
    if (b.y > SPAWN_Y + 2 || b.y < CULL_Y_MIN || Math.abs(b.x) > CULL_X_MAX) {
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
  world.spawnLane += 1

  slot.active = true
  slot.kind = 'drone'
  slot.x = x
  slot.y = SPAWN_Y
  slot.vy = -world.streamSpeed
  slot.r = DRONE.r
  slot.hp = DRONE.hp
  slot.points = DRONE.points

  world.spawnTimer = DRONE_SPAWN_INTERVAL
}

function stepEnemies(world: World, dt: number): void {
  for (const e of world.enemies) {
    if (!e.active) continue
    e.y += e.vy * dt
    if (e.y < CULL_Y_MIN || Math.abs(e.x) > CULL_X_MAX) {
      e.active = false
    }
  }
}

function stepCollisions(world: World): void {
  for (const b of world.playerBullets) {
    if (!b.active) continue
    for (const e of world.enemies) {
      if (!e.active) continue
      if (!circleCircle({ x: b.x, y: b.y, r: b.r }, { x: e.x, y: e.y, r: e.r })) continue

      e.hp -= b.damage
      b.active = false
      if (e.hp <= 0) {
        e.active = false
        world.session.kills += 1
        const mult = waveMultiplier(world.session.wave)
        world.session.score += Math.floor(e.points * mult)
      }
      break
    }
  }
}

export function stepWorld(world: World, dt: number, commands: Commands): void {
  if (world.session.paused) return

  stepPlayer(world, dt, commands)
  stepBullets(world, dt)
  stepFire(world, commands)
  stepSpawn(world, dt)
  stepEnemies(world, dt)
  stepCollisions(world)

  world.session.elapsed += dt
}
