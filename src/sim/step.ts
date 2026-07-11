import type { Commands } from '../input/commands'
import { circleAabb, circleCircle } from './collision'
import {
  BOMB_DAMAGE,
  COLOSSUS,
  COMBO_WINDOW,
  CONTACT_ARM_TIME,
  CULL_X_MAX,
  CULL_Y_MIN,
  DART,
  GRAZE_COMBO_TOPUP,
  GRAZE_RADIUS_BONUS,
  GRAZE_SCORE,
  MAGNET_MAX_SPEED,
  MAGNET_RADIUS,
  DEATH_HOLD,
  DROP_CHANCE,
  DROP_WEIGHTS,
  DRONE,
  ENEMY_BULLET_DAMAGE,
  ENEMY_BULLET_R,
  GUNNER,
  HOLD_Y,
  IFRAMES_BOMB,
  IFRAMES_RESPAWN,
  IFRAMES_SHIELD,
  MAX_POWERUPS,
  MERCY_CLEAR_R,
  PLAYER_ACCEL,
  PLAYER_DECEL,
  PLAYER_MAX_SPEED,
  POWERUP_SCORE,
  PRISM,
  RATE_UP_COOLDOWN_MULT,
  RATE_UP_DURATION,
  RAZOR,
  RESPAWN,
  SCORE_MULT_DURATION,
  SCORE_MULT_KILL,
  SET_PIECE_STREAM_MULT,
  SIDECAR,
  SPAWN_Y,
  SPREAD_UP_DURATION,
  SPREAD_UP_OFFSET,
  WAVE_CLEAR_WINDOW,
  WAVE_GAP,
  comboMultiplier,
  enemyFireCooldownScale,
  enemyHpScale,
  enemyShotSpeedScale,
  eventTimeScale,
  playerMoveBounds,
  streamSpeedForWave,
  noDamageWaveBonus,
  waveClearBonus,
  waveMultiplier,
} from './constants'
import { isSetPieceWave, patternById, patternForWave, type PathId, type SpawnEvent } from './patterns'
import type {
  Enemy,
  EnemyBullet,
  EnemyClass,
  EnemyKind,
  PlayerBullet,
  Powerup,
  PowerupType,
  World,
} from './types'
import { baseHitIFrames, shipMoveMult } from './metaModifiers'
import { pushPresentation } from './presentation'
import { shipKit } from './shipKits'
import { weaponFor, weaponTierForWCells } from './weapons'

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v))
}

function tickTimer(remaining: number, dt: number): number {
  if (remaining <= 0) return 0
  const next = remaining - dt
  return next <= 1e-9 ? 0 : next
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

function activePowerupCount(world: World): number {
  let n = 0
  for (const p of world.powerups) if (p.active) n += 1
  return n
}

function acquirePowerup(world: World): Powerup | null {
  for (const p of world.powerups) {
    if (!p.active) return p
  }
  return null
}

function pickWeightedPowerup(world: World, types?: PowerupType[]): PowerupType {
  if (types && types.length > 0) {
    const idx = Math.min(types.length - 1, Math.floor(world.rng() * types.length))
    return types[idx]!
  }
  const total = DROP_WEIGHTS.reduce((sum, entry) => sum + entry.weight, 0)
  let roll = world.rng() * total
  for (const entry of DROP_WEIGHTS) {
    roll -= entry.weight
    if (roll < 0) return entry.type
  }
  return DROP_WEIGHTS[DROP_WEIGHTS.length - 1]!.type
}

export function spawnPowerup(world: World, type: PowerupType, x: number, y: number): boolean {
  if (activePowerupCount(world) >= MAX_POWERUPS) return false
  const slot = acquirePowerup(world)
  if (!slot) return false
  slot.active = true
  slot.type = type
  slot.x = x
  slot.y = y
  world.powerupDryElapsed = 0
  return true
}

function tryDropOnKill(world: World, enemy: Pick<Enemy, 'class' | 'x' | 'y'>): void {
  if (activePowerupCount(world) >= MAX_POWERUPS) return

  const pityEligible = enemy.class === 'grunt' || enemy.class === 'elite' || enemy.class === 'set_piece'
  const pityForce = pityEligible && world.powerupDryElapsed >= world.meta.pitySeconds
  const chance = Math.min(1, DROP_CHANCE[enemy.class] * world.meta.dropChanceMult)
  if (!pityForce && world.rng() >= chance) return

  const type = pickWeightedPowerup(world)
  spawnPowerup(world, type, enemy.x, enemy.y)
}

function applyPowerup(world: World, powerup: Powerup): void {
  const player = world.player
  if (powerup.type === 'shield') player.shield = true
  if (powerup.type === 'bomb_stock') player.bombs = Math.min(player.maxBombs, player.bombs + 1)
  if (powerup.type === 'repair') player.hp = Math.min(player.maxHp, player.hp + 1)
  if (powerup.type === 'rate_up') player.rateUp = RATE_UP_DURATION
  if (powerup.type === 'spread_up') player.spreadUp = SPREAD_UP_DURATION
  if (powerup.type === 'score_mult') player.scoreMult = SCORE_MULT_DURATION
  world.session.score += POWERUP_SCORE
  world.powerupDryElapsed = 0
  pushPresentation(world.presentation, { type: 'pickup', x: powerup.x, y: powerup.y })
}

function stepPowerups(world: World, dt: number): void {
  const player = world.player
  for (const powerup of world.powerups) {
    if (!powerup.active) continue
    powerup.y -= world.streamSpeed * dt

    const dx = player.x - powerup.x
    const dy = player.y - powerup.y
    const dist = Math.hypot(dx, dy)
    if (dist > 1e-6 && dist < MAGNET_RADIUS && !world.session.runOver) {
      const pull = MAGNET_MAX_SPEED * (1 - (dist / MAGNET_RADIUS) * 0.65)
      powerup.x += (dx / dist) * pull * dt
      powerup.y += (dy / dist) * pull * dt
    }

    if (!onPlayfield(powerup.x, powerup.y)) {
      powerup.active = false
      continue
    }
    if (!circleCircle({ x: player.x, y: player.y, r: player.hitboxR }, powerup)) continue
    applyPowerup(world, powerup)
    powerup.active = false
  }
}

function onPlayfield(x: number, y: number): boolean {
  return y >= CULL_Y_MIN && y <= SPAWN_Y && Math.abs(x) <= CULL_X_MAX
}

function wCellsForEnemy(enemyClass: EnemyClass): number {
  if (enemyClass === 'set_piece') return 15
  if (enemyClass === 'elite') return 5
  if (enemyClass === 'grunt') return 2
  return 1
}

function awardKill(world: World, enemy: Pick<Enemy, 'class' | 'points' | 'waveId' | 'x' | 'y'>): void {
  const session = world.session
  session.kills += 1

  session.combo += 1
  session.comboTimer = COMBO_WINDOW
  if (session.combo > session.bestCombo) session.bestCombo = session.combo

  const tierBefore = weaponTierForWCells(world.player.wCells)
  world.player.wCells += wCellsForEnemy(enemy.class) * world.meta.wCellEarnMult
  if (weaponTierForWCells(world.player.wCells) > tierBefore) {
    pushPresentation(world.presentation, { type: 'tier_up', x: world.player.x, y: world.player.y })
  }

  const mult = waveMultiplier(enemy.waveId > 0 ? enemy.waveId : session.wave)
  let killScore = enemy.points * mult * comboMultiplier(session.combo)
  if (world.player.scoreMult > 0) killScore *= SCORE_MULT_KILL
  session.score += Math.floor(killScore)
  if (enemy.waveId === session.wave) {
    world.waves.waveKilled += 1
  }
  pushPresentation(world.presentation, { type: 'kill', x: enemy.x, y: enemy.y })
  tryDropOnKill(world, enemy)
}

const COMBO_BREAK_MIN = 5

function breakCombo(world: World): void {
  const session = world.session
  if (session.combo >= COMBO_BREAK_MIN) {
    pushPresentation(world.presentation, {
      type: 'combo_break',
      x: world.player.x,
      y: world.player.y,
    })
  }
  session.combo = 0
  session.comboTimer = 0
}

function stepCombo(world: World, dt: number): void {
  const session = world.session
  if (session.combo <= 0) return
  session.comboTimer -= dt
  if (session.comboTimer <= 0) breakCombo(world)
}

function stepGraze(world: World): void {
  const p = world.player
  if (p.iFrames > 0 || world.session.runOver) return
  const grazeR = p.hitboxR + GRAZE_RADIUS_BONUS
  for (const b of world.enemyBullets) {
    if (!b.active || b.grazed) continue
    if (!circleCircle({ x: p.x, y: p.y, r: grazeR }, { x: b.x, y: b.y, r: b.r })) continue
    // A bullet inside the real hitbox is a hit, not a graze; leave it for hazards.
    if (circleCircle({ x: p.x, y: p.y, r: p.hitboxR }, { x: b.x, y: b.y, r: b.r })) continue
    b.grazed = true
    world.session.grazes += 1
    world.session.score += GRAZE_SCORE
    if (world.session.combo > 0 && world.session.comboTimer < GRAZE_COMBO_TOPUP) {
      world.session.comboTimer = GRAZE_COMBO_TOPUP
    }
    pushPresentation(world.presentation, { type: 'graze', x: b.x, y: b.y })
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

export function applyPlayerDamage(world: World, amount: number): void {
  if (amount <= 0 || world.session.runOver) return
  const p = world.player
  if (p.iFrames > 0) return

  if (p.shield) {
    p.shield = false
    p.iFrames = IFRAMES_SHIELD
    pushPresentation(world.presentation, { type: 'shield_break', x: p.x, y: p.y })
    return
  }

  p.hp -= amount
  world.waves.hpLostThisWave = true
  breakCombo(world)
  if (p.hp > 0) {
    p.iFrames = baseHitIFrames(p.shipId) + world.meta.hitIFramesBonus
    pushPresentation(world.presentation, { type: 'player_hit', x: p.x, y: p.y })
    return
  }

  p.hp = 0
  p.lives -= 1
  p.shield = false
  pushPresentation(world.presentation, { type: 'player_hit', x: p.x, y: p.y })
  pushPresentation(world.presentation, { type: 'life_loss', x: p.x, y: p.y })

  if (p.lives <= 0) {
    world.session.runOver = true
    world.session.endHold = DEATH_HOLD
    world.session.deathFlash = DEATH_HOLD
    p.vx = 0
    p.vy = 0
    p.iFrames = 0
    pushPresentation(world.presentation, { type: 'death', x: p.x, y: p.y })
    return
  }

  p.hp = p.maxHp
  p.x = RESPAWN.x
  p.y = RESPAWN.y
  p.vx = 0
  p.vy = 0
  p.iFrames = IFRAMES_RESPAWN
  p.shield = shipKit(p.shipId).startShieldEachLife
  mercyClearEnemyBullets(world)
}

function kindStats(kind: EnemyKind) {
  if (kind === 'colossus') return COLOSSUS
  if (kind === 'prism') return PRISM
  if (kind === 'razor') return RAZOR
  if (kind === 'sidecar') return SIDECAR
  if (kind === 'gunner') return GUNNER
  if (kind === 'dart') return DART
  return DRONE
}

function classForKind(kind: EnemyKind): EnemyClass {
  if (kind === 'colossus') return 'set_piece'
  if (kind === 'razor' || kind === 'prism') return 'elite'
  if (kind === 'gunner' || kind === 'sidecar') return 'grunt'
  return 'fodder'
}

function hitsEnemy(bullet: { x: number; y: number; r: number }, e: Enemy): boolean {
  if (e.halfW > 0 && e.halfH > 0) {
    return circleAabb(
      { x: bullet.x, y: bullet.y, r: bullet.r },
      { x: e.x, y: e.y, w: e.halfW * 2, h: e.halfH * 2 },
    )
  }
  return circleCircle({ x: bullet.x, y: bullet.y, r: bullet.r }, { x: e.x, y: e.y, r: e.r })
}

function hitsPlayerBody(player: { x: number; y: number; hitboxR: number }, e: Enemy): boolean {
  if (e.halfW > 0 && e.halfH > 0) {
    return circleAabb(
      { x: player.x, y: player.y, r: player.hitboxR },
      { x: e.x, y: e.y, w: e.halfW * 2, h: e.halfH * 2 },
    )
  }
  return circleCircle(
    { x: player.x, y: player.y, r: player.hitboxR },
    { x: e.x, y: e.y, r: e.r },
  )
}

export function acquireEnemySlot(world: World): Enemy | null {
  return acquireEnemy(world)
}

export function configureEnemy(e: Enemy, event: SpawnEvent, wave: number, streamSpeed: number): void {
  const stats = kindStats(event.kind)
  const hpScale = enemyHpScale(wave)
  const shotScale = enemyShotSpeedScale(wave)
  const cdScale = enemyFireCooldownScale(wave)

  e.active = true
  e.kind = event.kind
  e.class = classForKind(event.kind)
  e.laneX = event.x
  e.y = event.y
  e.r = stats.r
  e.halfW = event.kind === 'colossus' ? COLOSSUS.halfW : 0
  e.halfH = event.kind === 'colossus' ? COLOSSUS.halfH : 0
  e.hp = Math.max(1, Math.round(stats.hp * hpScale))
  e.maxHp = e.hp
  e.points = stats.points
  e.contactDamage = stats.contactDamage
  e.path = event.path
  e.pathPhase = 0
  e.waveId = wave
  e.age = 0
  e.hitFlash = 0
  e.phase = 'none'
  e.phaseElapsed = 0
  e.vy = -streamSpeed

  if (event.path === 'strafe_enter_left') {
    e.x = -11
  } else if (event.path === 'strafe_enter_right') {
    e.x = 11
  } else {
    e.x = event.x
  }

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
  } else if (event.kind === 'gunner') {
    e.fireInterval = GUNNER.fireInterval * cdScale
    e.fireCooldown = e.fireInterval * 0.5
    e.bulletSpeed = GUNNER.bulletSpeed * shotScale
    e.shotStyle = 'spread3'
  } else if (event.kind === 'sidecar') {
    e.fireInterval = SIDECAR.fireInterval * cdScale
    e.fireCooldown = e.fireInterval * 0.4
    e.bulletSpeed = SIDECAR.bulletSpeed * shotScale
    e.shotStyle = 'side_pair'
  } else if (event.kind === 'razor') {
    e.fireInterval = RAZOR.fireInterval * cdScale
    e.fireCooldown = e.fireInterval * 0.5
    e.bulletSpeed = RAZOR.bulletSpeed * shotScale
    e.shotStyle = 'aimed_burst'
  } else if (event.kind === 'prism') {
    e.fireInterval = PRISM.fireInterval * cdScale
    e.fireCooldown = e.fireInterval * 0.5
    e.bulletSpeed = PRISM.bulletSpeed * shotScale
    e.shotStyle = 'ring8'
  } else {
    e.fireInterval = COLOSSUS.fireInterval * cdScale
    e.fireCooldown = 0.4
    e.bulletSpeed = COLOSSUS.bulletSpeed * shotScale
    e.shotStyle = 'boss_spray'
    e.phase = 'spray'
    e.phaseElapsed = 0
  }

  if (event.path === 'dive') {
    e.vy = -streamSpeed * 1.6
  } else if (event.path === 'hold_and_shot') {
    e.vy = -streamSpeed * 0.85
  }
}

export function beginWave(world: World, waveIndex: number): void {
  world.session.wave = waveIndex
  let speed = streamSpeedForWave(waveIndex)
  if (isSetPieceWave(waveIndex)) speed *= SET_PIECE_STREAM_MULT
  world.streamSpeed = speed
  world.waves.phase = 'spawning'
  world.waves.patternElapsed = 0
  world.waves.nextEventIndex = 0
  world.waves.clearElapsed = 0
  world.waves.gapElapsed = 0
  world.waves.clearAwarded = false
  world.waves.hpLostThisWave = false
  world.waves.noDamageAwarded = false
  world.waves.waveSpawned = 0
  world.waves.waveKilled = 0
  world.waves.nextPowerupEventIndex = 0
}

function tryAwardNoDamage(world: World): void {
  const w = world.waves
  if (w.noDamageAwarded) return
  if (w.hpLostThisWave) return
  w.noDamageAwarded = true
  world.session.score += noDamageWaveBonus(world.session.wave)
}

function enterGap(world: World): void {
  tryAwardNoDamage(world)
  world.waves.phase = 'gap'
  world.waves.gapElapsed = 0
  if (world.waves.debugPatternId !== null) {
    world.waves.debugPatternId = null
    world.waves.suspended = true
  }
}

function tryAwardClear(world: World): void {
  const w = world.waves
  if (w.clearAwarded) return
  if (w.waveSpawned <= 0) return
  if (w.waveKilled < w.waveSpawned) return
  if (w.clearElapsed > WAVE_CLEAR_WINDOW) return
  w.clearAwarded = true
  world.session.score += waveClearBonus(world.session.wave)
  pushPresentation(world.presentation, {
    type: 'wave_clear',
    x: world.player.x,
    y: world.player.y,
  })
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
    const pattern =
      (w.debugPatternId !== null ? patternById(w.debugPatternId) : null) ??
      patternForWave(world.session.wave)
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

    const powerupEvents = pattern.powerupEvents ?? []
    while (w.nextPowerupEventIndex < powerupEvents.length) {
      const event = powerupEvents[w.nextPowerupEventIndex]!
      if (w.patternElapsed < event.t) break
      const type = pickWeightedPowerup(world, event.types)
      spawnPowerup(world, type, event.x, event.y)
      w.nextPowerupEventIndex += 1
    }

    const enemiesDone = w.nextEventIndex >= pattern.events.length
    const powerupsDone = w.nextPowerupEventIndex >= powerupEvents.length
    if (enemiesDone && powerupsDone) {
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
  const maxSpeed = PLAYER_MAX_SPEED * shipMoveMult(p.shipId) * world.meta.moveSpeedMult
  const bounds = playerMoveBounds(world.meta.bandMaxYBonus)

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
  p.rateUp = tickTimer(p.rateUp, dt)
  p.spreadUp = tickTimer(p.spreadUp, dt)
  p.scoreMult = tickTimer(p.scoreMult, dt)
}

function spawnPlayerShot(
  world: World,
  x: number,
  y: number,
  vx: number,
  vy: number,
  r: number,
  damage: number,
  pierce: number,
): boolean {
  const slot = acquirePlayerBullet(world)
  if (!slot) return false
  slot.active = true
  slot.x = x
  slot.y = y
  slot.vx = vx
  slot.vy = vy
  slot.r = r
  slot.damage = damage
  slot.pierce = pierce
  slot.hitEnemyIds = []
  return true
}

function stepFire(world: World, commands: Commands): void {
  const p = world.player
  if (!commands.fire || p.fireCooldown > 0) return

  const weapon = weaponFor(p.shipId, weaponTierForWCells(p.wCells))
  if (world.playerBullets.filter((b) => !b.active).length < weapon.shots.length) return

  for (const shot of weapon.shots) {
    const damage = shot.damage * world.meta.weaponDamageMult
    if (!spawnPlayerShot(world, p.x + shot.offsetX, p.y, shot.vx, shot.vy, shot.r, damage, shot.pierce)) return
  }

  if (p.spreadUp > 0) {
    const primary = weapon.shots[0]!
    const speed = Math.max(...weapon.shots.map((s) => Math.hypot(s.vx, s.vy)))
    const r = primary.r
    spawnPlayerShot(world, p.x - SPREAD_UP_OFFSET, p.y, 0, speed, r, 1, 0)
    spawnPlayerShot(world, p.x + SPREAD_UP_OFFSET, p.y, 0, speed, r, 1, 0)
  }

  p.fireCooldown = p.rateUp > 0 ? weapon.cooldown * RATE_UP_COOLDOWN_MULT : weapon.cooldown
}

function stepBomb(world: World, commands: Commands): void {
  if (!commands.bomb) return
  const p = world.player
  if (p.bombs <= 0) return

  p.bombs -= 1
  p.iFrames = Math.max(p.iFrames, IFRAMES_BOMB)
  pushPresentation(world.presentation, { type: 'bomb', x: p.x, y: p.y })

  for (const b of world.enemyBullets) {
    if (b.active && onPlayfield(b.x, b.y)) b.active = false
  }

  for (const e of world.enemies) {
    if (!e.active || !onPlayfield(e.x, e.y)) continue
    e.hp -= BOMB_DAMAGE
    if (e.hp <= 0) {
      e.active = false
      awardKill(world, e)
    }
  }
}

function stepPlayerBullets(world: World, dt: number): void {
  for (const b of world.playerBullets) {
    if (!b.active) continue
    b.x += b.vx * dt
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

function spawnEnemyBullet(
  world: World,
  x: number,
  y: number,
  vx: number,
  vy: number,
): boolean {
  const bullet = acquireEnemyBullet(world)
  if (!bullet) return false
  bullet.active = true
  bullet.x = x
  bullet.y = y
  bullet.vx = vx
  bullet.vy = vy
  bullet.r = ENEMY_BULLET_R
  bullet.damage = ENEMY_BULLET_DAMAGE
  bullet.grazed = false
  return true
}

function fireEnemyShot(world: World, e: Enemy): void {
  if (e.shotStyle === 'none') return

  if (e.shotStyle === 'down') {
    spawnEnemyBullet(world, e.x, e.y, 0, -e.bulletSpeed)
    return
  }

  if (e.shotStyle === 'side_pair') {
    spawnEnemyBullet(world, e.x, e.y, -e.bulletSpeed, 0)
    spawnEnemyBullet(world, e.x, e.y, e.bulletSpeed, 0)
    return
  }

  if (e.shotStyle === 'aimed_burst') {
    const px = world.player.x
    const py = world.player.y
    const dx = px - e.x
    const dy = py - e.y
    const base = Math.atan2(dx, -dy)
    const count = RAZOR.burstCount
    const spread = 0.28
    for (let i = 0; i < count; i++) {
      const u = i / (count - 1)
      const a = base + (u - 0.5) * spread
      spawnEnemyBullet(world, e.x, e.y, Math.sin(a) * e.bulletSpeed, -Math.cos(a) * e.bulletSpeed)
    }
    return
  }

  if (e.shotStyle === 'ring8') {
    const count = PRISM.ringCount
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2
      spawnEnemyBullet(world, e.x, e.y, Math.cos(a) * e.bulletSpeed, Math.sin(a) * e.bulletSpeed)
    }
    return
  }

  if (e.shotStyle === 'boss_spray') {
    const angles = [-0.55, -0.28, 0, 0.28, 0.55]
    for (const a of angles) {
      spawnEnemyBullet(world, e.x, e.y, Math.sin(a) * e.bulletSpeed, -Math.cos(a) * e.bulletSpeed)
    }
    return
  }

  const angles = [-0.35, 0, 0.35]
  for (const a of angles) {
    spawnEnemyBullet(world, e.x, e.y, Math.sin(a) * e.bulletSpeed, -Math.cos(a) * e.bulletSpeed)
  }
}

function advancePath(e: Enemy, dt: number, streamSpeed: number): void {
  e.pathPhase += dt

  if (e.path === 'strafe_enter_left' || e.path === 'strafe_enter_right') {
    const speed = 10
    const dx = e.laneX - e.x
    if (Math.abs(dx) > 0.15) {
      e.x += Math.sign(dx) * Math.min(Math.abs(dx), speed * dt)
      e.vy = -streamSpeed * 0.35
      e.y += e.vy * dt
      return
    }
    e.x = e.laneX
    e.path = 'drift_down'
  }

  const path: PathId = e.path

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

function stepEnemyPhase(e: Enemy, dt: number): void {
  if (e.shotStyle !== 'boss_spray') return
  e.phaseElapsed += dt
  if (e.phase === 'spray' && e.phaseElapsed >= COLOSSUS.sprayDuration) {
    e.phase = 'pause'
    e.phaseElapsed = 0
    e.fireCooldown = 999
    return
  }
  if (e.phase === 'pause' && e.phaseElapsed >= COLOSSUS.pauseDuration) {
    e.phase = 'spray'
    e.phaseElapsed = 0
    e.fireCooldown = 0
  }
}

function stepEnemies(world: World, dt: number): void {
  for (const e of world.enemies) {
    if (!e.active) continue
    e.age += dt
    if (e.hitFlash > 0) e.hitFlash = Math.max(0, e.hitFlash - dt)
    advancePath(e, dt, world.streamSpeed)
    stepEnemyPhase(e, dt)

    const canFire = e.shotStyle !== 'boss_spray' || e.phase === 'spray'
    if (canFire && e.fireInterval > 0) {
      e.fireCooldown -= dt
      if (e.fireCooldown <= 0) {
        fireEnemyShot(world, e)
        e.fireCooldown = e.fireInterval
      }
    }

    const holdSetPiece = e.kind === 'colossus' && e.y <= HOLD_Y + 0.05
    const entering =
      e.path === 'strafe_enter_left' || e.path === 'strafe_enter_right'
    if (!holdSetPiece && !entering && (e.y < CULL_Y_MIN || Math.abs(e.x) > CULL_X_MAX)) {
      e.active = false
    }
  }
}

function stepPlayerBulletHits(world: World): void {
  for (const b of world.playerBullets) {
    if (!b.active) continue
    for (const e of world.enemies) {
      if (!e.active) continue
      if (b.hitEnemyIds.includes(e.id)) continue
      if (!hitsEnemy(b, e)) continue

      e.hp -= b.damage
      e.hitFlash = 0.09
      b.hitEnemyIds.push(e.id)
      if (b.pierce > 0) b.pierce -= 1
      else b.active = false
      if (e.hp <= 0) {
        e.active = false
        awardKill(world, e)
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
    if (!hitsPlayerBody(p, e)) continue
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

/** Boss bar read model: set-piece with highest maxHp, if any active. */
export function bossBarFromWorld(world: World): { hp: number; maxHp: number } | null {
  let best: Enemy | null = null
  for (const e of world.enemies) {
    if (!e.active || e.class !== 'set_piece') continue
    if (!best || e.maxHp > best.maxHp) best = e
  }
  if (!best) return null
  return { hp: Math.max(0, best.hp), maxHp: best.maxHp }
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

  world.powerupDryElapsed += dt

  stepPlayer(world, dt, commands)
  stepCombo(world, dt)
  stepBomb(world, commands)
  stepPlayerBullets(world, dt)
  stepEnemyBullets(world, dt)
  stepFire(world, commands)
  stepWaves(world, dt)
  stepEnemies(world, dt)
  stepPlayerBulletHits(world)
  stepPowerups(world, dt)
  stepGraze(world)
  stepPlayerHazards(world)

  world.session.elapsed += dt
}

/** True when the Run is over and the death beat has finished. */
export function isRunReadyForResults(world: World): boolean {
  return world.session.runOver && world.session.endHold <= 0
}
