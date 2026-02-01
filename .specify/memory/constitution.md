<!--
## Sync Impact Report

**Version Change**: 0.0.0 → 1.0.0 (Initial ratification)

**Modified Principles**: N/A (Initial version)

**Added Sections**:
- Core Principles (5 game-specific principles)
- Technical Constraints
- Development Workflow
- Governance

**Removed Sections**: N/A (Initial version)

**Templates Requiring Updates**:
- `.specify/templates/plan-template.md` ✅ Compatible (Constitution Check section present)
- `.specify/templates/spec-template.md` ✅ Compatible (User scenarios align with Player Experience principle)
- `.specify/templates/tasks-template.md` ✅ Compatible (Phased approach aligns with Incremental Features principle)

**Follow-up TODOs**: None
-->

# TCFU (They Came From Uranus) Constitution

## Core Principles

### I. Performance First

All gameplay code MUST maintain 60 FPS on target platforms. Performance is non-negotiable for arcade games.

- Frame budget awareness: No single system may consume more than 4ms per frame
- Object pooling MUST be used for frequently spawned entities (projectiles, enemies, effects)
- Avoid runtime allocations in hot paths (update loops, collision handlers)
- Profile before optimizing; measure after changes

**Rationale**: Arcade shooters require consistent, responsive gameplay. Frame drops destroy player experience and game feel.

### II. Clean Architecture

Game code MUST follow established architectural patterns: Entity-Component separation, System-based logic, Event-driven communication.

- Entities are data containers (Player, Enemy, Projectile)
- Systems contain logic and operate on entities (WeaponsSystem, SpawnerSystem, WaveSystem)
- Scenes orchestrate systems and handle lifecycle
- Cross-system communication MUST use Phaser events, not direct references
- Configuration MUST be centralized in GameConfig.ts

**Rationale**: Separation of concerns enables independent testing, easier debugging, and safe feature additions without breaking existing systems.

### III. Incremental Features

Features MUST be addable without modifying unrelated systems. New content expands, not rewrites.

- New enemy types extend Enemy base class
- New powerups extend PowerUp base class and register with PowerUpSystem
- New UI elements add to UIScene without restructuring existing HUD
- Event-based integration preferred over tight coupling

**Rationale**: Games evolve through content addition. Architecture must support adding waves, enemies, powerups, and mechanics without regression risk.

### IV. Player Experience

Every feature MUST consider player perception and feedback. Silent failures are forbidden in player-facing systems.

- Visual feedback for all player actions (shooting, collecting, taking damage)
- Audio cues for state changes (powerup collected, shield absorbed, wave start)
- Clear UI communication of game state (lives, bombs, active effects, score)
- Responsive controls: Input MUST feel immediate (no input buffering delays)
- Graceful degradation on mobile (touch controls MUST work reliably)

**Rationale**: Player experience is the product. Technical correctness without perceptible feedback is incomplete implementation.

### V. Code Quality

Code MUST be maintainable, type-safe, and follow project conventions.

- TypeScript strict mode enforced; no `any` types without justification
- ESLint rules MUST pass before commit
- Physics body checks required (instanceof guard before property access)
- Systems MUST implement ISystem interface and clean up in destroy()
- Scenes MUST clean up event listeners in shutdown()
- No comments unless logic is non-obvious; code should be self-documenting

**Rationale**: Technical debt compounds. Consistent quality standards prevent erosion of codebase maintainability.

## Technical Constraints

**Tech Stack** (locked):
- Phaser 3.90.0 - Game framework
- TypeScript 5.x - Type-safe development
- Vite - Build tooling
- Arcade Physics - Simple, performant collision

**Canvas Specifications**:
- Resolution: 360x640 pixels (portrait mobile-first)
- Pixel art mode enabled (no anti-aliasing)
- No gravity (space shooter context)

**Browser Targets**:
- Modern browsers with ES2020 support
- Mobile Safari and Chrome (touch controls)

**Storage**:
- localStorage only for persistence (high scores, settings)
- No backend dependencies; fully client-side

## Development Workflow

### Before Implementation

1. Read relevant system code before modifying
2. Check GameConfig.ts for existing constants before adding new ones
3. Verify event naming follows existing patterns

### During Implementation

1. Run `npm run lint` and `npm run typecheck` frequently
2. Test on both desktop (keyboard) and mobile (touch) if UI-related
3. Monitor performance with browser dev tools for gameplay changes

### Before Commit

1. `npm run lint` MUST pass
2. `npm run typecheck` MUST pass
3. Manual gameplay test for affected features
4. Conventional commit format: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`

### Prohibited Actions

- NEVER commit with failing lint or typecheck
- NEVER start dev server without explicit user request
- NEVER auto-commit without explicit user request
- NEVER add dependencies without justification

## Governance

This constitution supersedes informal practices. All feature work MUST align with these principles.

**Amendment Process**:
1. Propose change with rationale
2. Document impact on existing code
3. Update version following semver (MAJOR: principle removal/redefinition, MINOR: new principle/expansion, PATCH: clarification)
4. Update dependent templates if affected

**Compliance**:
- All PRs MUST verify alignment with applicable principles
- Constitution violations require explicit justification in PR description
- Use CLAUDE.md for runtime development guidance

**Version**: 1.0.0 | **Ratified**: 2026-02-01 | **Last Amended**: 2026-02-01
