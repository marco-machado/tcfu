# They Came From Uranus

A retro arcade-style vertical space shooter built with Phaser 3 and TypeScript.

## Features

- **Classic Arcade Gameplay**: Fight waves of alien enemies in an endless vertical shooter
- **Score-Based Wave Progression**: Waves advance based on score accumulated, with increasing difficulty
- **Mobile Touch Controls**: Relative touch movement with auto-fire on touch devices
- **10 Powerup Types**:
  - **Permanent**: Fire Rate Up, Damage Up, Spread Shot, Speed Up
  - **Instant**: Extra Life, Bomb
  - **Timed**: Invincibility, Shield, Magnet, Score Multiplier
- **Bomb System**: Screen-clearing bombs to escape tough situations
- **High Score Tracking**: Persistent high scores via localStorage
- **Pause System**: Full pause support including powerup timer preservation

## Controls

### Keyboard

| Key | Action |
|-----|--------|
| Arrow Keys | Move player |
| Space | Fire weapon |
| P / ESC | Pause/Resume |
| B | Activate bomb |
| R | Restart (game over) |
| M | Main menu |

### Mobile Touch

On touch devices, the game uses relative touch controls:
- **Movement**: Touch and drag on the left side of the screen - ship moves relative to finger movement
- **Fire**: Auto-fire enabled automatically on touch devices
- **Bomb**: Tap the bomb button (bottom right)
- **Pause**: Tap the pause button (top right)

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
- [MOBILE.md](./MOBILE.md) - Mobile touch controls implementation
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
