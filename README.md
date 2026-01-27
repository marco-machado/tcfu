# They Came From Uranus

A retro arcade-style vertical space shooter built with Phaser 3 and TypeScript.

## Features

- **Classic Arcade Gameplay**: Fight waves of alien enemies in an endless vertical shooter
- **Score-Based Wave Progression**: Waves advance based on score accumulated, with increasing difficulty
- **10 Powerup Types**:
  - **Permanent**: Fire Rate Up, Damage Up, Spread Shot, Speed Up
  - **Instant**: Extra Life, Bomb
  - **Timed**: Invincibility, Shield, Magnet, Score Multiplier
- **Bomb System**: Screen-clearing bombs to escape tough situations
- **High Score Tracking**: Persistent high scores via localStorage
- **Pause System**: Full pause support including powerup timer preservation

## Controls

| Key | Action |
|-----|--------|
| Arrow Keys | Move player |
| Space | Fire weapon |
| P / ESC | Pause/Resume |
| B | Activate bomb |
| R | Restart (game over) |
| M | Main menu |

## Getting Started

```bash
# Install dependencies
npm ci

# Start development server
npm run dev

# Build for production
npm run build
```

## Tech Stack

- **Phaser 3.90.0** - Game framework
- **TypeScript** - Type-safe development
- **Vite** - Build tool and dev server

## Project Structure

```
src/game/
├── config/         # Game configuration constants
├── entities/       # Player, enemies, projectiles, powerups
├── scenes/         # Boot, MainMenu, Game, UI scenes
├── systems/        # Weapons, spawning, waves, powerups, game state
└── managers/       # High score persistence
```

## Documentation

- [CLAUDE.md](./CLAUDE.md) - Development guide for Claude Code
- [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) - Visual design specifications
- [UI_COMPONENTS.md](./UI_COMPONENTS.md) - UI component details
- [ASSET_REQUIREMENTS.md](./ASSET_REQUIREMENTS.md) - Asset creation guide
- [PLAN.md](./PLAN.md) - Development roadmap

## Development

```bash
npm run lint        # Check code style
npm run lint:fix    # Fix code style issues
npm run typecheck   # Type checking
```
