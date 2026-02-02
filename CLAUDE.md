# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Critical Rules

- **NEVER start the dev server** (`npm run dev`) unless explicitly asked by the user

## Project Overview

TCFU (They Came From Uranus) is a space shooter game built with Phaser 3.90.0 and TypeScript. The game features a player ship fighting against alien enemies in a classic arcade-style vertical shooter with an endless wave system, powerups, bombs, and score-based wave progression.

See subdirectory CLAUDE.md files for detailed documentation:
- `src/game/CLAUDE.md` - Architecture, scenes, input, controls
- `src/game/entities/CLAUDE.md` - Player, enemies, projectiles, powerups
- `src/game/systems/CLAUDE.md` - Systems, events, UI elements

## Development Commands

```bash
npm ci              # Install exact dependencies
npm run dev         # Start Vite dev server on port 8080
npm run build       # Production build with terser and manual chunks
npm run lint        # Check ESLint issues
npm run lint:fix    # Fix ESLint issues
npm run typecheck   # Strict TypeScript checks with tsc
```

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
