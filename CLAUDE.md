# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Critical Rules

- **NEVER start the dev server** (`npm run dev`) unless explicitly asked by the user

## Project Overview

TCFU (They Came From Uranus) is a space shooter game built with Phaser 3.90.0 and TypeScript. The game features a player ship fighting against alien enemies in a classic arcade-style vertical shooter with an endless wave system.

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

1. **BootScene**: Asset preloading via JSON pack files (`public/assets/data/assets.json`, `animations.json`)
2. **MainMenuScene**: Title screen with Play button, displays high score
3. **GameScene**: Main gameplay - spawns entities, manages systems, handles collisions
4. **UIScene**: HUD overlay (score, lives, wave) launched alongside GameScene

### Entity System

- **Player** (`src/game/entities/Player.ts`): Container-based (ship + engine sprites), keyboard controls (arrows + space), invincibility mechanic
- **Enemies** (`src/game/entities/`): Group-managed, currently KlaedScout type
- **Projectiles** (`src/game/entities/weapons/`): Physics group with auto-cleanup

### System Architecture

Systems implement `ISystem` interface (requires `destroy()` method):

- **PlayerWeaponsSystem**: Listens for `player-weapon-fired` event, creates projectiles with cooldown
- **EnemySpawnerSystem**: Timer-based spawning, responds to `wave-difficulty-changed` for spawn rate
- **WaveSystem**: Tracks kills, advances waves, emits difficulty scaling events
- **GameStateSystem**: Manages score, lives, emits `game-over` when lives depleted

### Event System

Scene-based Phaser events coordinate between systems:

| Event | Emitter | Payload | Purpose |
|-------|---------|---------|---------|
| `player-weapon-fired` | Player | - | Trigger projectile spawn |
| `enemy-destroyed` | GameScene | `{ points }` | Score + wave progress |
| `player-hit` | GameScene | - | Life lost |
| `wave-started` | WaveSystem | `{ currentWave, ... }` | UI update |
| `wave-difficulty-changed` | WaveSystem | `{ spawnRate, enemyVelocity }` | Spawner adjustment |
| `game-over` | GameStateSystem | - | End game state |
| `game-paused`/`game-resumed` | GameScene | - | Toggle pause state |
| `score-changed` | GameStateSystem | `{ score }` | UI update |
| `lives-changed` | GameStateSystem | `{ lives }` | UI update |

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
