# TCFU Development Guide

## Critical Rules

- **NEVER start the dev server** (`npm run dev`) unless explicitly asked by the user

## Project Overview

TCFU (They Came From Uranus) is a space shooter game built with Phaser 3.90.0 and TypeScript. The game features a player
ship fighting against alien enemies in a classic arcade-style vertical shooter format.

## Project Structure

- `src/`: TypeScript game code (Phaser). Entities, systems, and scenes live under `src/game/**`.
- `public/`: Static assets served as-is.
- `dist/`: Build output (do not edit).
- `vite/`: Vite configs (`config.dev.mjs`, `config.prod.mjs`).
- Root: `index.html`, `eslint.config.mjs`, `tsconfig.json`.

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

### Core Structure

- **Entry Point**: `src/main.ts` → `src/game/main.ts` initializes Phaser game
- **Game Container**: HTML element `#game-container` hosts the 360x640 pixel game
- **Physics**: Arcade physics with no gravity, debug mode enabled in development
- **Asset Management**: JSON-driven asset loading via `public/assets/data/assets.json` and `public/assets/data/animations.json`

### Scene Architecture

Three-scene system:

1. **BootScene**: Asset preloading and animation creation from JSON data
2. **GameScene**: Main gameplay logic, entity management, systems coordination
3. **UIScene**: UI overlay launched alongside GameScene

### Entity System

- **Player**: Container-based entity with ship + engine sprites, keyboard controls
- **Enemies**: Group-managed enemy entities (KlaedScout type)
- **Weapons**: ProjectilesGroup system with cooldown-based firing

### System Architecture

- **PlayerWeaponsSystem**: Handles weapon firing events and projectile creation
- **EnemySpawnerSystem**: Manages enemy spawn logic
- Scene-based event system for entity communication (`player-weapon-fired` event)

### Asset Pipeline

- **Images**: Located in `public/assets/images/`
- **Spritesheets**: Configured with frameWidth/frameHeight in assets.json
- **Animations**: JSON-defined with key, frames, frameRate, repeat properties
- **Loading**: Phaser pack-based loading system via BootScene

### Code Patterns

- **TypeScript**: Strict mode enabled, ES2020 target
- **Scene References**: Systems access entities via `(scene as any).player` pattern
- **Physics**: Arcade body type checking before property access
- **Events**: Phaser events system for inter-system communication
- **Containers**: Player uses Container for multi-sprite composition

### Build Configuration

- **Vite**: Separate dev/prod configs in `vite/` directory
- **Chunking**: Phaser separated into its own chunk for optimal loading
- **TypeScript**: Bundler module resolution, no emit (Vite handles compilation)

## Code Style

- Indentation: 4 spaces (no tabs)
- Semicolons: omit; prefer no trailing semicolons
- Imports: alphabetical, grouped order (enforced by `eslint-plugin-import`)
- Prefer `const`, object destructuring, optional chaining/nullish coalescing
- Keep Phaser-specific `any` usage minimal
- Scene classes: PascalCase with "Scene" suffix
- Entity classes: PascalCase
- System classes: PascalCase with "System" suffix
- Asset keys: kebab-case
- File extensions: `.ts` for TypeScript, `.mjs` for Vite configs

## Testing Guidelines

No test runner configured yet. If adding tests:
- Unit: Vitest (`*.spec.ts` beside sources, e.g., `src/game/entities/Enemy.spec.ts`)
- Smoke/E2E: Playwright against `npm run dev`
- Aim for coverage on core systems (spawner, weapons) and scene lifecycle hooks

## Commit & PR Guidelines

- Use Conventional Commits: `feat:`, `fix:`, `chore:`, `refactor:`, `docs:`
- PRs should include: concise description, screenshots/gifs for gameplay/UI changes, steps to test, and linked issues
- Run `npm run lint` and `npm run typecheck` before opening a PR; builds must be clean

## Security & Configuration

- Do not commit credentials. Keep assets in `public/` and large binaries out of Git.
- Avoid editing `dist/`. For server port changes, update `vite/config.*.mjs`.
