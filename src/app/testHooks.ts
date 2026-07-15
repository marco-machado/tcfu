import { emptyCommands } from '../input/commands'
import { resetPresentationFx } from '../presentation/fxState'
import { debugSpawnEnemy } from '../sim/debugActions'
import { stepWorld } from '../sim/step'
import { ENEMY_KINDS } from '../sim/types'
import { getWorld } from '../sim/world'
import { useDebugStore } from './debugMode'
import { useSessionStore } from './sessionStore'

type TestHooks = {
  seed(value: number): void
  setState(name: string): void
  setPausedForScreenshot(paused: boolean): void
  setReducedMotion(enabled: boolean): void
  hideDebugUi(hidden: boolean): void
  reviewSnapshot(): {
    elapsed: number
    enemies: Array<{ kind: string; x: number; y: number }>
  }
}

declare global {
  interface Window {
    __THREE_GAME_TEST_HOOKS__?: TestHooks
  }
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

let pendingSeed: number | null = null

/** Deterministic weaving autofire pilot used to reach named states. */
function fastForward(seconds: number, invulnerable: boolean): void {
  const world = getWorld()
  const dt = 1 / 60
  let t = 0
  while (t < seconds && !world.session.runOver) {
    const c = emptyCommands()
    c.fire = true
    c.moveX = Math.sin(t * 1.1) * 0.85
    c.moveY = Math.sin(t * 0.4) * 0.45
    if (invulnerable) world.player.iFrames = Math.max(world.player.iFrames, 0.2)
    stepWorld(world, dt, c)
    t += dt
  }
}

function startSeededRun(): void {
  const store = useSessionStore.getState()
  useDebugStore.getState().setTimeScale(1)
  // Autofire keeps the live loop producing kills/FX during delayed captures.
  store.setSettings({ ...store.settings, autoFire: true })
  store.startRun()
  const world = getWorld()
  world.rng = mulberry32(pendingSeed ?? 1337)
  resetPresentationFx()
}

/** Field a spread of live drop types so captures show the reward families. */
function fieldPowerups(): void {
  const world = getWorld()
  const p = world.player
  // Upstream so they are still descending when a delayed capture lands.
  const spread: Array<{ type: (typeof world.powerups)[number]['type']; x: number; y: number }> = [
    { type: 'shield', x: p.x - 2.8, y: p.y + 9 },
    { type: 'score_mult', x: p.x + 2.8, y: p.y + 11 },
    { type: 'repair', x: p.x + 0.4, y: p.y + 13.5 },
  ]
  for (let i = 0; i < world.powerups.length && i < spread.length; i++) {
    const slot = world.powerups[i]!
    const def = spread[i]!
    slot.active = true
    slot.type = def.type
    slot.x = Math.max(-5.5, Math.min(5.5, def.x))
    slot.y = def.y
  }
}

/**
 * Deterministic state hooks for the canvas inspector and visual harnesses.
 * States: title, active-play, boss, fail, stress.
 */
export function installTestHooks(): void {
  if (!import.meta.env.DEV) return
  window.__THREE_GAME_TEST_HOOKS__ = {
    seed(value: number) {
      pendingSeed = value
      getWorld().rng = mulberry32(value)
    },
    setState(name: string) {
      const store = useSessionStore.getState()
      switch (name) {
        case 'title':
          store.setScreen('title')
          break
        case 'hangar':
          store.setScreen('hangar')
          break
        case 'active-play':
          startSeededRun()
          fastForward(27, true)
          fieldPowerups()
          break
        case 'stress':
          startSeededRun()
          fastForward(75, true)
          fieldPowerups()
          break
        case 'boss': {
          startSeededRun()
          const world = getWorld()
          for (let guard = 0; guard < 200 * 60; guard++) {
            const col = world.enemies.find((e) => e.active && e.kind === 'colossus')
            if (col && col.y <= 12.6) break
            fastForward(1 / 6, true)
          }
          break
        }
        case 'family-review': {
          startSeededRun()
          const world = getWorld()
          world.waves.suspended = true
          for (const enemy of world.enemies) enemy.active = false
          ENEMY_KINDS.forEach((kind, index) => {
            const enemy = debugSpawnEnemy(world, kind)
            if (!enemy) return
            enemy.x = -4.5 + (index % 4) * 3
            enemy.y = index < 4 ? 8.2 : 6.2
            enemy.vy = 0
            enemy.path = 'hold_and_shot'
            enemy.laneX = enemy.x
            enemy.fireInterval = 0
            enemy.fireCooldown = 999
            enemy.shotStyle = 'none'
          })
          useDebugStore.getState().setTimeScale(0)
          break
        }
        case 'impact': {
          // Column of fodder feeding continuous kills so bursts/rings are
          // live in any delayed capture frame.
          startSeededRun()
          fastForward(10, true)
          const world = getWorld()
          const p = world.player
          p.x = 0
          let slot = 0
          for (let i = 0; i < 24 && slot < world.enemies.length; i++) {
            const e = world.enemies[slot++]!
            e.active = true
            e.kind = 'drone'
            e.class = 'fodder'
            e.x = (i % 3 - 1) * 0.6
            e.y = p.y + 2.5 + i * 0.85
            e.vy = 0
            e.r = 0.4
            e.halfW = 0
            e.halfH = 0
            e.hp = 1
            e.maxHp = 1
            e.points = 100
            e.contactDamage = 0
            e.fireCooldown = 0
            e.fireInterval = 0
            e.bulletSpeed = 0
            e.path = 'drift_down'
            e.pathPhase = 0
            e.laneX = e.x
            e.waveId = world.session.wave
            e.shotStyle = 'none'
            e.phase = 'none'
            e.phaseElapsed = 0
            e.age = 1
            e.hitFlash = 0
          }
          fieldPowerups()
          break
        }
        case 'fail': {
          startSeededRun()
          fastForward(5, true)
          const world = getWorld()
          world.player.lives = 1
          world.player.hp = 1
          world.player.iFrames = 0
          world.player.shield = false
          const bullet = world.enemyBullets.find((b) => !b.active)
          if (bullet) {
            bullet.active = true
            bullet.grazed = false
            bullet.x = world.player.x
            bullet.y = world.player.y
            bullet.vx = 0
            bullet.vy = -1
            bullet.r = 0.15
            bullet.damage = 1
          }
          stepWorld(world, 1 / 60, emptyCommands())
          for (let i = 0; i < 20; i++) stepWorld(world, 1 / 60, emptyCommands())
          // Freeze the unobscured crash beat; the fail modal follows later in the hold.
          world.session.endHold = 999
          world.session.deathFlash = 1.35
          break
        }
        default:
          break
      }
    },
    setPausedForScreenshot(paused: boolean) {
      getWorld().session.paused = paused
    },
    setReducedMotion(enabled: boolean) {
      const store = useSessionStore.getState()
      store.setSettings({ ...store.settings, reducedMotion: enabled, screenShake: !enabled })
    },
    hideDebugUi(hidden: boolean) {
      useDebugStore.getState().setHidden(hidden)
    },
    reviewSnapshot() {
      const world = getWorld()
      return {
        elapsed: world.session.elapsed,
        enemies: world.enemies
          .filter((enemy) => enemy.active)
          .map(({ kind, x, y }) => ({ kind, x, y })),
      }
    },
  }
}
