import { BAND, PLAYER_ACCEL, PLAYER_DECEL, PLAYER_MAX_SPEED } from './constants'
import type { Commands } from '../input/commands'
import type { World } from './types'

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v))
}

export function stepWorld(world: World, dt: number, commands: Commands): void {
  if (world.session.paused) return

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
    const rate = Math.abs(target) > Math.abs(current) || Math.sign(target) === Math.sign(current)
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

  world.session.elapsed += dt
}
