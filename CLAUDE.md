# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Critical Rules

- **NEVER start the dev server** (`npm run dev`) unless explicitly asked by the user

## Project Overview

TCFU (They Came From Uranus) is a space shooter game built with Phaser 3.90.0 and TypeScript. The game features a player ship fighting against alien enemies in a classic arcade-style vertical shooter with an endless wave system, powerups, bombs, and score-based wave progression.

## Development Commands

```bash
npm ci              # Install exact dependencies
npm run dev         # Start Vite dev server on port 8080
npm run build       # Production build with terser and manual chunks
npm run lint        # Check ESLint issues
npm run lint:fix    # Fix ESLint issues
npm run typecheck   # Strict TypeScript checks with tsc
```

## Architecture

### Entry Point & Config

- `src/main.ts` → `src/game/main.ts` initializes Phaser game
- Game canvas: 360x640 pixels, pixel art mode, arcade physics (no gravity)
- All gameplay constants centralized in `src/game/config/GameConfig.ts`

### Scene Flow

Four-scene system:

1. **BootScene**: Loading screen with space background and progress bar, loads assets via JSON pack files (`public/assets/data/assets.json`, `animations.json`), dynamically creates all Phaser animations
2. **MainMenuScene**: Title screen with START button, CLEAR DATA button, displays high score, scrolling background
3. **GameScene**: Main gameplay - spawns entities, manages systems, handles collisions, pause/bomb controls
4. **UIScene**: HUD overlay launched alongside GameScene with multiple display sections

### Entity System

#### Player
- **Location**: `src/game/entities/Player.ts`
- Container-based (ship + engine sprites), keyboard controls (arrows + space)
- Features: invincibility mechanic with flash animation, speed bonus from powerups, diagonal movement support

#### Enemies
- **Base Class**: `src/game/entities/Enemy.ts` (abstract Container)
- **KlaedScout**: `src/game/entities/KlaedScout.ts` - animated ship + engine, Y-flipped for top-down

#### Projectiles
- **PlayerProjectile** (`src/game/entities/weapons/PlayerProjectile.ts`): Carries damage multiplier, velocity -400 (upward)
- **EnemyProjectile** (`src/game/entities/weapons/EnemyProjectile.ts`): Animated, velocity 210 (downward), auto-cleanup

#### PowerUps (10 Types)
Base class: `src/game/entities/powerups/PowerUp.ts` - Three categories: `INSTANT`, `PERMANENT`, `TIMED`

**Permanent (Stackable):**
| Type | Effect | Max Stacks |
|------|--------|------------|
| FireRateUp | Reduces cooldown 150ms/stack | 4 (min 200ms) |
| DamageUp | 1.5x damage multiplier/stack | 3 |
| SpreadShot | 3-angle spread pattern (-8, 0, +8 degrees) | 1 |
| SpeedUp | Adds movement speed bonus | 3 |

**Instant:**
| Type | Effect |
|------|--------|
| ExtraLife | +1 life (max 9) |
| Bomb | +1 bomb (max 3, starts with 1) |

**Timed (pausable):**
| Type | Duration | Effect |
|------|----------|--------|
| Invincibility | 5s | Damage immunity |
| Shield | 10s | Absorbs one hit |
| Magnet | 15s | Attracts powerups (120px radius) |
| ScoreMultiplier | 15s | 2x score |

### System Architecture

Systems implement `ISystem` interface (requires `destroy()` method):

- **PlayerWeaponsSystem**: Manages projectile spawning with cooldown, fire rate bonuses, spread shot, damage multiplier
- **EnemyWeaponsSystem**: Individual enemy fire timing, random cooldowns (2-4s), enemies start shooting at Wave 3
- **EnemySpawnerSystem**: Timer-based spawning, wave-scaled rates, formation spawning (1x1, 2x1, 3x1 from Wave 6+)
- **WaveSystem**: Score-based wave progression (base 500, +300/wave), emits difficulty scaling events
- **GameStateSystem**: Manages score with multiplier support, lives (3-9), game over detection
- **PowerUpSystem**: Random spawning (15s interval), enemy death drops (15% chance), magnet attraction, weighted type selection with exclusion for maxed powerups
- **PlayerPowerUpState**: Manages all active powerup effects, timed effect duration with pause support, shield consumption, bomb count

### Event System

Scene-based Phaser events coordinate between systems:

**Core Game Events:**
| Event | Emitter | Payload | Purpose |
|-------|---------|---------|---------|
| `player-weapon-fired` | Player | - | Trigger projectile spawn |
| `enemy-destroyed` | GameScene | `{ points, x, y }` | Score + wave progress + powerup drop |
| `player-hit` | GameScene | - | Life lost, trigger invincibility |
| `wave-started` | WaveSystem | `{ currentWave, scoreInWave, scoreRequired, spawnRate, enemyVelocity }` | UI update, difficulty scaling |
| `wave-difficulty-changed` | WaveSystem | `{ spawnRate, enemyVelocity }` | Spawner adjustment |
| `game-over` | GameStateSystem | - | End game state |
| `game-paused` / `game-resumed` | GameScene | - | Toggle pause state, pause powerup timers |
| `score-changed` | GameStateSystem | `{ score }` | UI update |
| `lives-changed` | GameStateSystem | `{ lives }` | UI update |

**Powerup Events:**
| Event | Emitter | Payload |
|-------|---------|---------|
| `powerup-collected` | GameScene | `{ type }` |
| `powerup-modifiers-changed` | PlayerPowerUpState | `{ fireRateBonuses, damageMultiplier, hasSpreadShot, speedBonuses }` |
| `powerup-timed-started` | PlayerPowerUpState | `{ type, duration }` |
| `powerup-timed-ended` | PlayerPowerUpState | `{ type }` |
| `powerup-shield-active` | PlayerPowerUpState | `true/false` |
| `powerup-shield-absorbed` | PlayerPowerUpState | - |
| `powerup-extra-life` | ExtraLife | - |
| `powerup-bomb-collected` | Bomb | - |
| `bombs-changed` | PlayerPowerUpState | `{ bombs }` |

**Bomb Events:**
| Event | Emitter | Purpose |
|-------|---------|---------|
| `bomb-activated` | GameScene | Player pressed B key |
| `screen-clear-activated` | GameScene | Destroys all enemies and enemy projectiles |

### Game Controls

| Key | Action |
|-----|--------|
| Arrow Keys | Move player |
| Space | Fire weapon |
| P / ESC | Pause/Resume game |
| B | Activate bomb (clears screen) |
| R | Restart (game over screen) |
| M | Main menu (pause/game over) |

Debug keys (when `GAME_CONFIG.debug = true`): Keys 1-0 spawn specific powerups for testing

### UI Elements

**HUD (Top Row):**
- Lives (top-left): `Lives: 3`
- Wave (top-center): `Wave 1`
- Score (top-right): `Score: 0`

**Powerup Status Row (Second Row):**
- Bombs: `BOM: ###` (filled/empty circles for 0-3)
- Damage: `DMG: ###` (stack indicators)
- Fire Rate: `FR: ####` (stack indicators)
- Speed: `SPD: ###` (stack indicators)

**Timed Effects Display (Bottom):**
- Horizontal bar for each active timed effect
- Shows short name (INV, SHLD, MAG, 2X) with animated progress bar
- Color-coded by effect type, repositions dynamically

**Announcements (Center Screen):**
- Wave announcements: `WAVE 2` with scale animation
- Powerup collected: `+1 BOMB` (stacked, color-coded)
- Shield absorbed: `SHIELD BLOCKED!` (cyan)

**Game Over Screen:**
- `GAME OVER` (red), optional `NEW HIGH SCORE!` (yellow)
- High score display, restart/menu instructions

**Pause Screen:**
- `PAUSED` (white), resume/menu/bomb instructions
- Debug key reference (if debug enabled)

### Asset Pipeline

- Images in `public/assets/images/`
- Spritesheets configured in `public/assets/data/assets.json` (frameWidth/frameHeight)
- Animations defined in `public/assets/data/animations.json` (key, frames, frameRate, repeat)
- Asset keys use kebab-case

## Code Style

- 4 spaces indentation, no semicolons
- Imports: alphabetical, grouped (enforced by eslint-plugin-import)
- Naming: PascalCase classes (Scene/System suffix), kebab-case asset keys
- Physics: Always check `body instanceof Phaser.Physics.Arcade.Body` before property access
- Containers: Use for multi-sprite entity composition (see Player.ts)
- Cleanup: Systems must clean up event listeners in `destroy()`, scenes in `shutdown()`

## Testing

No test runner configured. If adding tests:
- Unit: Vitest (`*.spec.ts` beside sources)
- E2E: Playwright against dev server

## Commit Guidelines

- Conventional Commits: `feat:`, `fix:`, `chore:`, `refactor:`, `docs:`
- Run `npm run lint` and `npm run typecheck` before committing
